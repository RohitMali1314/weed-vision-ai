import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface FertilizerData {
  name: string;
  quantity: string;
  frequency: string;
  type?: string;
}

interface FertilizerRecommendationsProps {
  fertilizers: FertilizerData[];
}

// Convert acres to hectares (1 acre = 0.4047 hectares)
const convertToIndianUnits = (quantity: string): string => {
  // Match pattern like "0.5 kg per acre" or "60 kg per acre"
  const acrePattern = /(\d+(?:\.\d+)?(?:[–—\-\u2013\u2014]\d+(?:\.\d+)?)?)\s*(kg|g|l|ml)\s*per\s*acre/gi;
  
  return quantity.replace(acrePattern, (match, amount, unit) => {
    // Handle range (e.g., "0.5–1.0")
    if (amount.includes('–') || amount.includes('—') || amount.includes('-') || amount.includes('\u2013') || amount.includes('\u2014')) {
      const parts = amount.split(/[–—\u2013\u2014\-]/).map((p: string) => p.trim());
      const converted = parts.map((p: string) => (parseFloat(p) * 2.47).toFixed(1));
      return `${converted.join('–')} ${unit} per hectare`;
    }
    
    // Single value
    const numValue = parseFloat(amount);
    const converted = (numValue * 2.47).toFixed(1);
    return `${converted} ${unit} per hectare`;
  });
};

export const FertilizerRecommendations = ({ fertilizers }: FertilizerRecommendationsProps) => {
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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-wheat/5">
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Fertilizer Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Application Frequency</TableHead>
                {fertilizers.some(f => f.type) && <TableHead>Type</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {fertilizers.map((fertilizer, index) => (
                <TableRow key={index} className="hover:bg-wheat/5">
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧪</span>
                      <span className="font-semibold">{fertilizer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-crop/10 border-crop">
                      {convertToIndianUnits(fertilizer.quantity)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📅</span>
                      <span className="text-sm">{fertilizer.frequency}</span>
                    </div>
                  </TableCell>
                  {fertilizers.some(f => f.type) && (
                    <TableCell>
                      {fertilizer.type && (
                        <Badge variant="secondary" className="bg-soil/10">
                          {fertilizer.type}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
