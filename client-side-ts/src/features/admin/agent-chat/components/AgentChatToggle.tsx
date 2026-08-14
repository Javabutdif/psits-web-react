import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { AgentChatPanel } from "./AgentChatPanel";

export const AgentChatToggle = ({
  isOpen: isOpenControlled,
  onOpenChange,
}: {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isOpenControlled ?? isOpenInternal;
  const setOpen = (open: boolean) => {
    if (onOpenChange) onOpenChange(open);
    else setIsOpenInternal(open);
  };

  return (
    <>
      <button
        type="button"
        className="bg-primary hover:shadow-primary/30 fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
        onClick={() => setOpen(!isOpen)}
        aria-label="Open AI Assistant"
      >
        {!isOpen && (
          <>
            <motion.span
              className="bg-primary/30 absolute inset-0 rounded-full"
              animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              className="bg-primary/20 absolute inset-0 rounded-full"
              animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.3,
              }}
            />
          </>
        )}
        <MessageSquare className="relative h-5 w-5 text-white" />
      </button>
      <AgentChatPanel isOpen={isOpen} onOpenChange={setOpen} />
    </>
  );
};
