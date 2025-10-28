import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface FertilizerData {
  name: string;
  quantity: string;
  frequency: string;
  type?: string;
}

interface FertilizerRecommendationsProps {
  fertilizers: FertilizerData[];
}

// Normalize text by replacing all types of dashes with simple ASCII hyphen
const normalizeText = (text: string): string => {
  return text
    .replace(/â€"/g, '-')  // Replace garbled en-dash
    .replace(/–/g, '-')    // Replace en-dash
    .replace(/—/g, '-')    // Replace em-dash
    .replace(/\u2013/g, '-') // Replace Unicode en-dash
    .replace(/\u2014/g, '-'); // Replace Unicode em-dash
};

// Convert acres to hectares (1 acre = 0.4047 hectares)
const convertToIndianUnits = (quantity: string): string => {
  // First normalize the text
  const normalized = normalizeText(quantity);
  
  // Match pattern like "0.5 kg per acre" or "60 kg per acre"
  const acrePattern = /(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s*(kg|g|l|ml)\s*per\s*acre/gi;
  
  return normalized.replace(acrePattern, (match, amount, unit) => {
    // Handle range (e.g., "0.5-1.0")
    if (amount.includes('-')) {
      const parts = amount.split('-').map((p: string) => p.trim());
      const converted = parts.map((p: string) => (parseFloat(p) * 2.47).toFixed(1));
      return `${converted.join('-')} ${unit} per hectare`;
    }
    
    // Single value
    const numValue = parseFloat(amount);
    const converted = (numValue * 2.47).toFixed(1);
    return `${converted} ${unit} per hectare`;
  });
};

// Estimated prices in INR for common fertilizers
const getFertilizerPrice = (name: string): string => {
  const normalized = name.toLowerCase();
  
  // Common herbicides and their approximate prices per liter/kg in INR
  if (normalized.includes('glyphosate')) return '₹800-1200/L';
  if (normalized.includes('2,4-d')) return '₹600-900/L';
  if (normalized.includes('atrazine')) return '₹700-1000/L';
  if (normalized.includes('pendimethalin')) return '₹500-800/L';
  if (normalized.includes('metribuzin')) return '₹1000-1500/kg';
  if (normalized.includes('paraquat')) return '₹900-1200/L';
  if (normalized.includes('dicamba')) return '₹800-1100/L';
  
  // Default price range
  return '₹600-1200';
};

// Generate store URLs for different e-commerce platforms
const getStoreUrls = (fertilizerName: string) => {
  const searchTerm = encodeURIComponent(`${fertilizerName} herbicide fertilizer agriculture`);
  
  return {
    amazon: `https://www.amazon.in/s?k=${searchTerm}`,
    flipkart: `https://www.flipkart.com/search?q=${searchTerm}`,
    bigbasket: `https://www.bigbasket.com/ps/?q=${searchTerm}`,
  };
};

export const FertilizerRecommendations = ({ fertilizers }: FertilizerRecommendationsProps) => {
  const { t } = useTranslation();

  if (!fertilizers || fertilizers.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-crop border-2 border-wheat/30 bg-card/90 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-wheat/10 to-crop/10 border-b border-wheat/20">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-wheat/20 rounded-lg">
            <span className="text-xl">🌿</span>
          </div>
          Fertilizer Recommendations
        </CardTitle>
        <CardDescription className="text-base">
          💊 Recommended fertilizers for optimal crop health and weed management
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          {fertilizers.map((fertilizer, index) => {
            const storeUrls = getStoreUrls(fertilizer.name);
            
            return (
              <Card key={index} className="border-2 border-wheat/30 hover:border-crop/50 transition-all duration-300 hover:shadow-crop animate-fade-in">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Fertilizer Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-wheat/20">
                            <span className="text-xl">🧪</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-foreground">
                              {normalizeText(fertilizer.name)}
                            </h3>
                            {fertilizer.type && (
                              <Badge variant="secondary" className="bg-soil/10 mt-1">
                                {fertilizer.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-accent/10 border-accent font-semibold text-base px-3 py-1">
                        {getFertilizerPrice(fertilizer.name)}
                      </Badge>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-wheat/5 border border-wheat/20">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Quantity</p>
                        <Badge variant="outline" className="bg-crop/10 border-crop">
                          {convertToIndianUnits(fertilizer.quantity)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">Frequency</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📅</span>
                          <span className="text-sm font-medium">{normalizeText(fertilizer.frequency)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Buy Buttons */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Buy from trusted stores:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(storeUrls.amazon, '_blank')}
                          className="gap-2 hover:bg-primary/10 hover:border-primary transition-all hover-scale"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="font-semibold">Amazon</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(storeUrls.flipkart, '_blank')}
                          className="gap-2 hover:bg-primary/10 hover:border-primary transition-all hover-scale"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="font-semibold">Flipkart</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(storeUrls.bigbasket, '_blank')}
                          className="gap-2 hover:bg-primary/10 hover:border-primary transition-all hover-scale"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="font-semibold">BigBasket</span>
                        </Button>
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
