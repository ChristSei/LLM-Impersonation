import { CommandInteraction, InteractionCallback, SlashCommandBuilder } from 'discord.js';

const botApi = process.env.API_URI;
const botName = process.env.MODEL_NAME;

interface Message {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason: string;
  context: Array<number>;
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
}

async function callModel(message: string): Promise<Message[] | undefined> {
  const response = await fetch(`${botApi}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: botName,
      prompt: message,
    }),
  });

  if (response.headers.get("Content-Type")?.includes("application/x-ndjson")) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;
    while (!done) {
      const { value, done: readerDone } = await reader?.read()!;
      result += decoder.decode(value, { stream: !readerDone });
      done = readerDone;
    }
    console.log(result);

    const json = result.split('\n').filter(Boolean).map(line => JSON.parse(line));
    return json;
  }

  return undefined;
}

export const data = new SlashCommandBuilder()
  .setName("chat")
  .setDescription("Chat with LLM")
  .addStringOption(option =>
    option.setName("message")
      .setDescription("Your message to chat with the bot")
      .setRequired(true) // Makes the parameter required
  );

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply();
  // Get the user input
  const userMessage = interaction.options.get("message")?.value as string;

  const response = await callModel(userMessage);

  if (response === undefined) {
    // await interaction.reply("An error occurred while calling the model");
    await interaction.editReply("An error occurred while calling the model");
    return;
  }

  let reply = '';

  response.forEach(msg => {
    if (msg.done) {
      return;
    }
    
    reply += msg.response;
  });

  // Send a response with the user input (you can integrate an LLM here)
  // await interaction.reply(`${reply}`);
  await interaction.editReply(`${reply}`);
}
