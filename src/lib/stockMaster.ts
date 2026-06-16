import { inflateRawSync } from "node:zlib";

export type StockMasterEntry = {
  code: string;
  name: string;
  market: "KOSPI" | "KOSDAQ";
};

const KOSPI_URL =
  "https://new.real.download.dws.co.kr/common/master/kospi_code.mst.zip";
const KOSDAQ_URL =
  "https://new.real.download.dws.co.kr/common/master/kosdaq_code.mst.zip";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cachedMaster: StockMasterEntry[] | null = null;
let cachedAt = 0;
let loadingPromise: Promise<StockMasterEntry[]> | null = null;

function extractZipEntry(zipBuffer: Buffer): Buffer {
  const signature = zipBuffer.readUInt32LE(0);

  if (signature !== 0x04034b50) {
    throw new Error("Invalid KRX master zip file");
  }

  const compressionMethod = zipBuffer.readUInt16LE(8);
  const compressedSize = zipBuffer.readUInt32LE(18);
  const filenameLength = zipBuffer.readUInt16LE(26);
  const extraLength = zipBuffer.readUInt16LE(28);
  const dataOffset = 30 + filenameLength + extraLength;
  const compressed = zipBuffer.subarray(
    dataOffset,
    dataOffset + compressedSize
  );

  if (compressionMethod === 0) {
    return compressed;
  }

  if (compressionMethod === 8) {
    return inflateRawSync(compressed);
  }

  throw new Error(`Unsupported zip compression method: ${compressionMethod}`);
}

function decodeEucKr(buffer: Buffer): string {
  return new TextDecoder("euc-kr").decode(buffer);
}

function parseMasterText(
  text: string,
  fwfLen: number,
  market: StockMasterEntry["market"]
): StockMasterEntry[] {
  const entries: StockMasterEntry[] = [];

  for (const line of text.split("\n")) {
    const trimmed = line.replace(/\r$/, "");

    if (trimmed.length < fwfLen + 21) {
      continue;
    }

    const prefix = trimmed.slice(0, -fwfLen);
    const code = prefix.slice(0, 9).trim();
    const name = prefix.slice(21).trim();

    if (!/^[0-9A-Za-z]{6}$/.test(code) || !name) {
      continue;
    }

    entries.push({ code, name, market });
  }

  return entries;
}

async function downloadMaster(url: string, fwfLen: number, market: StockMasterEntry["market"]) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`KRX master download failed: ${response.status}`);
  }

  const zipBuffer = Buffer.from(await response.arrayBuffer());
  const mstBuffer = extractZipEntry(zipBuffer);
  const text = decodeEucKr(mstBuffer);

  return parseMasterText(text, fwfLen, market);
}

async function loadStockMaster(): Promise<StockMasterEntry[]> {
  const now = Date.now();

  if (cachedMaster && now - cachedAt < CACHE_TTL_MS) {
    return cachedMaster;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    const [kospi, kosdaq] = await Promise.all([
      downloadMaster(KOSPI_URL, 227, "KOSPI"),
      downloadMaster(KOSDAQ_URL, 221, "KOSDAQ"),
    ]);

    cachedMaster = [...kospi, ...kosdaq];
    cachedAt = Date.now();
    loadingPromise = null;

    return cachedMaster;
  })();

  try {
    return await loadingPromise;
  } catch (error) {
    loadingPromise = null;
    throw error;
  }
}

function getMatchScore(entry: StockMasterEntry, query: string) {
  const code = entry.code.toLowerCase();
  const name = entry.name.toLowerCase();

  if (code === query) {
    return 100;
  }

  if (name === query) {
    return 95;
  }

  if (code.startsWith(query)) {
    return 90;
  }

  if (name.startsWith(query)) {
    return 80;
  }

  if (code.includes(query)) {
    return 70;
  }

  if (name.includes(query)) {
    return 60;
  }

  return 0;
}

export async function searchStockMaster(
  query: string,
  limit = 20
): Promise<StockMasterEntry[]> {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  const master = await loadStockMaster();
  const results: { entry: StockMasterEntry; score: number }[] = [];

  for (const entry of master) {
    const score = getMatchScore(entry, normalized);

    if (score > 0) {
      results.push({ entry, score });
    }
  }

  return results
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.entry.name.localeCompare(b.entry.name, "ko");
    })
    .slice(0, limit)
    .map(({ entry }) => entry);
}

export async function getStockNameByCode(code: string): Promise<string | null> {
  const normalized = code.trim().toUpperCase();
  const master = await loadStockMaster();

  return (
    master.find((entry) => entry.code.toUpperCase() === normalized)?.name ?? null
  );
}
