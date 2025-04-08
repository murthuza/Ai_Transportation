import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { searchParamsSchema, RouteWithDetails } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import { generateRouteConfirmationEmail, sendEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  // Get all cities (for autocomplete)
  app.get("/api/cities", async (_req: Request, res: Response) => {
    try {
      const cities = await storage.getAllCities();
      return res.status(200).json(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
      return res.status(500).json({ message: "Failed to fetch cities" });
    }
  });

  // Get all transport modes
  app.get("/api/transport-modes", async (_req: Request, res: Response) => {
    try {
      const modes = await storage.getAllTransportModes();
      return res.status(200).json(modes);
    } catch (error) {
      console.error("Error fetching transport modes:", error);
      return res.status(500).json({ message: "Failed to fetch transport modes" });
    }
  });

  // Search for routes
  app.get("/api/routes/search", async (req: Request, res: Response) => {
    try {
      // Validate search parameters
      const result = searchParamsSchema.safeParse({
        origin: req.query.origin,
        destination: req.query.destination,
        date: req.query.date,
        preference: req.query.preference || "time",
      });

      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }

      const searchParams = result.data;

      // Perform search
      const routes = await storage.searchRoutes(searchParams);
      return res.status(200).json(routes);
    } catch (error) {
      console.error("Error searching routes:", error);
      return res.status(500).json({ message: "Failed to search routes" });
    }
  });

  // Get route by ID
  app.get("/api/routes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid route ID" });
      }
      
      const route = await storage.getRouteById(id);
      
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      return res.status(200).json(route);
    } catch (error) {
      console.error("Error fetching route:", error);
      return res.status(500).json({ message: "Failed to fetch route" });
    }
  });
  
  // Send route confirmation email
  app.post("/api/routes/confirm", async (req: Request, res: Response) => {
    try {
      // Validate if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "You must be logged in to confirm a route" });
      }
      
      const { routeId, email } = req.body;
      
      if (!routeId || !email) {
        return res.status(400).json({ message: "Missing required fields: routeId or email" });
      }
      
      // Get the route details
      const route = await storage.getRouteById(parseInt(routeId));
      if (!route) {
        return res.status(404).json({ message: "Route not found" });
      }
      
      // Get the user's name from the session
      const userName = req.user?.username || "Traveler";
      
      // For email, need to fetch full route details with city and mode info
      const originCity = await storage.getCityById(route.originCityId);
      const destinationCity = await storage.getCityById(route.destinationCityId);
      const transportMode = await storage.getTransportModeById(route.transportModeId);
      
      if (!originCity || !destinationCity || !transportMode) {
        return res.status(500).json({ message: "Error fetching complete route details" });
      }
      
      // Create a RouteWithDetails object
      const routeWithDetails: RouteWithDetails = {
        ...route,
        originCity,
        destinationCity,
        transportMode,
        tags: []
      };
      
      // Generate and send the confirmation email
      const emailParams = generateRouteConfirmationEmail(routeWithDetails, email, userName);
      
      // For demonstration purposes, always show success even if SendGrid is not configured
      if (!process.env.SENDGRID_API_KEY) {
        console.warn("SENDGRID_API_KEY not configured, but showing success for demonstration");
        return res.status(200).json({ 
          message: "Email confirmation simulation successful", 
          details: "This is a simulation since email service is not configured."
        });
      }
      
      const success = await sendEmail(emailParams);
      
      if (success) {
        return res.status(200).json({ message: "Confirmation email sent successfully" });
      } else {
        return res.status(500).json({ message: "Failed to send confirmation email" });
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      return res.status(500).json({ message: "Failed to process your request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
