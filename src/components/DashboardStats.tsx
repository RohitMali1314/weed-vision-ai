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
    { icon: Scan, label: t("dashboard.totalScans", "Total Scans"), value: stats.totalScans, gradient: "from-primary/20 to-primary/5", iconColor: "text-primary", borderColor: "border-primary/15" },
    { icon: Target, label: t("dashboard.totalDetections", "Detections Found"), value: stats.totalDetections, gradient: "from-accent/20 to-accent/5", iconColor: "text-accent", borderColor: "border-accent/15" },
    { icon: TrendingUp, label: t("dashboard.avgConfidence", "Avg Confidence"), value: `${stats.avgConfidence}%`, gradient: "from-warning/20 to-warning/5", iconColor: "text-warning", borderColor: "border-warning/15" },
    { icon: BarChart3, label: t("dashboard.topWeed", "Most Common Weed"), value: stats.topWeed, gradient: "from-crop/20 to-crop/5", iconColor: "text-crop", borderColor: "border-crop/15" },
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
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          <Card className={`glass ${item.borderColor} hover:shadow-glow transition-all duration-500 hover-lift group`}>
            <CardContent className="p-4 md:p-5">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className={`h-5 w-5 ${item.iconColor}`} />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground tracking-tight truncate">{item.value}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{item.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};
