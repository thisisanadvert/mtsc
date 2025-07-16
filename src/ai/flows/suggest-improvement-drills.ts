// src/ai/flows/suggest-improvement-drills.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting Muay Thai drills based on strike performance.
 *
 * - suggestImprovementDrills - A function that takes strike statistics as input and returns suggested drills.
 * - SuggestImprovementDrillsInput - The input type for the suggestImprovementDrills function.
 * - SuggestImprovementDrillsOutput - The return type for the suggestImprovementDrills function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementDrillsInputSchema = z.object({
  totalStrikes: z.number().describe('The total number of strikes in the session.'),
  kickRatio: z
    .number()
    .describe(
      'The ratio of kicks to total strikes (e.g., 0.6 if 60% of strikes were kicks).' + ' Must be between 0 and 1.'
    ),
  punchRatio: z
    .number()
    .describe(
      'The ratio of punches to total strikes (e.g., 0.4 if 40% of strikes were punches).' + ' Must be between 0 and 1.'
    ),
  dominantHandRatio: z
    .number()
    .describe(
      'The ratio of strikes with the dominant hand to total strikes.  Must be between 0 and 1.'
    ),
  dominantLegRatio: z
    .number()
    .describe(
      'The ratio of strikes with the dominant leg to total strikes. Must be between 0 and 1.'
    ),
});

export type SuggestImprovementDrillsInput = z.infer<typeof SuggestImprovementDrillsInputSchema>;

const SuggestImprovementDrillsOutputSchema = z.object({
  suggestedDrills: z
    .array(z.string())
    .describe(
      'An array of Muay Thai drill suggestions tailored to improve the user\u2019s weaknesses based on the provided strike statistics.'
    ),
});

export type SuggestImprovementDrillsOutput = z.infer<typeof SuggestImprovementDrillsOutputSchema>;

export async function suggestImprovementDrills(
  input: SuggestImprovementDrillsInput
): Promise<SuggestImprovementDrillsOutput> {
  return suggestImprovementDrillsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementDrillsPrompt',
  input: {schema: SuggestImprovementDrillsInputSchema},
  output: {schema: SuggestImprovementDrillsOutputSchema},
  prompt: `You are an expert Muay Thai coach providing feedback to a student after a training session.

  Based on the strike statistics provided, suggest 3 specific drills to improve the student's technique and address any weaknesses.

  Total Strikes: {{{totalStrikes}}}
  Kick Ratio: {{{kickRatio}}}
  Punch Ratio: {{{punchRatio}}}
  Dominant Hand Ratio: {{{dominantHandRatio}}}
  Dominant Leg Ratio: {{{dominantLegRatio}}}

  Consider these factors when suggesting drills:
  - Balance between kicks and punches.
  - Usage of both dominant and non-dominant limbs.
  - Overall strike variety.

  Focus on actionable drills that the student can immediately incorporate into their training.
  Return the answer as a numbered list.
  `,
});

const suggestImprovementDrillsFlow = ai.defineFlow(
  {
    name: 'suggestImprovementDrillsFlow',
    inputSchema: SuggestImprovementDrillsInputSchema,
    outputSchema: SuggestImprovementDrillsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
