import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RouteWithDetails } from "@shared/schema";
import { formatDuration, formatPrice, getTransportModeBgColor } from "@/lib/utils";
import { Info, ChevronDown, Train, Plane, Bus, Car, AlertCircle } from "lucide-react";
import { useState } from "react";

interface RecommendationProps {
  routes: RouteWithDetails[];
  preference: "time" | "cost" | "comfort";
}

export default function Recommendation({ routes, preference }: RecommendationProps) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  
  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'train':
        return <Train className="h-5 w-5 text-red-600" />;
      case 'flight':
        return <Plane className="h-5 w-5 text-purple-600" />;
      case 'bus':
        return <Bus className="h-5 w-5 text-green-600" />;
      case 'car':
        return <Car className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };
  
  // Sort routes based on preference
  const sortedRoutes = useMemo(() => {
    if (preference === "time") {
      return [...routes].sort((a, b) => a.duration - b.duration);
    } else if (preference === "cost") {
      return [...routes].sort((a, b) => a.price - b.price);
    } else {
      return [...routes].sort((a, b) => b.comfortScore - a.comfortScore);
    }
  }, [routes, preference]);
  
  // Get recommendation message based on preference
  const getRecommendationMessage = () => {
    switch (preference) {
      case "time":
        return "Based on your preference for time, we recommend:";
      case "cost":
        return "Based on your preference for cost, we recommend:";
      case "comfort":
        return "Based on your preference for comfort, we recommend:";
      default:
        return "Based on your preferences, we recommend:";
    }
  };
  
  // Get explanation for recommendation
  const getExplanation = (route: RouteWithDetails) => {
    if (preference === "time") {
      const secondFastest = sortedRoutes[1];
      const timeSaved = secondFastest ? (secondFastest.duration - route.duration) : 0;
      return `This is the fastest option and aligns with your time preference. ${
        timeSaved > 0 ? `You'll save approximately ${formatDuration(timeSaved)} compared to the next fastest option.` : ''
      }`;
    } else if (preference === "cost") {
      const secondCheapest = sortedRoutes[1];
      const moneySaved = secondCheapest ? (secondCheapest.price - route.price) : 0;
      return `This is the most economical option and aligns with your budget preference. ${
        moneySaved > 0 ? `You'll save approximately ${formatPrice(moneySaved)} compared to the next cheapest option.` : ''
      }`;
    } else {
      return `This is the most comfortable option with a comfort score of ${route.comfortScore}/5. ${route.description}`;
    }
  };
  
  // Get top recommendation
  const topRecommendation = sortedRoutes.length > 0 ? sortedRoutes[0] : null;
  
  // Get alternative recommendations (up to 2)
  const alternativeRecommendations = sortedRoutes.slice(1, 3);
  
  if (!topRecommendation) {
    return null;
  }
  
  return (
    <div className="mt-6 bg-primary-50 border border-primary-100 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-primary-100 rounded-full">
          <Info className="h-6 w-6 text-primary-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-primary-800 mb-1">AI Recommendation</h3>
          <p className="text-sm text-primary-700 mb-2">{getRecommendationMessage()}</p>
          
          {/* Top Recommendation */}
          <Card className="bg-white rounded-md p-3 shadow-sm border border-primary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-1.5 ${getTransportModeBgColor(topRecommendation.transportMode.name)} rounded-md`}>
                  {getTransportIcon(topRecommendation.transportMode.name)}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {topRecommendation.transportMode.name} - {topRecommendation.provider}
                  </div>
                  <div className="text-xs text-gray-500">
                    {topRecommendation.originCity.name} → {topRecommendation.destinationCity.name} ({formatDuration(topRecommendation.duration)})
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{formatPrice(topRecommendation.price)}</div>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>{getExplanation(topRecommendation)}</p>
            </div>
          </Card>
          
          {/* Show Alternatives Button */}
          {alternativeRecommendations.length > 0 && (
            <Button 
              variant="link" 
              className="mt-3 h-auto p-0 text-sm text-primary-700 font-medium hover:text-primary-800"
              onClick={() => setShowAlternatives(!showAlternatives)}
            >
              <span>{showAlternatives ? "Hide alternate recommendations" : "View alternate recommendations"}</span>
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showAlternatives ? 'rotate-180' : ''}`} />
            </Button>
          )}
          
          {/* Alternative Recommendations */}
          {showAlternatives && alternativeRecommendations.map((route) => (
            <Card key={route.id} className="mt-3 bg-white rounded-md p-3 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 ${getTransportModeBgColor(route.transportMode.name)} rounded-md`}>
                    {getTransportIcon(route.transportMode.name)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {route.transportMode.name} - {route.provider}
                    </div>
                    <div className="text-xs text-gray-500">
                      {route.originCity.name} → {route.destinationCity.name} ({formatDuration(route.duration)})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{formatPrice(route.price)}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
