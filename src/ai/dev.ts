import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-session.ts';
import '@/ai/flows/suggest-improvement-drills.ts';
import '@/ai/flows/detect-strike-flow.ts';
