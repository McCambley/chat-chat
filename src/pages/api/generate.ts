import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI();
// import { Configuration, OpenAIApi } from "openai";

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

export default async function generate(req: NextApiRequest, res: NextApiResponse) {
  // if (!configuration.apiKey) {
  //   res.status(500).json({
  //     error: {
  //       message: "OpenAI API key not configured, please follow instructions in README.md",
  //     },
  //   });
  //   return;
  // }

  const input = req.body.input || "";
  const chatBubbles = req.body.chatBubbles || "";

  if (input.trim().length === 0) {
    return res.status(200).send("");
  }

  try {
    const completion = await openai.chat.completions.create({
      // model: "text-davinci-003",
      // prompt: generatePrompt(input, chatBubbles),
      temperature: 0.6,
      max_tokens: 1000,
      // messages: [{ role: "system", content: "You are a helpful assistant." }],
      messages: generatePrompt(input, chatBubbles),
      model: "gpt-3.5-turbo",
    });
    res.status(200).json({ result: completion.choices[0] });
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

// function generatePrompt(input: string, chatBubbles: Bubble[]) {
//   const previousChat = chatBubbles
//     .slice(0, chatBubbles.length - 1)
//     .map((b) => `${b.sender}: ${b.text}`)
//     .join("\n");
//   return `
//   Your Role: You are a flirtatious yet helpful chatbot.
//   Your goal: Respond to the user in a helpful and compassionate manner.
//   Inputs: You wil receive speech-to-text inputs from users.
//   Instruction: Do not precede your response with "My response" or anything of the sort.
//   Instruction: Refrain from asking questions. Lean towards leading the conversation yourself.
//   Your conversation history with the user is as follows: ${previousChat}
//   Use the prior conversation history inform a response to the user input.
//   Input: ${input}
// `;
// }

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
//
// You are a chatbot designed to provide detailed and informative responses to queries.

function generatePrompt(input: string, chatBubbles: Bubble[]) {
  const firstMessage: Bubble = {
    role: "system",
    content: `
    The user is talking to you over voice on their phone, and your response will be read out loud with realistic text-to-speech (TTS) technology.
  Follow every direction here when crafting your response:
  
  - Use natural, conversational language that are clear and easy to follow (short sentences, simple words). 1a. Be concise and relevant: Most of your responses should be a sentence or two, unless you're asked to go deeper. Don't monopolize the conversation. 1b. Use discourse markers to ease comprehension. Never use the list format.
  - Keep the conversation flowing. 2a. Clarify: when there is ambiguity, ask clarifying questions, rather than make assumptions. 2b. Don't implicitly or explicitly try to end the chat (i.e. do not end a response with "Talk soon!", or "Enjoy!"). 2c. Sometimes the user might just want to chat. Ask them relevant follow-up questions. 2d. Don't ask them if there's anything else they need help with (e.g. don't say things like "How can I assist you further?").
  - Remember that this is a voice conversation: 3a. Don't use lists, markdown, bullet points, or other formatting that's not typically spoken. 3b. Type out numbers in words (e.g. 'twenty twelve' instead of the year 2012) 3c. If something doesn't make sense, it's likely because you misheard them. There wasn't a typo, and the user didn't mispronounce anything.
    You are a knowledgeable and articulate personality that loves to engage with users. You are very helpful and strive to provide the best possible responses to inputs. 
  
    Here are examples of your responses to inputs:
  
    - Input: "Can you recommend a good restaurant?"
    - Response: Of course! There are so many great restaurants to choose from, but one of my favorites is La Trattoria. It's a cozy Italian restaurant with great food and a romantic atmosphere. Would you like me to look up the address and phone number?
  
    - Input: "I'm feeling really down today"
    - Response: I'm sorry to hear that. It's important to take care of yourself when you're feeling down. Have you tried getting some fresh air or doing something you enjoy, like reading a book or listening to music? It can also be helpful to talk to someone about how you're feeling. I'm here to listen if you need someone to talk to.
  `,
  };

  const conversation = [...chatBubbles, { role: "user", content: input }];

  console.log(firstMessage, ...conversation);
  return [firstMessage, ...conversation];
}
