import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Scan, Target, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceId";
import { useTranslation } from "react-i18next";

interface Stats {
  totalScans: number;
  totalDetections: number;
  avgConfidence: number;
  topWeed: string;
}

export const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalScans: 0,
    totalDetections: 0,
    avgConfidence: 0,
    topWeed: "-",
  });
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      const deviceId = getDeviceId();
      const { data } = await supabase
        .from("scan_history")
        .select("*")
        .eq("device_id", deviceId);

      if (data && data.length > 0) {
        const totalDetections = data.reduce((sum, r) => sum + (r.detection_count || 0), 0);
        const avgConf = data.reduce((sum, r) => sum + Number(r.avg_confidence || 0), 0) / data.length;

        // Find top weed
        const weedCounts: Record<string, number> = {};
        data.forEach((r) => {
          const detections = r.detections as any[];
          if (Array.isArray(detections)) {
            detections.forEach((d: any) => {
              if (d.label) {
                weedCounts[d.label] = (weedCounts[d.label] || 0) + 1;
              }
            });
          }
        });
        const topWeed = Object.entries(weedCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

        setStats({
          totalScans: data.length,
          totalDetections,
          avgConfidence: Math.round(avgConf),
          topWeed,
        });
      }
    };
    fetchStats();
  }, []);

  const statItems = [
    { icon: Scan, label: t("dashboard.totalScans", "Total Scans"), value: stats.totalScans, color: "text-primary" },
    { icon: Target, label: t("dashboard.totalDetections", "Detections Found"), value: stats.totalDetections, color: "text-accent" },
    { icon: TrendingUp, label: t("dashboard.avgConfidence", "Avg Confidence"), value: `${stats.avgConfidence}%`, color: "text-warning" },
    { icon: BarChart3, label: t("dashboard.topWeed", "Most Common Weed"), value: stats.topWeed, color: "text-crop" },
  ];

  if (stats.totalScans === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
    >
      {statItems.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <Card className="glass border-border/50 hover:border-primary/30 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <item.icon className={`h-5 w-5 mx-auto mb-2 ${item.color}`} />
              <div className="text-xl md:text-2xl font-bold text-foreground truncate">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
