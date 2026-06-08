import { getAccessToken } from "@/services/kis.service";

export async function GET() {
  const token = await getAccessToken();

  return Response.json(token);
}