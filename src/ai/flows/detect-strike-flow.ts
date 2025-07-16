
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
  prompt: `You are an expert Muay Thai referee. Your task is to analyze an image and determine if the person is throwing a punch or a kick.

Analyze the provided image.
Image: {{media url=imageDataUri}}

Your primary focus is to identify the moment of full extension for a strike.
- A "punch" is only counted at the point of full arm extension.
- A "kick" is only counted at the point of full leg extension.
- If an arm or leg is bent, in motion but not extended, or in a resting stance, respond with "none".

Only respond with one of the three options: "punch", "kick", or "none".`,
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
