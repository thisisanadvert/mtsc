/**
 * @fileOverview Zod schemas for the detect strike flow.
 */
import {z} from 'genkit';

export const DetectStrikeInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectStrikeInput = z.infer<typeof DetectStrikeInputSchema>;

const StrikeEnum = z.enum(['punch', 'kick', 'none']);

export const DetectStrikeOutputSchema = z.object({
  strike: StrikeEnum.describe('The type of strike detected in the image.'),
});
export type DetectStrikeOutput = z.infer<typeof DetectStrikeOutputSchema>;
