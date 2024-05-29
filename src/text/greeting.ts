import { Context } from 'telegraf';
import createDebug from 'debug';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const debug = createDebug('bot:greeting_text');
const MODEL_NAME: string = 'gemini-1.5-pro';
const API_KEY: string = 'YOUR_API_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

// Interfaces
interface GenerateContentConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
}

interface SafetySetting {
  category: HarmCategory;
  threshold: HarmBlockThreshold;
}

interface ContentPart {
  text: string;
}

const generationConfig: GenerateContentConfig = {
  temperature: 1,
  topK: 64,
  topP: 0.95,
  maxOutputTokens: 8192,
};

const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

async function harmony(prompt: String): Promise<String> {
  const parts: ContentPart[] = [
    { text: 'Y' },
    { text: `input: ${prompt}` },
    { text: 'output: ' },
  ];

  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  console.log(response.text());
  return response.text();
}

const replyToMessage = (ctx: Context, messageId: number, string: string) =>
  ctx.reply(string, {
    reply_parameters: { message_id: messageId },
  });

const greeting = () => async (ctx: Context) => {
  debug('Triggered "greeting" text command');

  const messageId = ctx.message?.message_id;
  const userName = `${ctx.message?.from.first_name} ${ctx.message?.from.last_name}`;
  const text = ctx?.text;
  if (messageId) {
    await replyToMessage(
      ctx,
      messageId,
      `Hello, ${userName}!/nYou sent: ${text}`,
    );
  }
};

export { greeting };
