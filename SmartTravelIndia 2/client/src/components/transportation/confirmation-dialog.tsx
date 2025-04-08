import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { formatDuration, formatPrice } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RouteWithDetails } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ConfirmationDialogProps {
  route: RouteWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfirmationDialog({ 
  route, 
  isOpen, 
  onClose 
}: ConfirmationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  // Use an empty string as default since User type may not have email property
  const [email, setEmail] = useState<string>("");
  
  // Email confirmation mutation
  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: async () => {
      if (!route) throw new Error("No route selected");
      
      const res = await apiRequest("POST", "/api/routes/confirm", {
        routeId: route.id,
        email
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to send confirmation");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Confirmation Sent!",
        description: "Check your email for travel details.",
        variant: "default",
      });
      // We keep the dialog open to show success message
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to send confirmation",
        description: err.message,
        variant: "destructive",
      });
    }
  });
  
  if (!route) return null;
  
  // Calculate total price
  const totalPrice = route.price;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please provide an email address for the confirmation.",
        variant: "destructive",
      });
      return;
    }
    
    mutate();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Confirm Your Trip
          </DialogTitle>
          <DialogDescription>
            Review the details and confirm your journey from {route.originCity.name} to {route.destinationCity.name}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Trip Details Summary */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Trip Details</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Transport:</div>
              <div className="text-sm font-medium">{route.transportMode.name} ({route.provider})</div>
              
              <div className="text-sm text-muted-foreground">Departure:</div>
              <div className="text-sm font-medium">{route.departureTime}</div>
              
              <div className="text-sm text-muted-foreground">Arrival:</div>
              <div className="text-sm font-medium">{route.arrivalTime}</div>
              
              <div className="text-sm text-muted-foreground">Duration:</div>
              <div className="text-sm font-medium">{formatDuration(route.duration)}</div>
              
              <div className="text-sm text-muted-foreground">Price:</div>
              <div className="text-sm font-medium">{formatPrice(totalPrice)}</div>
            </div>
          </div>
          
          {/* Email form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email for confirmation</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending || isSuccess}
              />
              <p className="text-xs text-muted-foreground">
                We'll send the trip details to this email address.
              </p>
            </div>
          </form>
          
          {/* Status Messages */}
          {isPending && (
            <div className="flex items-center space-x-2 text-amber-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending confirmation...</span>
            </div>
          )}
          
          {isSuccess && (
            <div className="flex items-center space-x-2 text-green-500">
              <Check className="h-4 w-4" />
              <span>Confirmation sent! Check your email.</span>
            </div>
          )}
          
          {isError && (
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error?.message || "Failed to send confirmation"}</span>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isPending}
          >
            {isSuccess ? "Close" : "Cancel"}
          </Button>
          
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isPending || isSuccess || !email}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Confirmation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}