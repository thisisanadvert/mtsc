'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing a Muay Thai training session.
 *
 * - summarizeSession - A function that takes session data and returns a GenAI summary.
 */

import {ai} from '@/ai/genkit';
import {
  SummarizeSessionInput,
  SummarizeSessionInputSchema,
  SummarizeSessionOutput,
  SummarizeSessionOutputSchema,
} from '@/ai/schemas/summary-schemas';

export type { SummarizeSessionInput, SummarizeSessionOutput };

export async function summarizeSession(input: SummarizeSessionInput): Promise<SummarizeSessionOutput> {
  return summarizeSessionFlow(input);
}

const summarizeSessionPrompt = ai.definePrompt({
  name: 'summarizeSessionPrompt',
  input: {schema: SummarizeSessionInputSchema},
  output: {schema: SummarizeSessionOutputSchema},
  prompt: `You are an expert Muay Thai coach summarizing training sessions for athletes.

  Based on the session details and the user's goals, provide a concise summary of the session, highlighting key moments, overall performance, and areas for improvement. The summary should be actionable and help the user understand their progress without watching the entire video.

  Session Details: {{{sessionDetails}}}
  User Goals: {{{userGoals}}}
  \n  Provide a summary with at most 5 sentences.
  `,
});

const summarizeSessionFlow = ai.defineFlow(
  {
    name: 'summarizeSessionFlow',
    inputSchema: SummarizeSessionInputSchema,
    outputSchema: SummarizeSessionOutputSchema,
  },
  async input => {
    const {output} = await summarizeSessionPrompt(input);
    return output!;
  }
);
