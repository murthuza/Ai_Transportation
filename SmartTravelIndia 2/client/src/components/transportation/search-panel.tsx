import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchParams, City } from "@shared/schema";
import { MapPin, Search, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SearchPanelProps {
  cities: City[];
  onSearch: (params: SearchParams) => void;
  initialValues: SearchParams;
}

export default function SearchPanel({ cities, onSearch, initialValues }: SearchPanelProps) {
  const { toast } = useToast();
  const [origin, setOrigin] = useState(initialValues.origin);
  const [destination, setDestination] = useState(initialValues.destination);
  const [date, setDate] = useState(initialValues.date);
  const [preference, setPreference] = useState<"time" | "cost" | "comfort">(initialValues.preference);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside of suggestion dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginSuggestions(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Filter cities for auto suggestions - more aggressively match on both name and state
  const filteredOriginCities = origin 
    ? cities.filter(city => 
        city.name.toLowerCase().includes(origin.toLowerCase()) ||
        city.state.toLowerCase().includes(origin.toLowerCase())
      ).slice(0, 10)
    : [];
    
  const filteredDestinationCities = destination
    ? cities.filter(city => 
        city.name.toLowerCase().includes(destination.toLowerCase()) ||
        city.state.toLowerCase().includes(destination.toLowerCase())
      ).slice(0, 10)
    : [];
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!origin.trim()) {
      toast({
        title: "Error",
        description: "Please enter an origin city",
        variant: "destructive"
      });
      return;
    }
    
    if (!destination.trim()) {
      toast({
        title: "Error",
        description: "Please enter a destination city",
        variant: "destructive"
      });
      return;
    }
    
    // Validate that the entered cities exist in our database
    const originCity = cities.find(city => city.name.toLowerCase() === origin.toLowerCase());
    const destCity = cities.find(city => city.name.toLowerCase() === destination.toLowerCase());
    
    if (!originCity) {
      toast({
        title: "Error",
        description: `City "${origin}" not found. Please select from the suggestions.`,
        variant: "destructive"
      });
      return;
    }
    
    if (!destCity) {
      toast({
        title: "Error",
        description: `City "${destination}" not found. Please select from the suggestions.`,
        variant: "destructive"
      });
      return;
    }
    
    // Submit search params with exact city names from the database
    onSearch({
      origin: originCity.name,
      destination: destCity.name,
      date,
      preference
    });
  };
  
  // Handle swapping origin and destination
  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };
  
  // Set preference
  const handleSetPreference = (pref: "time" | "cost" | "comfort") => {
    setPreference(pref);
  };
  
  return (
    <Card className="w-full md:w-80 bg-white rounded-lg shadow-md md:sticky md:top-20 md:h-fit z-40">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan Your Journey</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Origin Input */}
          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <div className="relative" ref={originRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                id="origin" 
                name="origin" 
                type="text" 
                className="pl-10 pr-12"
                placeholder="Enter origin city"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  if (e.target.value) {
                    setShowOriginSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (origin && filteredOriginCities.length > 0) {
                    setShowOriginSuggestions(true);
                  }
                }}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 px-3 flex items-center bg-gray-100 rounded-r-md border-l"
                onClick={() => {
                  setOrigin("");
                  setShowOriginSuggestions(false);
                }}
              >
                <Search className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Origin autocomplete */}
              {showOriginSuggestions && filteredOriginCities.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                    {filteredOriginCities.length} cities found - click to select
                  </div>
                  {filteredOriginCities.map(city => (
                    <div
                      key={city.id}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        setOrigin(city.name);
                        setShowOriginSuggestions(false);
                      }}
                    >
                      <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                      <span className="font-medium">{city.name}</span>
                      <span className="text-gray-500 ml-1">, {city.state}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Swap Button */}
          <div className="flex justify-center">
            <Button 
              type="button" 
              variant="ghost"
              className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
              onClick={handleSwapLocations}
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          
          {/* Destination Input */}
          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <div className="relative" ref={destRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                id="destination" 
                name="destination" 
                type="text" 
                className="pl-10 pr-12"
                placeholder="Enter destination city"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  if (e.target.value) {
                    setShowDestSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (destination && filteredDestinationCities.length > 0) {
                    setShowDestSuggestions(true);
                  }
                }}
              />
              <button 
                type="button" 
                className="absolute inset-y-0 right-0 px-3 flex items-center bg-gray-100 rounded-r-md border-l"
                onClick={() => {
                  setDestination("");
                  setShowDestSuggestions(false);
                }}
              >
                <Search className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* Destination autocomplete */}
              {showDestSuggestions && filteredDestinationCities.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  <div className="sticky top-0 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                    {filteredDestinationCities.length} cities found - click to select
                  </div>
                  {filteredDestinationCities.map(city => (
                    <div
                      key={city.id}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        setDestination(city.name);
                        setShowDestSuggestions(false);
                      }}
                    >
                      <MapPin className="h-3 w-3 text-gray-400 mr-2" />
                      <span className="font-medium">{city.name}</span>
                      <span className="text-gray-500 ml-1">, {city.state}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Date Input */}
          <div>
            <label htmlFor="travel-date" className="block text-sm font-medium text-gray-700 mb-1">Date of Travel</label>
            <Input 
              type="date" 
              id="travel-date" 
              name="travel-date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // can't select past dates
            />
          </div>

          {/* Preference Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Optimize For</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={preference === "time" ? "active" : "mode"}
                onClick={() => handleSetPreference("time")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${preference === "time" ? "text-primary-700" : "text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className={`text-xs mt-1 font-medium ${preference === "time" ? "text-primary-700" : "text-gray-600"}`}>Time</span>
              </Button>
              <Button
                type="button"
                variant={preference === "cost" ? "active" : "mode"}
                onClick={() => handleSetPreference("cost")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${preference === "cost" ? "text-primary-700" : "text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span className={`text-xs mt-1 font-medium ${preference === "cost" ? "text-primary-700" : "text-gray-600"}`}>Cost</span>
              </Button>
              <Button
                type="button"
                variant={preference === "comfort" ? "active" : "mode"}
                onClick={() => handleSetPreference("comfort")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${preference === "comfort" ? "text-primary-700" : "text-gray-600"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
                <span className={`text-xs mt-1 font-medium ${preference === "comfort" ? "text-primary-700" : "text-gray-600"}`}>Comfort</span>
              </Button>
            </div>
          </div>
          
          {/* Submit Button */}
          <Button type="submit" className="w-full">
            Find Best Routes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
