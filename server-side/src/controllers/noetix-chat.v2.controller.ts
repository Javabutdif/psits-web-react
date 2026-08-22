import { Request, Response } from "express";

import { catchAsync } from "../util/catch.async.util";
import {
  queryNoetix,
  queryNoetixAiAgent,
} from "../services/noetix-chat.service";
import {
  findToolByName,
  ToolPermissionError,
  getToolRegistry,
  summarizeToolResult,
  type ChatTool,
} from "../types/chat-tool.types";

interface ChatRequestBody {
  message?: string;
  persona?: string;
  sessionId?: string;
  destroy?: boolean;
  userAccess?: any;
  userName?: string;
}

// Extracts tool arguments from the goal message based on args definitions.
// Noetix returns only the tool name — we parse the natural language goal to fill args.
function extractToolArgs(
  _toolName: string,
  goal: string,
  history: string,
  args?: Array<{ name: string; description: string; pattern?: string }>
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!args) return result;

  const source = goal + " " + history;

  for (const arg of args) {
    if (result[arg.name]) continue;
    const keyLower = arg.name.toLowerCase();

    // Check history first (Noetix may have echoed back args there).
    // Capture the rest of the line so multi-word values like
    // "name: John Smith" are not truncated to just "John".
    const historyMatch = source.match(
      new RegExp(`${keyLower}\\s*[:=]\\s*([^\\n]+)`, "i")
    );
    if (historyMatch) {
      const val = historyMatch[1].trim().replace(/[.,;]+$/, "");
      if (arg.pattern && !new RegExp(arg.pattern).test(val)) continue;
      result[arg.name] = val;
      continue;
    }

    // Try direct ID patterns in the goal
    if (
      keyLower.includes("id_number") ||
      keyLower.includes("student_id") ||
      keyLower.includes("id")
    ) {
      // Patterns: "ID 12345", "id number 12345", "ID number: 12345", "12345" (standalone alphanumeric)
      const patterns = [
        /(?:id\s*number?\s*[:\-]?\s*)(\w[\w\-]{5,})/i,
        /(\w[\w\-]{5,})\s*(?:is|for|of|with)/i,
      ];
      for (const pat of patterns) {
        const m = source.match(pat);
        if (m) {
          const val = m[1];
          if (arg.pattern && !new RegExp(arg.pattern).test(val)) continue;
          result[arg.name] = val;
          break;
        }
      }
    }

    // Try order_id pattern (matches "order id", "order_id", "order:123...")
    if (keyLower.includes("order_id") && !result[arg.name]) {
      const m = source.match(/(?:order[_\s]*id\s*[:=]?\s*)([a-f0-9]{24})/i);
      if (m) result[arg.name] = m[1];
    }

    // Try event_id pattern (matches "event id", "event_id", "eventId")
    if (keyLower.includes("event_id") && !result[arg.name]) {
      const m = source.match(
        /(?:event[_\s]*id|eventId)\s*[:=]?\s*([a-f0-9]{24})/i
      );
      if (m) result[arg.name] = m[1];
    }

    // Generic fallback: look for values mentioned near the arg name
    if (!result[arg.name]) {
      const m = source.match(
        new RegExp(`${keyLower}\\s*[:=]\\s*([^\\n]+)`, "i")
      );
      if (m) {
        const val = m[1].trim().replace(/[.,;]+$/, "");
        if (arg.pattern && !new RegExp(arg.pattern).test(val)) continue;
        result[arg.name] = val;
      }
    }

    // Prose extraction for free-text args (no pattern): quoted values or
    // "called/named/titled X" phrases in the goal. Goal only — history may
    // contain quoted JSON from prior tool results.
    if (!result[arg.name] && !arg.pattern) {
      const quoted = goal.match(/"([^"]{2,120})"|'([^']{2,120})'/);
      const quotedVal = quoted?.[1] ?? quoted?.[2];
      if (quotedVal) {
        result[arg.name] = quotedVal.trim();
        continue;
      }
      const phrase = goal.match(
        /\b(?:called|named|titled)\s+(?:the\s+|this\s+|an?\s+)?([A-Za-z0-9][^,.!?;]{1,118})/i
      );
      if (phrase) {
        result[arg.name] = phrase[1].trim();
      }
    }
  }

  return result;
}

