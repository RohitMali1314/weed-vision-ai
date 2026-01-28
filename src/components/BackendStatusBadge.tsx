import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

type BackendStatus = "checking" | "online" | "starting" | "offline";

interface BackendStatusBadgeProps {
  onStatusChange?: (status: BackendStatus) => void;
}

export const BackendStatusBadge = ({ onStatusChange }: BackendStatusBadgeProps) => {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const { t } = useTranslation();

  const checkHealth = useCallback(async () => {
    setStatus("checking");
    try {
      const backendUrl = "https://backend-rid6.onrender.com";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${backendUrl}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.status === "ok" || data.ok) {
          setStatus("online");
          onStatusChange?.("online");
          return;
        }
      }
      // Server responded but not healthy
      setStatus("starting");
      onStatusChange?.("starting");
    } catch (error) {
      // Might be CORS or server sleeping
      // Try a no-cors ping to see if it's at least responding
      try {
        const backendUrl = "https://backend-rid6.onrender.com";
        await fetch(backendUrl, { method: "GET", mode: "no-cors" });
        // If no error, server is at least starting
        setStatus("starting");
        onStatusChange?.("starting");
      } catch {
        setStatus("offline");
        onStatusChange?.("offline");
      }
    }
  }, [onStatusChange]);

  useEffect(() => {
    checkHealth();
    // Re-check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const statusConfig = {
    checking: {
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
      label: t("status.checking") || "Checking...",
      className: "bg-muted text-muted-foreground border-border",
    },
    online: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: t("status.online") || "Online",
      className: "bg-green-500/10 text-green-500 border-green-500/30",
    },
    starting: {
      icon: <AlertCircle className="w-3 h-3" />,
      label: t("status.starting") || "Starting...",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    },
    offline: {
      icon: <XCircle className="w-3 h-3" />,
      label: t("status.offline") || "Offline",
      className: "bg-destructive/10 text-destructive border-destructive/30",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={`cursor-pointer hover:opacity-80 transition-opacity ${config.className}`}
      onClick={checkHealth}
      title={t("status.clickToRefresh") || "Click to refresh status"}
    >
      {config.icon}
      <span className="ml-1.5">{config.label}</span>
    </Badge>
  );
};
