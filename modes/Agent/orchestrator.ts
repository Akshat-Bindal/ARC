import chalk from "chalk";
import { isCancel, text } from "@clack/prompts";
import { defaultAgentConfig } from "./types";
import { ActionTracker } from "./action-tracker";
import { ToolExecutor } from "./tool-executor";
import { createAgentTools } from "./agent-tools";
import { getModel } from "../../AI/ai.config";
import { runApprovalFlow } from "./approval";
import { renderTerminalMarkdown } from "../../tui/terminal-md";
import { stepCountIs, ToolLoopAgent } from "ai";

export async function runAgentMode() {
    console.log(chalk.bold("\n Agent Mode \n"));

    const goal = await text({
        message: "What would you like the agent to do",
        placeholder: "Concrete task for this codebase..."
    });

    if (isCancel(goal) || !goal) return;

    const config = defaultAgentConfig();
    const tracker = new ActionTracker();
    const executor = new ToolExecutor(tracker, config);
    const tools = createAgentTools(executor);

    const agent = new ToolLoopAgent({
        model: getModel("agent"),
        stopWhen: stepCountIs(40),
        instructions: [
            `Workspace root: ${config.codebasePath}`,
            "All mutation are staged until approval.",
        ].join("\n"),
        tools,
    });

    const result = await agent.generate({
        prompt: goal.trim(),
        onStepFinish: ({ toolCalls }) => {
            for (const tc of toolCalls) {
                const preview = JSON.stringify(tc.input).slice(0, 160);
                console.log(
                    chalk.green("  ✓"),
                    chalk.bold(String(tc.toolName)),
                    chalk.dim(preview + (preview.length >= 160 ? "..." : "")),
                );
            }
        },
    });
    if (result.text?.trim()) console.log(renderTerminalMarkdown(result.text));

    const ok = await runApprovalFlow(tracker);
    if (!ok) return executor.clearStaging();

    const { errors } = executor.applyApprovedFromTracker();

    if (errors.length) {
        console.log(chalk.red("\nSome operations reported errors:\n"));
        for (const e of errors) console.log(chalk.red(`  • ${e}`));
    }
    else {
        console.log(chalk.green('\n✓ Applied.\n'));
    }

    executor.clearStaging()
}