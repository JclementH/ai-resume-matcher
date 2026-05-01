import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY
});

export async function sendChat(messages) {
  const response = await client.chat.send({
    chatRequest: {
      model: "openrouter/free",
      messages,
      temperature: 0
    }
  });

  return response.choices?.[0]?.message?.content || "";
}