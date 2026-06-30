import { vertex } from "@ai-sdk/google-vertex";

export type Mode =
    | "agent"
    | "plan"
    | "ask";

const MODELS: Record<Mode, string> = {
    agent: "gemini-3.1-pro-preview",
    plan: "gemini-2.5-flash",
    ask: "gemini-2.5-flash",
};

export function getModel(mode: Mode) {
    return vertex(MODELS[mode]);
}