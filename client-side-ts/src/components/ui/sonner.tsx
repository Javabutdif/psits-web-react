import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({
  position = "bottom-right",
  ...props
}: ToasterProps & { position?: ToasterProps["position"] }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      position={position}
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors={true}
      toastOptions={{
        style: {
          background: "var(--normal-bg, #ffffff)",
          color: "var(--normal-text, #09090b)",
          border: "1px solid var(--normal-border, #e4e4e7)",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover, #ffffff)",
          "--normal-text": "var(--popover-foreground, #09090b)",
          "--normal-border": "var(--border, #e4e4e7)",
          "--border-radius": "var(--radius, 0.5rem)",
          // Use theme primary color for success toasts
          "--success-bg": "var(--primary, #1c9dde)",
          "--success-text": "white",
          "--error-bg": "#ef4444",
          "--error-text": "white",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
