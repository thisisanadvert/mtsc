'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting Muay Thai strikes from an image.
 *
 * - detectStrike - A function that takes an image data URI and returns the detected strike type.
 */

import { ai } from '@/ai/genkit';
import {
  DetectStrikeInput,
  DetectStrikeInputSchema,
  DetectStrikeOutput,
  DetectStrikeOutputSchema,
} from '@/ai/schemas/strike-schemas';
import { googleAI } from '@genkit-ai/googleai';

export type { DetectStrikeInput, DetectStrikeOutput };

export async function detectStrike(input: DetectStrikeInput): Promise<DetectStrikeOutput> {
  return detectStrikeFlow(input);
}

const detectStrikePrompt = ai.definePrompt({
  name: 'detectStrikePrompt',
  input: { schema: DetectStrikeInputSchema },
  output: { schema: DetectStrikeOutputSchema },
  prompt: `You are a Muay Thai referee. Analyze the image and determine if the person is throwing a punch, a kick, or doing nothing.
  
  Image: {{media url=imageDataUri}}
  
  Respond with "punch", "kick", or "none".`,
  model: googleAI('gemini-pro-vision'),
});

const detectStrikeFlow = ai.defineFlow(
  {
    name: 'detectStrikeFlow',
    inputSchema: DetectStrikeInputSchema,
    outputSchema: DetectStrikeOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await detectStrikePrompt(input);
      return output!;
    } catch (error) {
       console.error("Error in detectStrikeFlow:", error);
       // Return 'none' to avoid breaking the app flow on API errors
       return { strike: 'none' };
    }
  }
);
