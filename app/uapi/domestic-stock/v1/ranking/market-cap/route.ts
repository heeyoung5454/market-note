import { handleRankRequest } from "@/lib/handleRankRequest";

export async function GET(request: Request) {
  return handleRankRequest(request, "amount");
}
