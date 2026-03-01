import { useState, useEffect } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type Status = "checking" | "online" | "offline" | "starting";

export const BackendStatus = () => {
  const [status, setStatus] = useState<Status>("checking");
  const { t } = useTranslation();

  const checkHealth = async () => {
    setStatus("checking");
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("https://weed-yolo-backend-weed-yolo-backend.hf.space/health", {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setStatus(res.ok ? "online" : "starting");
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const config: Record<Status, { icon: React.ReactNode; label: string; className: string }> = {
    checking: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: "Checking...",
      className: "text-muted-foreground border-border bg-secondary/50",
    },
    online: {
      icon: <Wifi className="h-3 w-3" />,
      label: "Backend Online",
      className: "text-primary border-primary/30 bg-primary/10",
    },
    starting: {
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
      label: "Backend Starting...",
      className: "text-warning border-warning/30 bg-warning/10",
    },
    offline: {
      icon: <WifiOff className="h-3 w-3" />,
      label: "Backend Offline",
      className: "text-destructive border-destructive/30 bg-destructive/10",
    },
  };

  const { icon, label, className } = config[status];

  return (
    <button
      onClick={checkHealth}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:opacity-80 ${className}`}
      title="Click to refresh"
    >
      {icon}
      {label}
    </button>
  );
};
