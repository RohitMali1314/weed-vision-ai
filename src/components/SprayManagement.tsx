import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, isPast, isToday, isTomorrow, addDays, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Plus, Trash2, CalendarDays, AlertTriangle, CheckCircle, Clock, Edit2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceId } from "@/lib/deviceId";
import { cn } from "@/lib/utils";

interface SprayRecord {
  id: string;
  device_id: string;
  crop_name: string;
  spray_type: string;
  product_name: string;
  quantity: string;
  spray_date: string;
  next_spray_date: string;
  created_at: string;
}

const SPRAY_INTERVALS: Record<string, number> = {
  fertilizer: 15,
  herbicide: 7,
  pesticide: 10,
};

export const SprayManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [records, setRecords] = useState<SprayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [cropName, setCropName] = useState("");
  const [sprayType, setSprayType] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sprayDate, setSprayDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("spray_schedules")
      .select("*")
      .eq("device_id", getDeviceId())
      .order("next_spray_date", { ascending: true });

    if (!error && data) {
      setRecords(data as SprayRecord[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setCropName("");
    setSprayType("");
    setProductName("");
    setQuantity("");
    setSprayDate(new Date());
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!cropName || !sprayType || !productName || !quantity || !sprayDate) {
      toast({ title: t("spray.fillAll"), variant: "destructive" });
      return;
    }

    const interval = SPRAY_INTERVALS[sprayType] || 10;
    const nextDate = addDays(sprayDate, interval);

    if (editingId) {
      const { error } = await supabase
        .from("spray_schedules")
        .update({
          crop_name: cropName,
          spray_type: sprayType,
          product_name: productName,
          quantity,
          spray_date: sprayDate.toISOString(),
          next_spray_date: nextDate.toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        toast({ title: t("spray.error"), variant: "destructive" });
        return;
      }
      toast({ title: t("spray.updated") });
    } else {
      const { error } = await supabase.from("spray_schedules").insert({
        device_id: getDeviceId(),
        crop_name: cropName,
        spray_type: sprayType,
        product_name: productName,
        quantity,
        spray_date: sprayDate.toISOString(),
        next_spray_date: nextDate.toISOString(),
      });

      if (error) {
        toast({ title: t("spray.error"), variant: "destructive" });
        return;
      }
      toast({ title: t("spray.saved") });
    }

    resetForm();
    fetchRecords();
  };

  const handleEdit = (record: SprayRecord) => {
    setCropName(record.crop_name);
    setSprayType(record.spray_type);
    setProductName(record.product_name);
    setQuantity(record.quantity);
    setSprayDate(new Date(record.spray_date));
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("spray_schedules").delete().eq("id", id);
    toast({ title: t("spray.deleted") });
    fetchRecords();
  };

  const getStatusBadge = (nextDate: string) => {
    const next = new Date(nextDate);
    const daysLeft = differenceInDays(next, new Date());

    if (isPast(next) && !isToday(next)) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t("spray.overdue")}
        </Badge>
      );
    }
    if (isToday(next)) {
      return (
        <Badge className="gap-1 bg-warning text-warning-foreground">
          <Clock className="h-3 w-3" />
          {t("spray.today")}
        </Badge>
      );
    }
    if (isTomorrow(next)) {
      return (
        <Badge className="gap-1 bg-accent text-accent-foreground">
          <Clock className="h-3 w-3" />
          {t("spray.tomorrow")}
        </Badge>
      );
    }
    if (daysLeft <= 3) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          {daysLeft} {t("spray.daysLeft")}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        {daysLeft} {t("spray.daysLeft")}
      </Badge>
    );
  };

  const sprayTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      fertilizer: t("spray.typeFertilizer"),
      herbicide: t("spray.typeHerbicide"),
      pesticide: t("spray.typePesticide"),
    };
    return map[type] || type;
  };

  const overdueCount = records.filter(r => isPast(new Date(r.next_spray_date)) && !isToday(new Date(r.next_spray_date))).length;
  const todayCount = records.filter(r => isToday(new Date(r.next_spray_date))).length;

  return (
    <Card className="glass border-primary/20 hover:border-primary/40 transition-all duration-300">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sprout className="h-6 w-6 text-primary" />
          </div>
          {t("spray.title")}
          {(overdueCount > 0 || todayCount > 0) && (
            <div className="flex gap-2 ml-auto">
              {overdueCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">{overdueCount} {t("spray.overdue")}</Badge>
              )}
              {todayCount > 0 && (
                <Badge className="bg-warning text-warning-foreground">{todayCount} {t("spray.dueToday")}</Badge>
              )}
            </div>
          )}
        </CardTitle>
        <CardDescription>{t("spray.description")}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Add / Toggle Form Button */}
        <Button
          onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
          variant={showForm ? "outline" : "default"}
          className="w-full gap-2"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? t("spray.cancel") : t("spray.addNew")}
        </Button>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl border border-border">
                <div className="space-y-2">
                  <Label>{t("spray.cropName")}</Label>
                  <Input
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder={t("spray.cropPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("spray.sprayType")}</Label>
                  <Select value={sprayType} onValueChange={setSprayType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("spray.selectType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fertilizer">{t("spray.typeFertilizer")}</SelectItem>
                      <SelectItem value="herbicide">{t("spray.typeHerbicide")}</SelectItem>
                      <SelectItem value="pesticide">{t("spray.typePesticide")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("spray.productName")}</Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={t("spray.productPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("spray.quantity")}</Label>
                  <Input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={t("spray.quantityPlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("spray.sprayDate")}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !sprayDate && "text-muted-foreground")}>
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {sprayDate ? format(sprayDate, "PPP") : t("spray.pickDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={sprayDate} onSelect={setSprayDate} className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>{t("spray.nextSpray")}</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted text-muted-foreground text-sm">
                    {sprayDate && sprayType
                      ? format(addDays(sprayDate, SPRAY_INTERVALS[sprayType] || 10), "PPP")
                      : t("spray.autoCalculated")}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Button onClick={handleSubmit} className="w-full gap-2">
                    {editingId ? t("spray.update") : t("spray.save")}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Records List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">{t("spray.loading")}</div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sprout className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>{t("spray.noRecords")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isPast(new Date(record.next_spray_date)) && !isToday(new Date(record.next_spray_date))
                    ? "border-destructive/50 bg-destructive/5"
                    : isToday(new Date(record.next_spray_date))
                    ? "border-warning/50 bg-warning/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">{record.crop_name}</span>
                      <Badge variant="secondary" className="text-xs">{sprayTypeLabel(record.spray_type)}</Badge>
                      {getStatusBadge(record.next_spray_date)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {record.product_name} • {record.quantity}
                    </p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>🗓 {t("spray.sprayed")}: {format(new Date(record.spray_date), "dd MMM yyyy")}</span>
                      <span>📅 {t("spray.next")}: {format(new Date(record.next_spray_date), "dd MMM yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(record)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(record.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
