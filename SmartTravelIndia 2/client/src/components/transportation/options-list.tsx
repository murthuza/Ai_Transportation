import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Train, 
  Plane, 
  Bus, 
  Car, 
  Search, 
  AlertCircle, 
  ChevronDown, 
  Wifi, 
  Package, 
  Info, 
  Layers, 
  Clock, 
  Star,
  Zap,
  Map,
  Route
} from "lucide-react";
import { RouteWithDetails } from "@shared/schema";
import { formatDuration, formatPrice, getTransportModeBgColor, calculateDistance } from "@/lib/utils";

interface OptionsListProps {
  routes: RouteWithDetails[];
  loading: boolean;
  onSelect: (route: RouteWithDetails) => void;
  selectedRoute: RouteWithDetails | null;
}

export default function OptionsList({ routes, loading, onSelect, selectedRoute }: OptionsListProps) {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("time");
  const [expandedRouteId, setExpandedRouteId] = useState<number | null>(null);
  
  // Get icon for transportation mode
  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'train':
        return <Train className="h-6 w-6 text-red-600" />;
      case 'flight':
        return <Plane className="h-6 w-6 text-purple-600" />;
      case 'bus':
        return <Bus className="h-6 w-6 text-green-600" />;
      case 'car':
        return <Car className="h-6 w-6 text-blue-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };
  
  // Filter routes by transport mode
  const filteredRoutes = routes.filter(route => {
    if (filter === "all") return true;
    return route.transportMode.name.toLowerCase() === filter.toLowerCase();
  });
  
  // Sort routes based on selection
  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    if (sortBy === "time") {
      return a.duration - b.duration;
    } else if (sortBy === "price") {
      return a.price - b.price;
    } else {
      return b.comfortScore - a.comfortScore;
    }
  });
  
  // Toggle route details
  const toggleRouteDetails = (id: number) => {
    if (expandedRouteId === id) {
      setExpandedRouteId(null);
    } else {
      setExpandedRouteId(id);
    }
  };
  
  // Render amenity icon
  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wi-fi':
      case 'wifi':
        return <Wifi className="h-3.5 w-3.5 mr-1" />;
      case 'meal':
      case 'meals':
      case 'food options':
      case 'snacks':
        return <Layers className="h-3.5 w-3.5 mr-1" />;
      case 'baggage allowed':
      case 'luggage allowed':
        return <Package className="h-3.5 w-3.5 mr-1" />;
      default:
        return <Info className="h-3.5 w-3.5 mr-1" />;
    }
  };
  
  // Render comfort star rating
  const renderStarRating = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-5 w-5 ${i <= score ? 'text-amber-500' : 'text-gray-300'}`}
          fill={i <= score ? 'currentColor' : 'none'}
        />
      );
    }
    return stars;
  };
  
  return (
    <Card className="mt-8 bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Transportation Options</h3>
      
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 border-t-blue-500 animate-spin"></div>
        </div>
      )}
      
      {/* Results State */}
      {!loading && routes.length > 0 && (
        <div>
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-gray-200 pb-4">
            <span className="text-sm font-medium text-gray-700">Filter By:</span>
            
            {/* Mode Filters */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filter === "all" ? "default" : "outline"}
                className="h-8 rounded-full text-sm"
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button 
                variant={filter === "train" ? "default" : "outline"}
                className="h-8 rounded-full text-sm"
                onClick={() => setFilter("train")}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 mr-1"></span>
                Train
              </Button>
              <Button 
                variant={filter === "flight" ? "default" : "outline"}
                className="h-8 rounded-full text-sm"
                onClick={() => setFilter("flight")}
              >
                <span className="w-2 h-2 rounded-full bg-purple-600 mr-1"></span>
                Flight
              </Button>
              <Button 
                variant={filter === "bus" ? "default" : "outline"}
                className="h-8 rounded-full text-sm"
                onClick={() => setFilter("bus")}
              >
                <span className="w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                Bus
              </Button>
              <Button 
                variant={filter === "car" ? "default" : "outline"}
                className="h-8 rounded-full text-sm"
                onClick={() => setFilter("car")}
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 mr-1"></span>
                Car
              </Button>
            </div>
            
            {/* Sort Options */}
            <div className="ml-auto">
              <select 
                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 p-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="time">Sort by: Time (Fastest)</option>
                <option value="price">Sort by: Price (Lowest)</option>
                <option value="comfort">Sort by: Comfort (Best)</option>
              </select>
            </div>
          </div>
          
          {/* Option Cards */}
          <div className="space-y-4">
            {sortedRoutes.map((route) => (
              <div 
                key={route.id}
                className={`border ${selectedRoute?.id === route.id ? 'border-primary-500' : 'border-gray-200'} rounded-lg overflow-hidden hover:shadow-md transition`}
              >
                <div className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Option Header */}
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${getTransportModeBgColor(route.transportMode.name)} rounded-md`}>
                        {getTransportIcon(route.transportMode.name)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {route.transportMode.name} - {route.provider}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {route.originCity.name} → {route.destinationCity.name}
                        </div>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {route.tags.map((tag, idx) => {
                        let variant: "success" | "warning" | "info" = "info";
                        if (tag.includes("Best")) variant = "success";
                        if (tag.includes("Medium")) variant = "warning";
                        
                        return (
                          <Badge key={idx} variant={variant}>
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                    
                    {/* Price, Duration & Distance */}
                    <div className="flex items-center gap-4 text-right">
                      <div className="text-right">
                        <div className="text-xl font-semibold text-gray-900">
                          {formatPrice(route.price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDuration(route.duration)} • {route.distance || Math.round(calculateDistance(
                            route.originCity.latitude,
                            route.originCity.longitude,
                            route.destinationCity.latitude,
                            route.destinationCity.longitude
                          ))} km
                        </div>
                      </div>
                      <Button 
                        onClick={() => onSelect(route)}
                        variant={selectedRoute?.id === route.id ? "secondary" : "default"}
                      >
                        {selectedRoute?.id === route.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Details Button */}
                  <Button 
                    variant="link" 
                    className="mt-3 h-auto p-0 text-sm text-primary-700 font-medium hover:text-primary-800"
                    onClick={() => toggleRouteDetails(route.id)}
                  >
                    <span>{expandedRouteId === route.id ? "Hide Details" : "View Details"}</span>
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${expandedRouteId === route.id ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {/* Details Section (Collapsible) */}
                  {expandedRouteId === route.id && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Departure & Arrival */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Schedule & Distance</h5>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-lg font-medium">{route.departureTime}</div>
                              <div className="text-sm text-gray-500">{route.originCity.name}</div>
                            </div>
                            <div className="flex-1 px-2">
                              <div className="flex items-center">
                                <div className="h-0.5 flex-1 bg-gray-300"></div>
                                <Route className="h-4 w-4 text-gray-400 mx-1" />
                                <div className="h-0.5 flex-1 bg-gray-300"></div>
                              </div>
                              <div className="text-xs text-center text-gray-500 mt-1">
                                {route.distance || Math.round(calculateDistance(
                                  route.originCity.latitude,
                                  route.originCity.longitude,
                                  route.destinationCity.latitude,
                                  route.destinationCity.longitude
                                ))} km
                              </div>
                              <div className="text-xs text-center text-gray-500 mt-1">
                                {formatDuration(route.duration)}
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-medium">{route.arrivalTime}</div>
                              <div className="text-sm text-gray-500">{route.destinationCity.name}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Amenities */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Amenities</h5>
                          <div className="flex flex-wrap gap-2">
                            {route.amenities && Array.isArray(route.amenities) ? 
                              route.amenities.map((amenity: string, idx: number) => (
                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                  {getAmenityIcon(amenity)}
                                  {amenity}
                                </span>
                              )) : 
                              <span className="text-xs text-gray-500">No amenities information available</span>
                            }
                          </div>
                        </div>
                        
                        {/* Comfort Score */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Comfort Score</h5>
                          <div className="flex items-center space-x-1">
                            {renderStarRating(route.comfortScore)}
                            <span className="ml-1 text-sm text-gray-700">{route.comfortScore}.0</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{route.description}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {!loading && routes.length === 0 && (
        <div className="py-10 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-1">No routes found</h4>
          <p className="text-gray-500">Please try different locations or adjust your preferences.</p>
        </div>
      )}
    </Card>
  );
}
