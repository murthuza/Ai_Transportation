import { eq, and } from "drizzle-orm";
import { pool } from "./db";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { users, type User, type InsertUser, City, InsertCity, cities, 
         TransportMode, transportModes, InsertTransportMode, Route, 
         routes, InsertRoute, SearchParams, RouteWithDetails } from "@shared/schema";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { IStorage } from "./storage";

// Initialize Drizzle
const db = drizzle(pool);

export class PostgresStorage implements IStorage {
  sessionStore: any;

  constructor() {
    // Initialize session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    // Ensure name is not undefined
    const userToInsert = {
      ...user,
      name: user.name || ""
    };
    const result = await db.insert(users).values(userToInsert).returning();
    return result[0];
  }

  // City methods
  async getAllCities(): Promise<City[]> {
    return db.select().from(cities);
  }

  async getCityById(id: number): Promise<City | undefined> {
    const result = await db.select().from(cities).where(eq(cities.id, id));
    return result[0];
  }

  async getCityByName(name: string): Promise<City | undefined> {
    const result = await db.select().from(cities).where(eq(cities.name, name));
    return result[0];
  }

  async createCity(city: InsertCity): Promise<City> {
    const result = await db.insert(cities).values(city).returning();
    return result[0];
  }

  // Transport Mode methods
  async getAllTransportModes(): Promise<TransportMode[]> {
    return db.select().from(transportModes);
  }

  async getTransportModeById(id: number): Promise<TransportMode | undefined> {
    const result = await db.select().from(transportModes).where(eq(transportModes.id, id));
    return result[0];
  }

  async createTransportMode(mode: InsertTransportMode): Promise<TransportMode> {
    const result = await db.insert(transportModes).values(mode).returning();
    return result[0];
  }

  // Route methods
  async getAllRoutes(): Promise<Route[]> {
    return db.select().from(routes);
  }

  async getRouteById(id: number): Promise<Route | undefined> {
    const result = await db.select().from(routes).where(eq(routes.id, id));
    return result[0];
  }

  async createRoute(route: InsertRoute): Promise<Route> {
    const result = await db.insert(routes).values(route).returning();
    return result[0];
  }

  // Search routes based on search parameters
  // Helper function to calculate distance between two coordinates
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return Math.round(R * c); // Distance in km (rounded)
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  async searchRoutes(params: SearchParams): Promise<RouteWithDetails[]> {
    // Find origin and destination cities by name
    const originCity = await this.getCityByName(params.origin);
    const destinationCity = await this.getCityByName(params.destination);
    
    if (!originCity || !destinationCity) {
      return [];
    }
    
    // Calculate the distance between origin and destination
    const distance = this.calculateDistance(
      originCity.latitude, 
      originCity.longitude, 
      destinationCity.latitude, 
      destinationCity.longitude
    );
    
    // Get all routes between origin and destination
    const matchedRoutes = await db.select()
      .from(routes)
      .where(
        and(
          eq(routes.originCityId, originCity.id),
          eq(routes.destinationCityId, destinationCity.id)
        )
      );
    
    // Enhance routes with city, transport mode, and distance information
    const result: RouteWithDetails[] = await Promise.all(
      matchedRoutes.map(async route => {
        const originCity = (await this.getCityById(route.originCityId))!;
        const destinationCity = (await this.getCityById(route.destinationCityId))!;
        const transportMode = (await this.getTransportModeById(route.transportModeId))!;
        
        // Assign tags based on mode characteristics
        const tags: string[] = [];
        if (transportMode.name === "Flight") {
          tags.push("Fastest");
          if (route.price > 4000) {
            tags.push("Medium Cost");
          }
        } else if (transportMode.name === "Train") {
          tags.push("Recommended");
          tags.push("Best Value");
        } else if (transportMode.name === "Bus") {
          tags.push("Budget Option");
        }
        
        return {
          ...route,
          originCity,
          destinationCity,
          transportMode,
          tags,
          distance // Add the calculated distance
        };
      })
    );
    
    // Sort based on preference
    if (params.preference === "time") {
      result.sort((a, b) => a.duration - b.duration);
    } else if (params.preference === "cost") {
      result.sort((a, b) => a.price - b.price);
    } else if (params.preference === "comfort") {
      result.sort((a, b) => b.comfortScore - a.comfortScore);
    }
    
    return result;
  }

