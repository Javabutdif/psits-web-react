export const PERSONA_DATA_ANALYST = "DATA_ANALYST";

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
}

export interface NoetixAgentResponse {
  success: boolean;
  data: {
    sessionId: string;
    persona: string;
    result: string;
    matchedKeys: string[];
    sessionTTL: number;
  };
}

export interface DestroySessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    destroyed: boolean;
  };
}

export interface ChatRequestBody {
  message?: string;
  persona?: string;
  sessionId?: string;
  destroy?: boolean;
}
