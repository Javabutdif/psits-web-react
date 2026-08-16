import api from "@/api/axios";
import type {
  ChatRequestBody,
  DestroySessionResponse,
  NoetixAgentResponse,
} from "../types/chat.types";

export const sendAgentMessage = async (
  body: ChatRequestBody
): Promise<NoetixAgentResponse> => {
  const response = await api.post<never, { data: NoetixAgentResponse }>(
    "/api/v2/chat/agent",
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
