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
                      {fertilizer.quantity}
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
