import { AgentChatPanel } from "@/features/admin/agent-chat/components/AgentChatPanel";
import { useState } from "react";

export const AgentChatPage = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 flex items-center gap-3">
        <h1 className="text-2xl font-bold">Noetix AI</h1>
        <p className="text-sm text-muted-foreground">
          Ask questions about PSITS operational data
        </p>
      </div>
      <div className="flex-1">
        <AgentChatPanel isOpen={isOpen} onOpenChange={setIsOpen} />
      </div>
    </div>
  );
};
