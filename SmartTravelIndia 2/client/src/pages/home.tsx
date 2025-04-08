import { useState } from "react";
import Header from "@/components/transportation/header";
import SearchPanel from "@/components/transportation/search-panel";
import MapContainer from "@/components/transportation/map-container";
import OptionsList from "@/components/transportation/options-list";
import Recommendation from "@/components/transportation/recommendation";
import ConfirmationDialog from "@/components/transportation/confirmation-dialog";
import Footer from "@/components/transportation/footer";
import AuthHeader from "@/components/transportation/auth-header";
import { useQuery } from "@tanstack/react-query";
import { SearchParams, RouteWithDetails, City } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin: "Mumbai",
    destination: "Delhi", 
    date: new Date().toISOString().split('T')[0], // Today's date
    preference: "time"
  });
  
  const [selectedRoute, setSelectedRoute] = useState<RouteWithDetails | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // Fetch all cities for autocomplete
  const { data: cities } = useQuery<City[]>({
    queryKey: ['/api/cities'],
    staleTime: Infinity, // Cities don't change frequently
  });
  
  // Search for routes
  const { 
    data: routes, 
    isLoading, 
    isFetching,
    refetch 
  } = useQuery<RouteWithDetails[]>({
    queryKey: [
      `/api/routes/search?origin=${searchParams.origin}&destination=${searchParams.destination}&date=${searchParams.date}&preference=${searchParams.preference}`
    ],
    enabled: !!searchParams.origin && !!searchParams.destination
  });
  
  // Handle form submission
  const handleSearch = (params: SearchParams) => {
    if (params.origin === params.destination) {
      toast({
        title: "Error",
        description: "Origin and destination cannot be the same",
        variant: "destructive"
      });
      return;
    }
    
    setSearchParams(params);
    refetch();
  };
  
  // Handle route selection
  const handleRouteSelect = (route: RouteWithDetails) => {
    setSelectedRoute(route);
    
    toast({
      title: "Route Selected",
      description: `${route.transportMode.name} from ${route.originCity.name} to ${route.destinationCity.name}`,
    });
  };
  
  // Handle email confirmation
  const handleConfirmBooking = () => {
    if (!selectedRoute) {
      toast({
        title: "No Route Selected",
        description: "Please select a route first",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to confirm your booking",
        variant: "destructive",
      });
      return;
    }
    
    // Open the confirmation dialog
    setIsConfirmDialogOpen(true);
  };
  
  const loading = isLoading || isFetching;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <AuthHeader />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          AI-Powered Multi-Modal Transportation System
        </h2>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Search Panel */}
          <SearchPanel 
            cities={cities || []} 
            onSearch={handleSearch}
            initialValues={searchParams}
          />
          
          {/* Map */}
          <MapContainer 
            origin={searchParams.origin}
            destination={searchParams.destination}
            routes={routes || []}
            selectedRoute={selectedRoute}
          />
        </div>
        
        {/* Transportation Options */}
        <OptionsList 
          routes={routes || []}
          loading={loading}
          onSelect={handleRouteSelect}
          selectedRoute={selectedRoute}
        />
        
        {/* Book Now Button */}
        {selectedRoute && (
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleConfirmBooking}
              className="gap-2"
              size="lg"
            >
              <Mail className="h-4 w-4" /> 
              Email Confirmation
            </Button>
          </div>
        )}
        
        {/* AI Recommendation */}
        {routes && routes.length > 0 && (
          <Recommendation 
            routes={routes}
            preference={searchParams.preference}
          />
        )}
        
        {/* Confirmation Dialog */}
        <ConfirmationDialog 
          route={selectedRoute}
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
        />
      </main>
      
      <Footer />
    </div>
  );
}
