import { useState } from "react";
import { MapPin, Navigation, Store, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface Shop {
  name: string;
  distance: string;
  address: string;
  mapsUrl: string;
}

export const NearbyShopLocator = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);

  const findNearbyShops = async () => {
    setIsLoading(true);
    setLocationError(null);
    setShops([]);

    if (!navigator.geolocation) {
      setLocationError(t("location.notSupported", "आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता"));
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Search for fertilizer shops using OpenStreetMap Nominatim
        try {
          // Search for fertilizer/agricultural shops nearby
          const searchTerms = ["fertilizer", "agricultural", "krishi", "khad", "seeds"];
          const radius = 5000; // 5km radius
          
          // Use Overpass API for better results
          const query = `
            [out:json][timeout:25];
            (
              node["shop"="agrarian"](around:${radius},${latitude},${longitude});
              node["shop"="farm"](around:${radius},${latitude},${longitude});
              node["name"~"fertilizer|krishi|khad|seeds|agricultural",i](around:${radius},${latitude},${longitude});
              way["shop"="agrarian"](around:${radius},${latitude},${longitude});
              way["shop"="farm"](around:${radius},${latitude},${longitude});
            );
            out center;
          `;

          const response = await fetch(
            `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch shops");
          }

          const data = await response.json();
          
          // Process results
          const processedShops: Shop[] = data.elements.slice(0, 5).map((element: any) => {
            const lat = element.lat || element.center?.lat;
            const lon = element.lon || element.center?.lon;
            const distance = calculateDistance(latitude, longitude, lat, lon);
            
            return {
              name: element.tags?.name || t("shop.unnamed", "कृषि दुकान"),
              distance: `${distance.toFixed(1)} km`,
              address: element.tags?.["addr:street"] || element.tags?.["addr:city"] || t("shop.nearYou", "आपके पास"),
              mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
            };
          });

          // Sort by distance
          processedShops.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

          if (processedShops.length === 0) {
            // If no results from Overpass, provide Google Maps search link
            setShops([{
              name: t("shop.searchGoogle", "Google Maps पर खोजें"),
              distance: "-",
              address: t("shop.fertilizerNearby", "आसपास खाद/बीज की दुकानें"),
              mapsUrl: `https://www.google.com/maps/search/fertilizer+shop/@${latitude},${longitude},14z`,
            }]);
          } else {
            setShops(processedShops);
          }

          toast({
            title: t("location.found", "दुकानें मिलीं!"),
            description: `${processedShops.length || 1} ${t("shop.foundNearby", "दुकानें आपके पास")}`,
          });
        } catch (error) {
          console.error("Error fetching shops:", error);
          // Fallback to Google Maps search
          setShops([{
            name: t("shop.searchGoogle", "Google Maps पर खोजें"),
            distance: "-",
            address: t("shop.fertilizerNearby", "आसपास खाद/बीज की दुकानें"),
            mapsUrl: `https://www.google.com/maps/search/fertilizer+krishi+shop/@${latitude},${longitude},14z`,
          }]);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(t("location.denied", "कृपया लोकेशन की अनुमति दें"));
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError(t("location.unavailable", "लोकेशन उपलब्ध नहीं है"));
            break;
          case error.TIMEOUT:
            setLocationError(t("location.timeout", "लोकेशन टाइमआउट"));
            break;
          default:
            setLocationError(t("location.error", "लोकेशन में त्रुटि"));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Store className="h-5 w-5 text-primary" />
          </div>
          {t("shop.title", "पास की खाद दुकानें")}
        </CardTitle>
        <CardDescription>
          {t("shop.description", "GPS से अपने पास की कृषि दुकानें खोजें")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={findNearbyShops}
          disabled={isLoading}
          className="w-full bg-gradient-primary hover:opacity-90"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              {t("shop.searching", "खोज रहे हैं...")}
            </>
          ) : (
            <>
              <Navigation className="h-5 w-5 mr-2" />
              {t("shop.findNearby", "पास की दुकानें खोजें")}
            </>
          )}
        </Button>

        {locationError && (
          <div className="text-center text-destructive text-sm py-2">
            {locationError}
          </div>
        )}

        {shops.length > 0 && (
          <div className="space-y-3 mt-4">
            {shops.map((shop, index) => (
              <a
                key={index}
                href={shop.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{shop.name}</p>
                    <p className="text-sm text-muted-foreground">{shop.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {shop.distance !== "-" && (
                    <span className="text-muted-foreground">{shop.distance}</span>
                  )}
                  <ExternalLink className="h-4 w-4 text-primary" />
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
