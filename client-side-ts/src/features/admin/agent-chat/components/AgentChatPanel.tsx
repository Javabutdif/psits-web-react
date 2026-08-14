import { useRef, useEffect, forwardRef, useState, type Ref } from "react";
import { X, Bot, Send, RefreshCw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChat } from "../hooks/useChat";
import type { ChatMessage } from "../types/chat.types";

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  if (isSystem) {
    return (
      <div className="my-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          <span>{message.content}</span>
        </div>
        <div className="h-px flex-1 bg-border" />
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-white"
            : "bg-muted text-foreground border border-primary/20"
        )}
      >
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-xs",
            isUser ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </motion.div>
  );
};

const AutoResizeTextarea = forwardRef(
  (
    {
      value,
      onChange,
      onKeyDown,
      placeholder,
      disabled,
    }: {
      value: string;
      onChange: (value: string) => void;
      onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
      placeholder: string;
      disabled: boolean;
    },
    ref: Ref<HTMLTextAreaElement>
  ) => {
    const [rows, setRows] = useState(2);

    const updateRows = (el: HTMLTextAreaElement) => {
      const computed = getComputedStyle(el);
      const lineHeight =
        parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
      const padding =
        parseFloat(computed.paddingTop) +
        parseFloat(computed.paddingBottom);
      const computedRows = Math.max(
        2,
        Math.min(5, Math.ceil((el.scrollHeight - padding) / lineHeight))
      );
      setRows(computedRows);
    };

    return (
      <div className="relative flex-1 overflow-hidden rounded-xl border border-input bg-background">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            requestAnimationFrame(() => updateRows(e.target));
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={rows}
          className={cn(
            "resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed outline-none disabled:cursor-not-allowed disabled:opacity-50",
            "w-full overflow-hidden"
          )}
          disabled={disabled}
        />
      </div>
    );
  }
);
AutoResizeTextarea.displayName = "AutoResizeTextarea";

export const AgentChatPanel = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const {
    messages,
    input,
    isLoading,
    setInput,
    sendMessage,
    handleRefresh,
    handleKeyDown,
    messagesEndRef,
  } = useChat();

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onOpenChange]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-end justify-end"
        >
          {/* Mobile: full-screen overlay */}
          <div className="pointer-events-auto absolute inset-0 flex flex-col bg-background lg:hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">PSITS Chatbot</p>
                  <p className="text-[10px] text-muted-foreground">
                    Powered by Noetix AI Engine
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3">
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex h-full min-h-0 flex-col items-center justify-center gap-2 text-center"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Ask about PSITS data</p>
                  <p className="text-muted-foreground max-w-xs text-xs">
                    Try &quot;How many active students are there?&quot; or
                    &quot;Show me today&apos;s revenue&quot;
                  </p>
                </motion.div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="mb-3">
                  <MessageBubble message={msg} />
                </div>
              ))}
              {isLoading && (
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-primary/40"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-3">
              <div className="flex items-end gap-2">
                <AutoResizeTextarea
                  ref={textareaRef}
                  value={input}
                  onChange={setInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop: floating panel */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-auto mr-4 mb-4 hidden flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl lg:flex"
            style={{ height: "min(600px, 85vh)", width: "min(480px, calc(100vw - 3rem))" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-background to-primary/5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">PSITS Chatbot</p>
                  <p className="text-[10px] text-muted-foreground">
                    Powered by Noetix AI Engine
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  title="Refresh data"
                >
                  <RefreshCw
                    className={cn("h-4 w-4", isLoading && "animate-spin")}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3" style={{ minHeight: 0 }}>
              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex h-full min-h-0 flex-col items-center justify-center gap-2 text-center"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Ask about PSITS data</p>
                  <p className="text-muted-foreground max-w-xs text-xs">
                    Try &quot;How many active students are there?&quot; or
                    &quot;Show me today&apos;s revenue&quot;
                  </p>
                </motion.div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className="mb-3">
                  <MessageBubble message={msg} />
                </div>
              ))}
              {isLoading && (
                <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <span
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-primary/40"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="flex shrink-0 items-end gap-2 border-t p-3">
              <AutoResizeTextarea
                ref={textareaRef}
                value={input}
                onChange={setInput}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={isLoading || !input.trim()}
                className="shrink-0 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
