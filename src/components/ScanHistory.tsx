import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceId";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface ScanRecord {
  id: string;
  created_at: string;
  detection_count: number;
  avg_confidence: number;
  detections: any[];
}

export const ScanHistory = () => {
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const fetchHistory = async () => {
    const deviceId = getDeviceId();
    const { data } = await supabase
      .from("scan_history")
      .select("id, created_at, detection_count, avg_confidence, detections")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) setRecords(data as ScanRecord[]);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    const deviceId = getDeviceId();
    await supabase.from("scan_history").delete().eq("device_id", deviceId);
    setRecords([]);
    toast({ title: t("history.cleared", "History cleared") });
  };

  if (records.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass border-border/50">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              {t("history.title", "Scan History")}
              <span className="text-sm text-muted-foreground font-normal">({records.length})</span>
            </div>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CardTitle>
        </CardHeader>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="pt-0 space-y-2">
                {records.map((r, i) => {
                  const detections = Array.isArray(r.detections) ? r.detections : [];
                  const labels = detections.map((d: any) => d.label).filter(Boolean);
                  const uniqueLabels = [...new Set(labels)];

                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {r.detection_count} {t("history.detections", "detections")}
                          <span className="text-muted-foreground ml-2">
                            ({Math.min(Number(r.avg_confidence), 100).toFixed(0)}% avg)
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(r.created_at).toLocaleDateString()} · {uniqueLabels.join(", ") || "-"}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="w-full mt-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t("history.clear", "Clear History")}
                </Button>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
