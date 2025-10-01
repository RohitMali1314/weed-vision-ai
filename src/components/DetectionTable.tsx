import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Detection } from "@/pages/Index";

interface DetectionTableProps {
  detections: Detection[];
}

export const DetectionTable = ({ detections }: DetectionTableProps) => {
  const getConfidenceVariant = (confidence: number) => {
    if (confidence >= 90) return "default";
    if (confidence >= 75) return "secondary";
    return "outline";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-success";
    if (confidence >= 75) return "text-primary";
    return "text-warning";
  };

  if (detections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No weeds detected in this image
      </div>
    );
  }

  const hasBoundingBoxes = detections.some(d => d.bbox);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Confidence</TableHead>
              {hasBoundingBoxes && <TableHead className="text-right">Bounding Box</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {detections.map((detection, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {detection.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={getConfidenceVariant(detection.confidence)}>
                      {detection.confidence.toFixed(1)}%
                    </Badge>
                    <span className={`text-sm font-medium ${getConfidenceColor(detection.confidence)}`}>
                      {detection.confidence >= 90 ? "High" : 
                       detection.confidence >= 75 ? "Medium" : "Low"}
                    </span>
                  </div>
                </TableCell>
                {hasBoundingBoxes && (
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {detection.bbox ? `[${detection.bbox.map(coord => coord.toFixed(0)).join(', ')}]` : 'N/A'}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Summary */}
      <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg text-sm">
        <span className="text-muted-foreground">
          Total detections: <strong>{detections.length}</strong>
        </span>
        <span className="text-muted-foreground">
          Highest confidence: <strong className="text-success">
            {Math.max(...detections.map(d => d.confidence)).toFixed(1)}%
          </strong>
        </span>
      </div>
    </div>
  );
};