'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting Muay Thai drills based on strike performance.
 *
 * - suggestImprovementDrills - A function that takes strike statistics as input and returns suggested drills.
 */

import {ai} from '@/ai/genkit';
import {
  SuggestImprovementDrillsInput,
  SuggestImprovementDrillsInputSchema,
  SuggestImprovementDrillsOutput,
  SuggestImprovementDrillsOutputSchema,
} from '@/ai/schemas/drill-schemas';

export type { SuggestImprovementDrillsInput, SuggestImprovementDrillsOutput };

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
