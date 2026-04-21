import React from "react";

interface WinnerDeclaredModalProps {
  winner: string;
  campus?: string;
  round: number;
  onConfirm: () => void;
  onRedraw: () => void;
  onClose: () => void;
  isRedrawing?: boolean;
}

export const WinnerDeclaredModal: React.FC<WinnerDeclaredModalProps> = ({
  winner,
  campus,
  round,
  onConfirm,
  onRedraw,
  onClose,
  isRedrawing = false,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          position: "relative",
          background: "#ffffff",
          borderRadius: "32px",
          padding: "48px 32px 40px",
          textAlign: "center",
          boxShadow:
            "0 20px 80px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.5)",
          animation:
            "winnerModalEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        {/* Background glow behind modal */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "150%",
            height: "150%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 60%)",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />

        {/* Quick reject button: reject this winner and close modal */}
        <button
          onClick={onClose}
          disabled={isRedrawing}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: isRedrawing ? "#cbd5e1" : "#64748b",
            fontSize: "1rem",
            fontWeight: 700,
            lineHeight: 1,
            cursor: isRedrawing ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            zIndex: 10,
            opacity: isRedrawing ? 0.7 : 1,
          }}
          onMouseOver={(e) => {
            if (isRedrawing) return;
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#cbd5e1";
            e.currentTarget.style.color = "#334155";
          }}
          onMouseOut={(e) => {
            if (isRedrawing) return;
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#64748b";
          }}
          aria-label="Reject winner and close"
          title="Reject winner and close"
        >
          X
        </button>

        {/* Decorative Trophy / Icon */}
        <div
          style={{
            position: "absolute",
            top: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.5rem",
            boxShadow:
              "0 10px 30px rgba(245,158,11,0.4), inset 0 2px 5px rgba(255,255,255,0.6)",
            border: "4px solid #ffffff",
          }}
        >
          🏆
        </div>

        {/* Header Text */}
        <p
          style={{
            fontSize: "12px",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#64748b",
            fontWeight: 800,
            marginBottom: "8px",
            marginTop: "16px",
          }}
        >
          Round {round} Winner
        </p>

        {/* Winner Name */}
        <h2
          style={{
            fontSize: "clamp(2rem, 7vw, 3rem)",
            fontWeight: 900,
            margin: "0 0 40px",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {winner}
        </h2>

        {campus && (
          <p
            style={{
              marginTop: "-26px",
              marginBottom: "30px",
              color: "#475569",
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            Campus: {campus}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
          <button
            onClick={onConfirm}
            disabled={isRedrawing}
            style={{
              width: "100%",
              padding: "18px 24px",
              borderRadius: "100px",
              border: "none",
              background: isRedrawing
                ? "#94a3b8"
                : "linear-gradient(135deg, #2563eb, #06b6d4)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "0.02em",
              cursor: isRedrawing ? "not-allowed" : "pointer",
              opacity: isRedrawing ? 0.6 : 1,
              boxShadow: isRedrawing
                ? "none"
                : "0 10px 30px rgba(6,182,212,0.3), inset 0 2px 0 rgba(255,255,255,0.25)",
              transition:
                "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              if (isRedrawing) return;
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow =
                "0 15px 40px rgba(6,182,212,0.4), inset 0 2px 0 rgba(255,255,255,0.25)";
            }}
            onMouseOut={(e) => {
              if (isRedrawing) return;
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 10px 30px rgba(6,182,212,0.3), inset 0 2px 0 rgba(255,255,255,0.25)";
            }}
          >
            CONFIRM WINNER
          </button>
          <button
            onClick={onRedraw}
            disabled={isRedrawing}
            style={{
              width: "100%",
              padding: "16px 24px",
              borderRadius: "100px",
              border: "2px solid #e2e8f0",
              background: "#ffffff",
              color: isRedrawing ? "#cbd5e1" : "#64748b",
              fontWeight: 700,
              fontSize: "1rem",
              cursor: isRedrawing ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              opacity: isRedrawing ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (isRedrawing) return;
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.color = "#475569";
            }}
            onMouseOut={(e) => {
              if (isRedrawing) return;
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#64748b";
            }}
          >
            {isRedrawing ? "Redrawing..." : "RE-DRAW"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes winnerModalEntrance {
          0%   { transform: scale(0.9) translateY(30px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
