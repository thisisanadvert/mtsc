'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing a Muay Thai training session.
 *
 * - summarizeSession - A function that takes session data and returns a GenAI summary.
 * - SummarizeSessionInput - The input type for the summarizeSession function.
 * - SummarizeSessionOutput - The return type for the summarizeSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSessionInputSchema = z.object({
  sessionDetails: z.string().describe('Details of the Muay Thai training session, including strike counts and timestamps.'),
  userGoals: z.string().describe('The user specified goals for the session'),
});
export type SummarizeSessionInput = z.infer<typeof SummarizeSessionInputSchema>;

const SummarizeSessionOutputSchema = z.object({
  summary: z.string().describe('A GenAI-generated summary of the Muay Thai training session.'),
});
export type SummarizeSessionOutput = z.infer<typeof SummarizeSessionOutputSchema>;

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
