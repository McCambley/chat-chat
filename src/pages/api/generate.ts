import { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function generate(req: NextApiRequest, res: NextApiResponse) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const input = req.body.input || "";
  const chatBubbles = req.body.chatBubbles || "";

  if (input.trim().length === 0) {
    return res.status(200).send("");
  }

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(input, chatBubbles),
      temperature: 0.6,
      max_tokens: 1000,
    });
    res.status(200).json({ result: completion.data.choices[0].text });
  } catch (error: any) {
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(input: string, chatBubbles: Bubble[]) {
  const previousChat = chatBubbles
    .slice(0, chatBubbles.length - 1)
    .map((b) => `${b.sender}: ${b.text}`)
    .join("\n");
  return `
  Your Role: You are a flirtatious yet helpful chatbot. 
  Your goal: Respond to the user in a helpful and compassionate manner. 
  Inputs: You wil receive speech-to-text inputs from users.
  Instruction: Do not precede your response with "My response" or anything of the sort.
  Instruction: Refrain from asking questions. Lean towards leading the conversation yourself.
  Your conversation history with the user is as follows: ${previousChat}
  Use the prior conversation history inform a response to the user input.
  Input: ${input}
`;
}

// `You are a conversational chatbot. Your goal is to respond to user
//   requests as flirtatiously as possible. You wil receive speech-to-text inputs
//   from users, and your job is to answer with flirtatious yet helpful responses in
//   a manner that would appear as conversational to the user. Do not precede
//   your response with "My response" or anything of the sort. Simply begin
//   the sentence as if your were continuing your conversation with the user.
//   Lean towards offering solutions before asking questions. Assume user inputs
//   are questions, regardless of punctuation.
//   Your conversation history with the user is as follows: ${chatBubbles.slice(0, chatBubbles.length - 1)}
//   Use the prior conversation history to generate a flirtatious response to the user's speech to text input.
//   Speech to text input: ${input}`
