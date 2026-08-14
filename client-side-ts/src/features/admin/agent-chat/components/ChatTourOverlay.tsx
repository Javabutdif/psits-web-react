import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import {
  Users,
  Wallet,
  Package,
  CalendarDays,
  ClipboardList,
  Mail,
  Bot,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth";

const TOUR_KEY_PREFIX = "psits-chatbot-tour:";

const getTourKey = (userId: string) => `${TOUR_KEY_PREFIX}${userId}`;
const hasSeenTour = (userId: string) =>
  localStorage.getItem(getTourKey(userId)) === "1";
const markTourSeen = (userId: string) =>
  localStorage.setItem(getTourKey(userId), "1");

const CAPABILITIES = [
  { icon: Users, label: "Students", detail: "Active counts, new this week, per campus" },
  { icon: Wallet, label: "Sales & revenue", detail: "Today, totals, refunds, top sellers" },
  { icon: Package, label: "Merch inventory", detail: "Stock levels, low stock, out of stock" },
  { icon: CalendarDays, label: "Events", detail: "Revenue, attendees, upcoming tickets" },
  { icon: ClipboardList, label: "Recruitment", detail: "Open positions, applications, pipeline" },
  { icon: Mail, label: "Email queue", detail: "Pending, sent, failed messages" },
];

const spring = { type: "spring", stiffness: 320, damping: 28 } as const;

const BouncingArrow = () => (
  <motion.div
    animate={{ y: [0, 5, 0] }}
    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
    className="absolute -bottom-5 left-1/2 z-10 -translate-x-1/2"
  >
    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 bg-card shadow-lg">
      <ArrowRight className="h-4 w-4 rotate-90 text-primary" />
    </div>
  </motion.div>
);

const TourCardShell = ({
  step,
  title,
  subtitle,
  children,
  onBack,
  onSkip,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onBack?: () => void;
  onSkip: () => void;
}) => (
  <motion.div
    key={step}
    initial={{ opacity: 0, y: 16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.96 }}
    transition={spring}
    className="pointer-events-auto relative overflow-hidden rounded-2xl border bg-card shadow-2xl"
  >
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-400 to-primary-600" />
    <div className="p-5 pb-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-700 text-white shadow-[0_4px_14px_-4px] shadow-primary/40">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold tracking-tight">{title}</p>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {step} / 3
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
    <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!onBack}
        className={cn(
          "flex cursor-pointer items-center gap-1 text-xs font-medium transition-colors",
          onBack
            ? "text-muted-foreground hover:text-foreground"
            : "invisible"
        )}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <motion.span
            key={s}
            animate={{ width: step === s ? 20 : 6 }}
            className={cn(
              "h-1.5 rounded-full",
              step === s ? "bg-primary" : "bg-border"
            )}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="cursor-pointer text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Skip
      </button>
    </div>
  </motion.div>
);

