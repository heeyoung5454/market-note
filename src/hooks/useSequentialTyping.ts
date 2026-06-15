import { useEffect, useState } from "react";

type Options = {
  charMs?: number;
  linePauseMs?: number;
  startDelayMs?: number;
};

export function useSequentialTyping(
  lines: string[],
  active: boolean,
  { charMs = 18, linePauseMs = 350, startDelayMs = 500 }: Options = {}
) {
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [typingIndex, setTypingIndex] = useState(-1);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!active || lines.length === 0) {
      setTypedLines([]);
      setTypingIndex(-1);
      setIsDone(false);
      return;
    }

    setTypedLines(lines.map(() => ""));
    setTypingIndex(0);
    setIsDone(false);

    let cancelled = false;
    let lineIdx = 0;
    let charIdx = 0;
    let timeoutId = 0;

    const schedule = (fn: () => void, delay: number) => {
      timeoutId = window.setTimeout(fn, delay);
    };

    const tick = () => {
      if (cancelled) {
        return;
      }

      if (lineIdx >= lines.length) {
        setTypingIndex(-1);
        setIsDone(true);
        return;
      }

      const line = lines[lineIdx];
      charIdx += 1;
      setTypingIndex(lineIdx);
      setTypedLines((prev) => {
        const next = [...prev];
        next[lineIdx] = line.slice(0, charIdx);
        return next;
      });

      if (charIdx >= line.length) {
        lineIdx += 1;
        charIdx = 0;
        schedule(tick, linePauseMs);
      } else {
        schedule(tick, charMs);
      }
    };

    schedule(tick, startDelayMs);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [active, lines.join("\u0000"), charMs, linePauseMs, startDelayMs]);

  return { typedLines, typingIndex, isDone };
}