  // Method to initialize with test data
  async initializeData(): Promise<void> {
    try {
      // Check if data already exists
      const citiesCount = await db.select({ count: sql`count(*)` }).from(cities);
      if (Number(citiesCount[0].count) > 0) {
        console.log("Database already initialized with data.");
        return;
      }

      // Add major Indian cities
      const cityData: InsertCity[] = [
        { name: "Mumbai", state: "Maharashtra", latitude: 19.076, longitude: 72.8777 },
        { name: "Delhi", state: "Delhi", latitude: 28.7041, longitude: 77.1025 },
        { name: "Bangalore", state: "Karnataka", latitude: 12.9716, longitude: 77.5946 },
        { name: "Chennai", state: "Tamil Nadu", latitude: 13.0827, longitude: 80.2707 },
        { name: "Kolkata", state: "West Bengal", latitude: 22.5726, longitude: 88.3639 },
        { name: "Hyderabad", state: "Telangana", latitude: 17.385, longitude: 78.4867 },
        { name: "Ahmedabad", state: "Gujarat", latitude: 23.0225, longitude: 72.5714 },
        { name: "Pune", state: "Maharashtra", latitude: 18.5204, longitude: 73.8567 },
        { name: "Jaipur", state: "Rajasthan", latitude: 26.9124, longitude: 75.7873 },
        { name: "Lucknow", state: "Uttar Pradesh", latitude: 26.8467, longitude: 80.9462 }
      ];
      
      for (const city of cityData) {
        await this.createCity(city);
      }
      
      // Add transportation modes
      const transportModeData: InsertTransportMode[] = [
        { name: "Train", icon: "train", color: "#DC2626" },
        { name: "Flight", icon: "plane", color: "#7C3AED" },
        { name: "Bus", icon: "bus", color: "#059669" },
        { name: "Car", icon: "car", color: "#2563EB" }
      ];
      
      for (const mode of transportModeData) {
        await this.createTransportMode(mode);
      }
      
      // Add sample routes between cities
      const routeData: InsertRoute[] = [
        // Mumbai - Delhi routes
        {
          originCityId: 1, // Mumbai
          destinationCityId: 2, // Delhi
          transportModeId: 2, // Flight
          provider: "IndiGo",
          price: 5200,
          duration: 130, // 2h 10m
          departureTime: "08:15",
          arrivalTime: "10:25",
          comfortScore: 4,
          amenities: ["Wi-Fi", "Meal", "Baggage Allowed"],
          description: "Good legroom, clean cabin, on-time performance"
        },
        {
          originCityId: 1, // Mumbai
          destinationCityId: 2, // Delhi
          transportModeId: 1, // Train
          provider: "Rajdhani Express",
          price: 1850,
          duration: 995, // 16h 35m
          departureTime: "16:35",
          arrivalTime: "09:10",
          comfortScore: 3,
          amenities: ["Meals", "Bedding", "Charging Points"],
          description: "Comfortable sleeper service with meals included"
        },
        {
          originCityId: 1, // Mumbai
          destinationCityId: 2, // Delhi
          transportModeId: 3, // Bus
          provider: "Volvo A/C Sleeper",
          price: 1400,
          duration: 1455, // 24h 15m
          departureTime: "17:30",
          arrivalTime: "17:45",
          comfortScore: 2,
          amenities: ["A/C", "Sleeper Seats", "Snacks"],
          description: "Sleeper bus with regular stops along the route"
        },
        // Mumbai - Bangalore routes
        {
          originCityId: 1, // Mumbai
          destinationCityId: 3, // Bangalore
          transportModeId: 2, // Flight
          provider: "Air India",
          price: 4800,
          duration: 90, // 1h 30m
          departureTime: "06:00",
          arrivalTime: "07:30",
          comfortScore: 4,
          amenities: ["Wi-Fi", "Meal", "Entertainment"],
          description: "Direct flight with good on-board service"
        },
        {
          originCityId: 1, // Mumbai
          destinationCityId: 3, // Bangalore
          transportModeId: 1, // Train
          provider: "Udyan Express",
          price: 1300,
          duration: 1440, // 24h
          departureTime: "08:05",
          arrivalTime: "08:05",
          comfortScore: 3,
          amenities: ["Bedding", "Food Options", "Charging"],
          description: "Overnight train with sleeper and AC options"
        },
        // Delhi - Bangalore routes
        {
          originCityId: 2, // Delhi
          destinationCityId: 3, // Bangalore
          transportModeId: 2, // Flight
          provider: "IndiGo",
          price: 5500,
          duration: 150, // 2h 30m
          departureTime: "07:30",
          arrivalTime: "10:00",
          comfortScore: 4,
          amenities: ["Wi-Fi", "Meal", "Baggage Allowed"],
          description: "Direct flight with comfortable seating"
        },
        // Delhi - Chennai routes
        {
          originCityId: 2, // Delhi
          destinationCityId: 4, // Chennai
          transportModeId: 2, // Flight
          provider: "SpiceJet",
          price: 5800,
          duration: 165, // 2h 45m
          departureTime: "09:15",
          arrivalTime: "12:00",
          comfortScore: 3,
          amenities: ["Snacks", "Baggage Allowed"],
          description: "Economic but comfortable flight"
        },
        {
          originCityId: 2, // Delhi
          destinationCityId: 4, // Chennai
          transportModeId: 1, // Train
          provider: "Tamil Nadu Express",
          price: 2100,
          duration: 2100, // 35h
          departureTime: "10:30",
          arrivalTime: "21:30",
          comfortScore: 3,
          amenities: ["Meals", "Bedding", "Charging Points"],
          description: "Long distance train with all necessary amenities"
        },
        // Mumbai - Chennai routes
        {
          originCityId: 1, // Mumbai
          destinationCityId: 4, // Chennai
          transportModeId: 2, // Flight
          provider: "Vistara",
          price: 4900,
          duration: 110, // 1h 50m
          departureTime: "14:20",
          arrivalTime: "16:10",
          comfortScore: 5,
          amenities: ["Premium Meals", "Extra Legroom", "Entertainment"],
          description: "Premium service with exceptional comfort"
        },
        // Kolkata - Mumbai routes
        {
          originCityId: 5, // Kolkata
          destinationCityId: 1, // Mumbai
          transportModeId: 2, // Flight
          provider: "Air India",
          price: 5100,
          duration: 155, // 2h 35m
          departureTime: "11:20",
          arrivalTime: "13:55",
          comfortScore: 4,
          amenities: ["Meals", "Entertainment", "Baggage Allowed"],
          description: "Comfortable flight with good service"
        },
        // Bangalore - Kolkata routes
        {
          originCityId: 3, // Bangalore
          destinationCityId: 5, // Kolkata
          transportModeId: 2, // Flight
          provider: "GoAir",
          price: 4700,
          duration: 140, // 2h 20m
          departureTime: "08:40",
          arrivalTime: "11:00",
          comfortScore: 3,
          amenities: ["Snacks", "Baggage Allowed"],
          description: "Budget flight with basic amenities"
        },
        // Hyderabad - Delhi routes
        {
          originCityId: 6, // Hyderabad
          destinationCityId: 2, // Delhi
          transportModeId: 2, // Flight
          provider: "IndiGo",
          price: 4800,
          duration: 125, // 2h 5m
          departureTime: "06:45",
          arrivalTime: "08:50",
          comfortScore: 4,
          amenities: ["Wi-Fi", "Meal", "Baggage Allowed"],
          description: "Morning flight with good on-time performance"
        },
        {
          originCityId: 6, // Hyderabad
          destinationCityId: 2, // Delhi
          transportModeId: 1, // Train
          provider: "Telangana Express",
          price: 2200,
          duration: 1500, // 25h
          departureTime: "12:45",
          arrivalTime: "13:45",
          comfortScore: 3,
          amenities: ["Meals", "Bedding", "Charging Points"],
          description: "Comfortable sleeper train with meals included"
        },
        {
          originCityId: 6, // Hyderabad
          destinationCityId: 2, // Delhi
          transportModeId: 3, // Bus
          provider: "Volvo A/C Sleeper",
          price: 1800,
          duration: 1680, // 28h
          departureTime: "17:00",
          arrivalTime: "21:00",
          comfortScore: 2,
          amenities: ["A/C", "Charging", "Toilet"],
          description: "Long distance bus with reasonable comfort"
        },
        // Delhi - Hyderabad routes (return routes)
        {
          originCityId: 2, // Delhi
          destinationCityId: 6, // Hyderabad
          transportModeId: 2, // Flight
          provider: "Air India",
          price: 5100,
          duration: 130, // 2h 10m
          departureTime: "14:20",
          arrivalTime: "16:30",
          comfortScore: 4,
          amenities: ["Wi-Fi", "Premium Meal", "Entertainment"],
          description: "Afternoon flight with good service"
        },
        {
          originCityId: 2, // Delhi
          destinationCityId: 6, // Hyderabad
          transportModeId: 1, // Train
          provider: "Dakshin Express",
          price: 2200,
          duration: 1470, // 24h 30m
          departureTime: "10:15",
          arrivalTime: "10:45",
          comfortScore: 3,
          amenities: ["Meals", "Bedding", "Charging Points"],
          description: "Express train with good facilities"
        },
        // Bangalore - Hyderabad routes
        {
          originCityId: 3, // Bangalore
          destinationCityId: 6, // Hyderabad
          transportModeId: 2, // Flight
          provider: "SpiceJet",
          price: 3800,
          duration: 80, // 1h 20m
          departureTime: "08:30",
          arrivalTime: "09:50",
          comfortScore: 3,
          amenities: ["Snacks", "Baggage Allowed"],
          description: "Short flight with basic amenities"
        },
        {
          originCityId: 3, // Bangalore
          destinationCityId: 6, // Hyderabad
          transportModeId: 3, // Bus
          provider: "KSRTC Airavat",
          price: 1100,
          duration: 660, // 11h
          departureTime: "21:00",
          arrivalTime: "08:00",
          comfortScore: 3,
          amenities: ["A/C", "Recliner Seats", "Charging"],
          description: "Premium overnight bus service"
        },
        // Chennai - Hyderabad routes
        {
          originCityId: 4, // Chennai
          destinationCityId: 6, // Hyderabad
          transportModeId: 2, // Flight
          provider: "Vistara",
          price: 4200,
          duration: 85, // 1h 25m
          departureTime: "10:30",
          arrivalTime: "11:55",
          comfortScore: 4,
          amenities: ["Wi-Fi", "Premium Meals", "Entertainment"],
          description: "Premium service with excellent comfort"
        },
        {
          originCityId: 4, // Chennai
          destinationCityId: 6, // Hyderabad
          transportModeId: 1, // Train
          provider: "Charminar Express",
          price: 950,
          duration: 780, // 13h
          departureTime: "19:50",
          arrivalTime: "08:50",
          comfortScore: 3,
          amenities: ["Bedding", "Charging Points"],
          description: "Overnight train with comfortable coaches"
        },
        // Ahmedabad - Mumbai routes
        {
          originCityId: 7, // Ahmedabad
          destinationCityId: 1, // Mumbai
          transportModeId: 1, // Train
          provider: "Shatabdi Express",
          price: 800,
          duration: 390, // 6h 30m
          departureTime: "06:25",
          arrivalTime: "12:55",
          comfortScore: 4,
          amenities: ["Meals", "Charging Points", "Comfortable Seating"],
          description: "Premium day train with meals included"
        },
        {
          originCityId: 7, // Ahmedabad
          destinationCityId: 1, // Mumbai
          transportModeId: 3, // Bus
          provider: "Gujarat State Transport",
          price: 650,
          duration: 510, // 8h 30m
          departureTime: "22:00",
          arrivalTime: "06:30",
          comfortScore: 3,
          amenities: ["A/C", "Water", "Blanket"],
          description: "Overnight bus service with decent comfort"
        },
        // Jaipur - Delhi routes
        {
          originCityId: 9, // Jaipur
          destinationCityId: 2, // Delhi
          transportModeId: 1, // Train
          provider: "Pink City Express",
          price: 550,
          duration: 270, // 4h 30m
          departureTime: "15:30",
          arrivalTime: "20:00",
          comfortScore: 4,
          amenities: ["Snacks", "Charging Points", "Clean Bathrooms"],
          description: "Fast train connecting Pink City to the capital"
        },
        {
          originCityId: 9, // Jaipur
          destinationCityId: 2, // Delhi
          transportModeId: 4, // Car
          provider: "Ola Outstation",
          price: 3500,
          duration: 300, // 5h
          departureTime: "Flexible",
          arrivalTime: "Flexible",
          comfortScore: 5,
          amenities: ["A/C", "Water", "Music", "Stops on Request"],
          description: "Private car service with professional drivers"
        }
      ];
      
      for (const route of routeData) {
        await this.createRoute(route);
      }

      console.log("Database initialized with test data.");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }
}