import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Train, Plane, Bus, Car } from "lucide-react";
import { RouteWithDetails } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { City } from "@shared/schema";
import { formatDuration, formatPrice } from "@/lib/utils";

interface MapContainerProps {
  origin: string;
  destination: string;
  routes: RouteWithDetails[];
  selectedRoute: RouteWithDetails | null;
}

// India map coordinates
const MAP_BOUNDS = {
  minLat: 8.0, // Southern tip of India
  maxLat: 37.0, // Northern border
  minLong: 68.0, // Western border
  maxLong: 97.0, // Eastern border
};

// Map coordinates to screen position
function mapCoordinatesToPosition(lat: number, long: number) {
  // Calculate percentage within the bounds
  const latRange = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
  const longRange = MAP_BOUNDS.maxLong - MAP_BOUNDS.minLong;
  
  const latPercent = 1 - ((lat - MAP_BOUNDS.minLat) / latRange); // Invert because screen coordinates go down
  const longPercent = (long - MAP_BOUNDS.minLong) / longRange;
  
  // Convert to screen percentages (adding some padding)
  const top = 10 + (latPercent * 80); // 10%-90% of height
  const left = 10 + (longPercent * 80); // 10%-90% of width
  
  return { top, left };
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

export default function MapContainer({ origin, destination, routes, selectedRoute }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [originCity, setOriginCity] = useState<City | null>(null);
  const [destinationCity, setDestinationCity] = useState<City | null>(null);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  
  // Fetch all cities for coordinates
  const { data: cities } = useQuery<City[]>({
    queryKey: ['/api/cities'],
    staleTime: Infinity, // Cities don't change frequently
  });
  
  // Update origin and destination cities when they change
  useEffect(() => {
    if (cities) {
      const originMatch = cities.find((city) => 
        city.name.toLowerCase() === origin.toLowerCase()
      );
      const destMatch = cities.find((city) => 
        city.name.toLowerCase() === destination.toLowerCase()
      );
      
      setOriginCity(originMatch || null);
      setDestinationCity(destMatch || null);
      
      console.log("Map Container cities:", cities);
      console.log("Origin match:", originMatch);
      console.log("Destination match:", destMatch);
    }
  }, [cities, origin, destination]);
  
  // Zoom in
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2));
  };
  
  // Zoom out
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.6));
  };
  
  // Reset map
  const handleResetMap = () => {
    setScale(1);
  };
  
  // Generate route line between two cities - better visualization with curved paths
  const getPathStyle = (route: RouteWithDetails, index: number) => {
    if (!originCity || !destinationCity) return {};
    
    const originPos = mapCoordinatesToPosition(originCity.latitude, originCity.longitude);
    const destPos = mapCoordinatesToPosition(destinationCity.latitude, destinationCity.longitude);
    
    // Calculate angle and distance between cities
    const deltaY = (destPos.top - originPos.top);
    const deltaX = (destPos.left - originPos.left);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Calculate distance using the Pythagorean theorem
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Set different offset for each transport mode to avoid overlapping
    // More spacing for better visualization
    const offsetMultiplier = route.transportMode.name.toLowerCase() === 'flight' ? 5 : 3;
    const offsetX = Math.sin((Math.PI / 180) * angle) * (index * offsetMultiplier);
    const offsetY = -Math.cos((Math.PI / 180) * angle) * (index * offsetMultiplier);
    
    // Use Google Maps style colors - blue for all routes like in the reference image
    const color = "#4285F4"; // Google Maps blue color for all routes
    
    // Different styling based on transport mode
    const isSelected = selectedRoute && selectedRoute.id === route.id;
    const isFlight = route.transportMode.name.toLowerCase() === 'flight';
    const lineThickness = isSelected ? '5px' : '3px';
    
    return {
      top: `${originPos.top + offsetY}%`,
      left: `${originPos.left + offsetX}%`,
      width: `${distance}%`,
      transform: `rotate(${angle}deg)`,
      background: isFlight 
        ? `linear-gradient(90deg, ${color}aa, ${color}, ${color}aa)` 
        : color,
      opacity: isSelected ? 1 : 0.85,
      height: lineThickness,
      transformOrigin: 'left center',
      zIndex: isSelected ? 12 : 5,
      borderRadius: '999px',
      boxShadow: isSelected 
        ? `0 0 0 1px white, 0 0 8px 2px ${color}` 
        : `0 0 4px 1px ${color}80`,
    };
  };
  
  const getTransportIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'train':
        return <Train className="h-4 w-4 text-white" />;
      case 'flight':
        return <Plane className="h-4 w-4 text-white" />;
      case 'bus':
        return <Bus className="h-4 w-4 text-white" />;
      case 'car':
        return <Car className="h-4 w-4 text-white" />;
      default:
        return <MapPin className="h-4 w-4 text-white" />;
    }
  };
  
  // Calculate positions for origin and destination
  const originPosition = originCity ? mapCoordinatesToPosition(originCity.latitude, originCity.longitude) : null;
  const destPosition = destinationCity ? mapCoordinatesToPosition(destinationCity.latitude, destinationCity.longitude) : null;
  
  return (
    <Card className="flex-1 rounded-lg bg-white shadow-md overflow-hidden">
      {/* Map Header */}
      <div className="bg-gradient-to-r from-indigo-800 to-purple-800 text-white p-4 shadow-md">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-400 rounded-full p-1 shadow-md">
                <MapPin className="h-5 w-5 text-indigo-800" />
              </div>
              <h3 className="text-lg font-bold tracking-wide">
                Interactive <span className="text-yellow-300">India Map</span>
              </h3>
            </div>
            <div className="flex items-center space-x-1.5">
              <Button 
                variant="outline"
                onClick={handleZoomIn}
                size="sm"
                className="bg-indigo-700 border-indigo-600 hover:bg-indigo-600 text-white h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleZoomOut}
                size="sm"
                className="bg-indigo-700 border-indigo-600 hover:bg-indigo-600 text-white h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                onClick={handleResetMap}
                size="sm"
                className="bg-indigo-700 border-indigo-600 hover:bg-indigo-600 text-white h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/90 bg-indigo-700/50 py-1 px-3 rounded-full">
              {originCity && destinationCity ? (
                <span className="flex items-center">
                  <span className="font-medium text-indigo-200">Route:</span> 
                  <span className="mx-1 font-bold text-yellow-300">{originCity.name}</span>
                  <span className="mx-1">to</span>
                  <span className="font-bold text-yellow-300">{destinationCity.name}</span>
                </span>
              ) : (
                'Select origin and destination cities to see routes'
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoutes(!showRoutes)}
              className="bg-yellow-400 text-indigo-900 border-yellow-400 hover:bg-yellow-300 font-medium text-xs"
            >
              {showRoutes ? 'Hide Routes' : 'Show Routes'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Map Display Area */}
      <div 
        ref={mapRef}
        className="relative w-full h-full min-h-[500px] bg-cover bg-center bg-no-repeat rounded-b-lg overflow-hidden border-t"
        style={{ 
          backgroundImage: "url('https://raw.githubusercontent.com/lipis/flag-icons/master/assets/docs/india-map.png')",
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundColor: "#F8FAFC", /* Light background for the map */
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: "transform 0.3s ease-in-out",
          boxShadow: "inset 0 0 50px rgba(0,0,0,0.15)",
          filter: "saturate(1.2) contrast(1.1)"
        }}
      >
        {/* City markers for all cities */}
        {cities?.map(city => {
          const position = mapCoordinatesToPosition(city.latitude, city.longitude);
          const isOrigin = city.name === origin;
          const isDestination = city.name === destination;
          
          // Only show markers for origin, destination, or if it's a major city
          if (!isOrigin && !isDestination) {
            return (
              <div
                key={city.id}
                className="absolute"
                style={{ 
                  top: `${position.top}%`, 
                  left: `${position.left}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5
                }}
              >
                <div className="flex flex-col items-center group">
                  <div className="h-5 w-5 rounded-full bg-green-500 shadow-lg flex items-center justify-center text-[8px] font-bold text-white border-2 border-white">
                    {city.name.charAt(0)}
                  </div>
                  <span className="text-[9px] font-medium text-black bg-white/90 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg mt-1">
                    {city.name}
                  </span>
                </div>
              </div>
            );
          }
          return null;
        })}
        
        {/* Map markers for origin and destination */}
        {originPosition && (
          <div className="absolute" style={{ 
            top: `${originPosition.top}%`, 
            left: `${originPosition.left}%`,
            transform: 'translate(-50%, -100%)',
            zIndex: 20
          }}>
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Animated rings for Google Maps style emphasis */}
                <div className="absolute -inset-2 bg-green-100 rounded-full opacity-40 animate-ping"></div>
                <div className="absolute -inset-4 bg-green-50 rounded-full opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Main marker - Google Maps style */}
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-lg">
                  <span>A</span>
                </div>
              </div>
              <span className="px-3 py-1 mt-1 bg-white rounded-md shadow-lg text-sm font-medium text-gray-800">
                {origin}
              </span>
            </div>
          </div>
        )}
        
        {destPosition && (
          <div className="absolute" style={{ 
            top: `${destPosition.top}%`, 
            left: `${destPosition.left}%`,
            transform: 'translate(-50%, -100%)',
            zIndex: 20
          }}>
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Animated rings for Google Maps style emphasis */}
                <div className="absolute -inset-2 bg-green-100 rounded-full opacity-40 animate-ping"></div>
                <div className="absolute -inset-4 bg-green-50 rounded-full opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Main marker - Google Maps style */}
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-lg">
                  <span>B</span>
                </div>
              </div>
              <span className="px-3 py-1 mt-1 bg-white rounded-md shadow-lg text-sm font-medium text-gray-800">
                {destination}
              </span>
            </div>
          </div>
        )}
        
        {/* Traffic Visualization for Major Routes */}
        {originCity && destinationCity && (
          <>
            {/* Delhi-Mumbai Heavy Traffic */}
            {((originCity.name === "Delhi" && destinationCity.name === "Mumbai") || 
              (originCity.name === "Mumbai" && destinationCity.name === "Delhi")) && (
              <div className="absolute" style={{
                top: "35%",
                left: "45%",
                zIndex: 7
              }}>
                <div className="bg-red-100 px-2 py-1 rounded-full border border-red-300 shadow-md flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[10px] font-medium text-red-700">Heavy Traffic</span>
                </div>
              </div>
            )}
            
            {/* Bangalore-Chennai Moderate Traffic */}
            {((originCity.name === "Bangalore" && destinationCity.name === "Chennai") || 
              (originCity.name === "Chennai" && destinationCity.name === "Bangalore")) && (
              <div className="absolute" style={{
                top: "70%",
                left: "60%",
                zIndex: 7
              }}>
                <div className="bg-yellow-100 px-2 py-1 rounded-full border border-yellow-300 shadow-md flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  <span className="text-[10px] font-medium text-yellow-700">Moderate Traffic</span>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Map paths for different routes */}
        {showRoutes && routes.map((route, index) => (
          <div 
            key={route.id}
            className="absolute h-[2px] cursor-pointer"
            style={getPathStyle(route, index)}
            title={`${route.transportMode.name} - ${route.provider}`}
          >
            {/* Midpoint Icon for Transport Type */}
            <div 
              className={`absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white rounded-full p-1.5 shadow-xl ${
                selectedRoute && selectedRoute.id === route.id 
                ? 'scale-125 z-30 ring-2 ring-purple-400 ring-offset-2' 
                : 'border border-gray-300'
              } transition-all duration-300 hover:scale-110`}
              title={`${route.transportMode.name} by ${route.provider} - ${formatDuration(route.duration)} | ₹${route.price} | ${route.distance || Math.round(calculateDistance(
                route.originCity.latitude,
                route.originCity.longitude,
                route.destinationCity.latitude,
                route.destinationCity.longitude
              ))} km`}
            >
              <div className={`
                ${route.transportMode.name.toLowerCase() === 'train' ? 'bg-red-500' : 
                  route.transportMode.name.toLowerCase() === 'flight' ? 'bg-purple-500' : 
                  route.transportMode.name.toLowerCase() === 'bus' ? 'bg-green-500' : 'bg-blue-500'
                } p-1 rounded-full`}>
                {getTransportIcon(route.transportMode.name)}
              </div>
            </div>
          </div>
        ))}
        
        {/* Traffic Indicators */}
        <div className="absolute top-4 left-4 bg-indigo-900/85 p-2.5 rounded-lg shadow-lg border border-indigo-700 text-white">
          <div className="text-xs font-semibold mb-1.5 text-yellow-300 border-b border-indigo-700 pb-1">Live Traffic Updates</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 bg-red-900/30 px-2 py-1 rounded">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs">Heavy (Delhi-Mumbai)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-yellow-900/30 px-2 py-1 rounded">
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className="text-xs">Moderate (Bangalore-Chennai)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-green-900/30 px-2 py-1 rounded">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs">Light (Kolkata-Hyderabad)</span>
            </div>
            <div className="mt-1.5 text-[9px] text-indigo-200 italic text-right">
              Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-indigo-900/85 p-2.5 rounded-lg shadow-lg border border-indigo-700 text-white">
          <div className="text-xs font-semibold mb-1.5 text-yellow-300 border-b border-indigo-700 pb-1">Transport Types</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 hover:bg-indigo-800/50 px-2 py-1 rounded transition-colors">
              <div className="p-1 bg-red-500 rounded-full">
                <Train className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs">Train Routes</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-indigo-800/50 px-2 py-1 rounded transition-colors">
              <div className="p-1 bg-purple-500 rounded-full">
                <Plane className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs">Flight Routes</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-indigo-800/50 px-2 py-1 rounded transition-colors">
              <div className="p-1 bg-green-500 rounded-full">
                <Bus className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs">Bus Routes</span>
            </div>
            <div className="flex items-center gap-2 hover:bg-indigo-800/50 px-2 py-1 rounded transition-colors">
              <div className="p-1 bg-blue-500 rounded-full">
                <Car className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs">Taxi Routes</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
