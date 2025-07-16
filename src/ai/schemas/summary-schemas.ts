/**
 * @fileOverview Zod schemas for the summarize session flow.
 */
import {z} from 'genkit';

export const SummarizeSessionInputSchema = z.object({
  sessionDetails: z.string().describe('Details of the Muay Thai training session, including strike counts and timestamps.'),
  userGoals: z.string().describe('The user specified goals for the session'),
});
export type SummarizeSessionInput = z.infer<typeof SummarizeSessionInputSchema>;

export const SummarizeSessionOutputSchema = z.object({
  summary: z.string().describe('A GenAI-generated summary of the Muay Thai training session.'),
});
export type SummarizeSessionOutput = z.infer<typeof SummarizeSessionOutputSchema>;
