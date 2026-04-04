import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getTranslatedFertilizer } from "@/lib/fertilizerTranslations";

export interface FertilizerData {
  name: string;
  quantity: string;
  frequency: string;
  type?: string;
}

interface FertilizerRecommendationsProps {
  fertilizers: FertilizerData[];
}

const normalizeText = (text: string): string => {
  return text
    .replace(/â€"/g, '-')
    .replace(/–/g, '-')
    .replace(/—/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '-');
};

const convertToIndianUnits = (quantity: string): string => {
  const normalized = normalizeText(quantity);
  const acrePattern = /(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s*(kg|g|l|ml)\s*per\s*acre/gi;
  
  return normalized.replace(acrePattern, (match, amount, unit) => {
    if (amount.includes('-')) {
      const parts = amount.split('-').map((p: string) => p.trim());
      const converted = parts.map((p: string) => (parseFloat(p) * 2.47).toFixed(1));
      return `${converted.join('-')} ${unit} per hectare`;
    }
    const numValue = parseFloat(amount);
    const converted = (numValue * 2.47).toFixed(1);
    return `${converted} ${unit} per hectare`;
  });
};

const getFertilizerPrice = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes('glyphosate')) return '₹800-1200/L';
  if (normalized.includes('2,4-d')) return '₹600-900/L';
  if (normalized.includes('atrazine')) return '₹700-1000/L';
  if (normalized.includes('pendimethalin')) return '₹500-800/L';
  if (normalized.includes('metribuzin')) return '₹1000-1500/kg';
  if (normalized.includes('paraquat')) return '₹900-1200/L';
  if (normalized.includes('dicamba')) return '₹800-1100/L';
  return '₹600-1200';
};

const getStoreUrls = (fertilizerName: string) => {
  const searchTerm = encodeURIComponent(`${fertilizerName} herbicide fertilizer agriculture`);
  return {
    amazon: `https://www.amazon.in/s?k=${searchTerm}`,
    flipkart: `https://www.flipkart.com/search?q=${searchTerm}`,
    bigbasket: `https://www.bigbasket.com/ps/?q=${searchTerm}`,
  };
};

export const FertilizerRecommendations = ({ fertilizers }: FertilizerRecommendationsProps) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  if (!fertilizers || fertilizers.length === 0) return null;

  return (
    <Card className="glass border-wheat/15 hover:border-wheat/30 transition-all duration-500">
      <CardHeader className="border-b border-border/30">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2.5 bg-wheat/15 rounded-xl border border-wheat/20">
            <span className="text-lg">🌿</span>
          </div>
          {t("fertilizer.title")}
        </CardTitle>
        <CardDescription className="text-base">
          💊 {t("fertilizer.descriptionFull")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <div className="space-y-5">
          {fertilizers.map((fertilizer, index) => {
            const storeUrls = getStoreUrls(fertilizer.name);
            const translated = fertilizer.type 
              ? getTranslatedFertilizer(fertilizer.type, currentLang) 
              : null;
            const displayName = translated?.name || normalizeText(fertilizer.name);
            const displayQuantity = translated?.quantity || convertToIndianUnits(fertilizer.quantity);
            const displayFrequency = translated?.frequency || normalizeText(fertilizer.frequency);
            
            return (
              <Card key={index} className="glass-subtle border-wheat/15 hover:border-primary/25 transition-all duration-500 hover-lift group">
                <CardContent className="p-5 md:p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-wheat/20 to-crop/10 border border-wheat/20 group-hover:scale-110 transition-transform duration-300">
                            <span className="text-xl">🧪</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-foreground">
                              {displayName}
                            </h3>
                            {fertilizer.type && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mt-1">
                                {fertilizer.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-accent/10 border-accent/30 font-bold text-base px-3 py-1.5">
                        {getFertilizerPrice(fertilizer.name)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl glass-subtle">
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t("fertilizer.quantity")}</p>
                        <Badge variant="outline" className="bg-crop/10 border-crop/30 font-medium">
                          {displayQuantity}
                        </Badge>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t("fertilizer.frequency")}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📅</span>
                          <span className="text-sm font-medium text-foreground">{displayFrequency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-sm font-semibold text-muted-foreground">{t("fertilizer.buyFrom")}</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "Amazon", url: storeUrls.amazon },
                          { label: "Flipkart", url: storeUrls.flipkart },
                          { label: "BigBasket", url: storeUrls.bigbasket },
                        ].map((store) => (
                          <Button 
                            key={store.label}
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(store.url, '_blank')}
                            className="gap-1.5 border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 hover-scale min-w-0"
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            <span className="font-semibold truncate">{store.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
