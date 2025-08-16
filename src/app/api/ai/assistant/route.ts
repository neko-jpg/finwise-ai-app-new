import { NextResponse } from "next/server";
import { assistant, AssistantInput } from "@/ai/flows/assistant";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // The assistant flow expects a specific input shape.
    // We assume the client sends the full AssistantInput object.
    const result = await assistant(body as AssistantInput);
    return NextResponse.json(result);

  } catch (e: unknown) {
    const error = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error("Assistant API Error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
