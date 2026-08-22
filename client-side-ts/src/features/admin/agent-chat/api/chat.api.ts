import api from "@/api/axios";
import type {
  ChatRequestBody,
  DestroySessionResponse,
  AiAgentResponse,
} from "../types/chat.types";

export const sendAiAgentMessage = async (
  body: ChatRequestBody
): Promise<AiAgentResponse> => {
  const response = await api.post<never, { data: AiAgentResponse }>(
    "/api/v2/chat/ai-agent",
    body
  );
  return response.data;
};

export const destroyChatSession = async (
  sessionId: string
): Promise<DestroySessionResponse> => {
  const response = await api.post<
    never,
    { data: DestroySessionResponse }
  >("/api/v2/chat/session/destroy", { sessionId });
  return response.data;
};
