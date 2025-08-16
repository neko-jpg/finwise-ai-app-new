import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export function defineFlow<In, Out>(
  name: string,
  schemas: { input: z.ZodType<In>; output: z.ZodType<Out> },
  handler: (input: In) => Promise<Out> | Out
) {
  return ai.defineFlow(
    {
      name,
      inputSchema: schemas.input,
      outputSchema: schemas.output,
    },
    handler
  );
}

export function definePrompt<In extends z.ZodTypeAny, Out extends z.ZodTypeAny>(
    options: {
        name: string;
        input: { schema: In };
        output: { schema: Out };
        prompt: string;
    }
) {
    return ai.definePrompt(options);
}
