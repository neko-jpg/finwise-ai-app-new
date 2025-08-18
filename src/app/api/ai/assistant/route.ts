import { NextResponse } from "next/server";
import { assistant, AssistantInput } from "@/ai/flows/assistant";
import { applyCorsHeaders, optionsResponse } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return optionsResponse(req);
}

export async function POST(req: Request) {
  let res: NextResponse;
  try {
    const body = await req.json();

    // The assistant flow expects a specific input shape.
    // We assume the client sends the full AssistantInput object.
    const result = await assistant(body as AssistantInput);
    res = NextResponse.json(result);
  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : "An unknown error occurred.";
    console.error("Assistant API Error:", error);
    res = NextResponse.json({ error }, { status: 500 });
  }
  return applyCorsHeaders(res, req);
}