export const destroySessionController = catchAsync(
  async (req: Request, res: Response) => {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const result = await queryNoetix("DATA_ANALYST", "", {}, sessionId, true);

    return res.status(200).json({
      success: true,
      data: { sessionId: result.data.sessionId, destroyed: true },
    });
  }
);

const MAX_AGENT_ITERATIONS = 5;

export const aiAgentController = catchAsync(
  async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
    const {
      message,
      persona = "DATA_ANALYST",
      sessionId,
      destroy,
      userAccess = req.userV2.role,
      userName = req.admin.name,
    } = req.body;

    if (destroy) {
      const result = await queryNoetixAiAgent(
        persona,
        message || "",
        [],
        sessionId,
        undefined,
        true
      );
      return res.status(200).json({
        success: true,
        data: { sessionId: result.data.sessionId, destroyed: true },
      });
    }

    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const newSessionId = crypto.randomUUID();
    let effectiveSessionId = sessionId || newSessionId;
    let history = "";
    let iteration = 0;

    const tools = getToolRegistry().map((t) => ({
      name: t.name,
      description: t.description,
      ...(t.args ? { args: t.args } : {}),
    }));

    while (iteration < MAX_AGENT_ITERATIONS) {
      iteration++;

      let agentResult;
      try {
        agentResult = await queryNoetixAiAgent(
          persona,
          message,
          tools,
          effectiveSessionId,
          history || undefined,
          false
        );
      } catch (err) {
        if (
          err instanceof Error &&
          (err.message === "SESSION_NOT_FOUND" ||
            err.message === "SESSION_EXPIRED")
        ) {
          agentResult = await queryNoetixAiAgent(
            persona,
            message,
            tools,
            undefined,
            history || undefined,
            false
          );
        } else {
          throw err;
        }
      }

      effectiveSessionId = agentResult.data.sessionId;

      if (agentResult.data.isFinished) {
        if (history)
          return res.status(200).json({
            success: true,
            data: {
              sessionId: agentResult.data.sessionId,
              persona: agentResult.data.persona,
              result: agentResult.data.final_result,
              history: agentResult.data.history,
              iterations: iteration,
            },
          });
      }

      const toolName = agentResult.data.tools_used;
      if (!toolName) {
        if (history)
          return res.status(200).json({
            success: true,
            data: {
              sessionId: agentResult.data.sessionId,
              persona: agentResult.data.persona,
              result: agentResult.data.final_result || "No tool selected.",
              history: agentResult.data.history,
              iterations: iteration,
            },
          });
      }

      const tool = findToolByName(toolName);
      if (!tool) {
        history = `${history} Called ${toolName} — error: tool not found.\n`;
        continue;
      }

      let toolResult: unknown;
      try {
        const noetixArgs = agentResult.data.tool_args;
        const resolvedArgs =
          noetixArgs && Object.keys(noetixArgs).length > 0
            ? (noetixArgs as Record<string, string>)
            : extractToolArgs(toolName, message, history, tool.args);

        toolResult = await tool.execute(resolvedArgs, userAccess, userName);
        // Feed Noetix a clean summary instead of raw JSON so its final
        // answer (and the UI) stays readable. Large summaries are still
        // truncated — Noetix rejects payloads over 50KB.
        const resultSummary = summarizeToolResult(toolResult) || "null";
        history = `${history} Called ${toolName}, result: ${
          resultSummary.length > 6000
            ? `${resultSummary.slice(0, 6000)}... (truncated)`
            : resultSummary
        }.\n`;
      } catch (err) {
        const errorMsg =
          err instanceof ToolPermissionError
            ? err.message
            : err instanceof Error
              ? err.message
              : "unknown error";
        history = `${history} Called ${toolName}, error: ${errorMsg}.\n`;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        sessionId: effectiveSessionId,
        persona,
        result:
          "The AI agent reached the maximum iteration limit. The goal may need simplification.",
        history,
        iterations: iteration,
      },
    });
  }
);