export const ChatTourOverlay = ({
  isChatOpen,
  onOpenChat,
}: {
  isChatOpen: boolean;
  onOpenChat: () => void;
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const userId = user?.id ?? "";
  const isAdmin = user?.role === "admin";
  const onChatPage = location.pathname.includes("/admin/chat");

  const [step, setStep] = useState<number | null>(() =>
    isAdmin && userId && !onChatPage && !hasSeenTour(userId) ? 1 : null
  );

  const finish = useCallback(() => {
    if (userId) markTourSeen(userId);
    setStep(null);
  }, [userId]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [finish]);

  const effectiveStep =
    step === 2 && isChatOpen ? 3 : step === 3 && !isChatOpen ? 2 : step;

  return (
    <AnimatePresence>
      {step !== null && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px]"
          />

          {effectiveStep === 2 && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: "easeOut",
                }}
                className="pointer-events-none fixed right-4 bottom-4 z-[61] h-20 w-20 rounded-full border-2 border-primary"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.4,
                  ease: "easeOut",
                  delay: 0.35,
                }}
                className="pointer-events-none fixed right-6 bottom-6 z-[61] h-12 w-12 rounded-full shadow-[0_0_24px_6px] shadow-primary/50"
              />
            </>
          )}

          {effectiveStep === 4 ? (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={spring}
              className="pointer-events-auto fixed top-1/2 left-1/2 z-[62] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-card shadow-2xl"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-400 to-primary-600" />
              <div className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-700 text-white shadow-[0_4px_14px_-4px] shadow-primary/40">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-semibold tracking-tight">
                      What the PSITS Chatbot can do
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ask in plain language — get answers from live PSITS data
                    </p>
                  </div>
                </div>
                <ul className="mb-6 grid gap-2.5 sm:grid-cols-2">
                  {CAPABILITIES.map((cap, i) => (
                    <motion.li
                      key={cap.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.08 * i,
                        duration: 0.25,
                        ease: "easeOut",
                      }}
                      className="group flex items-start gap-3 rounded-xl border bg-muted/40 p-3 transition-all hover:border-primary/30 hover:bg-primary/5"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <cap.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{cap.label}</p>
                        <p className="text-xs leading-snug text-muted-foreground">
                          {cap.detail}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
                <Button
                  className="group w-full bg-gradient-to-r from-primary to-primary-600 shadow-[0_4px_14px_-4px] shadow-primary/40 hover:from-primary-600 hover:to-primary-700"
                  onClick={finish}
                >
                  Got it — start chatting
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="pointer-events-none fixed right-4 bottom-24 left-4 z-[62] sm:right-6 sm:left-auto sm:w-80">
              <TourCardShell
                step={effectiveStep ?? 1}
                onBack={
                  effectiveStep === 2 || effectiveStep === 3
                    ? () => setStep(effectiveStep === 2 ? 1 : 2)
                    : undefined
                }
                onSkip={finish}
                title={
                  effectiveStep === 1
                    ? "New feature: PSITS Chatbot"
                    : effectiveStep === 2
                      ? "Step 1 — Open the chat"
                      : "Step 2 — Ask a question"
                }
                subtitle={
                  effectiveStep === 1
                    ? "Your AI assistant for PSITS data. Ask about students, sales, merch, events, and more."
                    : effectiveStep === 2
                      ? "Click the chat bubble in the bottom-right corner, or use the button below."
                      : "Type a question in the box below, then press Enter to send."
                }
              >
                {effectiveStep === 1 && (
                  <div className="mb-4 rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Works like messaging —{" "}
                      <span className="font-medium text-foreground">
                        type a question, get an instant answer
                      </span>{" "}
                      from live PSITS data. No commands to memorize.
                    </p>
                  </div>
                )}

                {effectiveStep === 2 && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3">
                    <MessageSquare className="h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      The chat bubble is waiting at the{" "}
                      <span className="font-medium text-foreground">
                        bottom-right
                      </span>{" "}
                      of your screen.
                    </p>
                  </div>
                )}

                {effectiveStep === 3 && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 p-3">
                    <Send className="h-4 w-4 shrink-0 text-primary" />
                    <p className="text-xs text-muted-foreground">
                      Try:{" "}
                      <span className="font-medium text-foreground">
                        &quot;How many active students are there?&quot;
                      </span>
                    </p>
                  </div>
                )}

                <Button
                  className="group w-full bg-gradient-to-r from-primary to-primary-600 shadow-[0_4px_14px_-4px] shadow-primary/40 hover:from-primary-600 hover:to-primary-700"
                  size="sm"
                  onClick={
                    effectiveStep === 1
                      ? () => setStep(2)
                      : effectiveStep === 2
                        ? () => {
                            onOpenChat();
                            setStep(3);
                          }
                        : () => setStep(4)
                  }
                >
                  {effectiveStep === 1
                    ? "Show me"
                    : effectiveStep === 2
                      ? "Open chatbot"
                      : "See what it can do"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </TourCardShell>
              <BouncingArrow />
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};