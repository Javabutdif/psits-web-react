import { Request, Response } from "express";

import { catchAsync } from "../util/catch.async.util";
import {
  fetchFullSnapshot,
  queryNoetix,
} from "../services/noetix-chat.service";

interface ChatRequestBody {
  message?: string;
  persona?: string;
  sessionId?: string;
  destroy?: boolean;
}

export const agentController = catchAsync(
  async (req: Request<{}, {}, ChatRequestBody>, res: Response) => {
    const { message, persona = "DATA_ANALYST", sessionId, destroy } = req.body;

    if (destroy) {
      const result = await queryNoetix(
        persona,
        message || "",
        {},
        sessionId,
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
    const effectiveSessionId = sessionId || newSessionId;

    let snapshot;

    snapshot = await fetchFullSnapshot();

    const dataPayload = snapshot ?? { question: message };

    let result;
    try {
      result = await queryNoetix(
        persona,
        message || "",
        dataPayload,
        effectiveSessionId
      );
    } catch (err) {
      if (err instanceof Error && err.message === "SESSION_NOT_FOUND") {
        const freshSnapshot = await fetchFullSnapshot();
        result = await queryNoetix(
          persona,
          message || "",
          freshSnapshot,
          undefined
        );
      } else {
        throw err;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        sessionId: result.data.sessionId,
        persona: result.data.persona,
        result: result.data.result,
        matchedKeys: result.data.matchedKeys,
        sessionTTL: result.data.sessionTTL,
      },
    });
  }
);

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
