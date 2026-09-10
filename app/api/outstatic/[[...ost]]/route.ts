import { OutstaticApi } from "outstatic";

export const GET = OutstaticApi.GET;

export async function POST(
  request: Request,
  segmentData: Parameters<typeof OutstaticApi.POST>[1],
) {
  const response = await OutstaticApi.POST(request, segmentData);

  if (!response.ok) {
    let details = "";
    try {
      details = await response.clone().text();
    } catch {
      details = "Unable to read Outstatic error response.";
    }

    console.error("[Outstatic] Save/API request failed", {
      status: response.status,
      path: new URL(request.url).pathname,
      details,
    });
  }

  return response;
}
