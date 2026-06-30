import { generateText } from "ai";
import { vertex } from "@ai-sdk/google-vertex";

const { text } = await generateText({
    model: vertex("gemini-3.1-pro-preview"),
    prompt: "Say hello!",
});

console.log(text);