/**
 * @fileOverview Zod schemas for the suggest improvement drills flow.
 */
import {z} from 'genkit';

export const SuggestImprovementDrillsInputSchema = z.object({
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

export const SuggestImprovementDrillsOutputSchema = z.object({
  suggestedDrills: z
    .array(z.string())
    .describe(
      'An array of Muay Thai drill suggestions tailored to improve the user\u2019s weaknesses based on the provided strike statistics.'
    ),
});

export type SuggestImprovementDrillsOutput = z.infer<typeof SuggestImprovementDrillsOutputSchema>;
