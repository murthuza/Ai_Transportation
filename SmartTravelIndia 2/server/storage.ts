import { users, type User, type InsertUser, City, InsertCity, cities, TransportMode, transportModes, InsertTransportMode, Route, routes, InsertRoute, SearchParams, RouteWithDetails } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

// Define types for the session store
const MemoryStore = createMemoryStore(session);
type SessionStoreType = typeof MemoryStore;

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // Users (keeping existing methods)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cities
  getAllCities(): Promise<City[]>;
  getCityById(id: number): Promise<City | undefined>;
  getCityByName(name: string): Promise<City | undefined>;
  createCity(city: InsertCity): Promise<City>;
  
  // Transport Modes
  getAllTransportModes(): Promise<TransportMode[]>;
  getTransportModeById(id: number): Promise<TransportMode | undefined>;
  createTransportMode(mode: InsertTransportMode): Promise<TransportMode>;
  
  // Routes
  getAllRoutes(): Promise<Route[]>;
  getRouteById(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  searchRoutes(params: SearchParams): Promise<RouteWithDetails[]>;
  
  // Session store for authentication
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private _cities: Map<number, City>;
  private _transportModes: Map<number, TransportMode>;
  private _routes: Map<number, Route>;
  private currentId: {
    users: number;
    cities: number;
    transportModes: number;
    routes: number;
  };
  sessionStore: any;

  constructor() {
    this.users = new Map();
    this._cities = new Map();
    this._transportModes = new Map();
    this._routes = new Map();
    this.currentId = {
      users: 1,
      cities: 1,
      transportModes: 1,
      routes: 1
    };
    
    // Initialize session store
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Initialize with default data
    this.initializeData();
  }

  // Initialize with major Indian cities and transportation modes
  private async initializeData() {
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
      // Delhi - Kolkata routes
      {
        originCityId: 2, // Delhi
        destinationCityId: 5, // Kolkata
        transportModeId: 1, // Train
        provider: "Rajdhani Express",
        price: 2200,
        duration: 960, // 16h
        departureTime: "16:45",
        arrivalTime: "08:45",
        comfortScore: 4,
        amenities: ["A/C", "Meals Included", "Premium Service"],
        description: "Premium train service with meals"
      },
      // Bangalore - Chennai routes
      {
        originCityId: 3, // Bangalore
        destinationCityId: 4, // Chennai
        transportModeId: 1, // Train
        provider: "Shatabdi Express",
        price: 750,
        duration: 330, // 5h 30m
        departureTime: "06:00",
        arrivalTime: "11:30",
        comfortScore: 4,
        amenities: ["A/C", "Meals", "High Speed"],
        description: "High-speed intercity express train"
      },
      // Chennai - Hyderabad routes
      {
        originCityId: 4, // Chennai
        destinationCityId: 6, // Hyderabad
        transportModeId: 1, // Train
        provider: "Chennai Express",
        price: 950,
        duration: 780, // 13h
        departureTime: "18:30",
        arrivalTime: "07:30",
        comfortScore: 3,
        amenities: ["Sleeper", "Food Available", "Charging"],
        description: "Overnight train connecting major southern cities"
      },
      // Kolkata - Hyderabad routes
      {
        originCityId: 5, // Kolkata
        destinationCityId: 6, // Hyderabad
        transportModeId: 1, // Train
        provider: "East Coast Express",
        price: 1450,
        duration: 1620, // 27h
        departureTime: "06:25",
        arrivalTime: "09:25",
        comfortScore: 3,
        amenities: ["Sleeper", "Food", "A/C Options"],
        description: "Long-distance train with scenic eastern route"
      },
      // Delhi - Jaipur routes
      {
        originCityId: 2, // Delhi
        destinationCityId: 9, // Jaipur
        transportModeId: 1, // Train
        provider: "Pink City Express",
        price: 550,
        duration: 280, // 4h 40m
        departureTime: "07:00",
        arrivalTime: "11:40",
        comfortScore: 4,
        amenities: ["A/C", "Meals", "Fast Service"],
        description: "Convenient day train for tourists and business travelers"
      },
      // Hyderabad - Delhi routes
      {
        originCityId: 6, // Hyderabad 
        destinationCityId: 2, // Delhi
        transportModeId: 2, // Flight
        provider: "Air India",
        price: 6200,
        duration: 140, // 2h 20m
        departureTime: "07:30",
        arrivalTime: "09:50",
        comfortScore: 4,
        amenities: ["Wi-Fi", "Meal", "Entertainment"],
        description: "Direct flight with excellent service"
      },
      {
        originCityId: 6, // Hyderabad
        destinationCityId: 2, // Delhi
        transportModeId: 1, // Train
        provider: "Telangana Express",
        price: 1800,
        duration: 1680, // 28h
        departureTime: "12:45",
        arrivalTime: "16:45",
        comfortScore: 3,
        amenities: ["Sleeper", "Food Available", "Charging Points"],
        description: "Long-distance train with comfortable sleeper options"
      },
      {
        originCityId: 6, // Hyderabad
        destinationCityId: 2, // Delhi
        transportModeId: 3, // Bus
        provider: "Volvo A/C Sleeper",
        price: 2300,
        duration: 1980, // 33h
        departureTime: "15:00",
        arrivalTime: "00:00",
        comfortScore: 2,
        amenities: ["A/C", "Sleeper Seats", "Regular Stops"],
        description: "Long-distance bus with overnight journey"
      },
      // Mumbai - Hyderabad routes
      {
        originCityId: 1, // Mumbai
        destinationCityId: 6, // Hyderabad
        transportModeId: 2, // Flight
        provider: "IndiGo",
        price: 3800,
        duration: 80, // 1h 20m
        departureTime: "09:15",
        arrivalTime: "10:35",
        comfortScore: 4,
        amenities: ["Wi-Fi", "Snacks", "Entertainment"],
        description: "Short direct flight with good on-time performance"
      },
      {
        originCityId: 1, // Mumbai
        destinationCityId: 6, // Hyderabad
        transportModeId: 1, // Train
        provider: "Mumbai Express",
        price: 1300,
        duration: 840, // 14h
        departureTime: "18:25",
        arrivalTime: "08:25",
        comfortScore: 3,
        amenities: ["Sleeper", "Food", "Charging"],
        description: "Overnight train connecting major cities"
      },
      // Delhi - Bangalore routes
      {
        originCityId: 2, // Delhi
        destinationCityId: 3, // Bangalore
        transportModeId: 2, // Flight
        provider: "SpiceJet",
        price: 5500,
        duration: 150, // 2h 30m
        departureTime: "10:15",
        arrivalTime: "12:45",
        comfortScore: 3,
        amenities: ["Snacks", "Extra Baggage Option"],
        description: "Direct flight connecting north and south India"
      },
      {
        originCityId: 2, // Delhi
        destinationCityId: 3, // Bangalore
        transportModeId: 1, // Train
        provider: "Karnataka Express",
        price: 2200,
        duration: 2280, // 38h
        departureTime: "20:15",
        arrivalTime: "10:15",
        comfortScore: 3,
        amenities: ["A/C", "Sleeper", "Food"],
        description: "Long-distance train with multiple halts"
      }
    ];
    
    for (const route of routeData) {
      await this.createRoute(route);
    }
  }

  // User methods (keeping existing ones)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      ...insertUser, 
      id,
      name: insertUser.name || "" 
    };
    this.users.set(id, user);
    return user;
  }
  
  // City methods
  async getAllCities(): Promise<City[]> {
    return Array.from(this._cities.values());
  }
  
  async getCityById(id: number): Promise<City | undefined> {
    return this._cities.get(id);
  }
  
  async getCityByName(name: string): Promise<City | undefined> {
    return Array.from(this._cities.values()).find(
      (city) => city.name.toLowerCase() === name.toLowerCase(),
    );
  }
  
  async createCity(insertCity: InsertCity): Promise<City> {
    const id = this.currentId.cities++;
    const city: City = { ...insertCity, id };
    this._cities.set(id, city);
    return city;
  }
  
  // Transport Mode methods
  async getAllTransportModes(): Promise<TransportMode[]> {
    return Array.from(this._transportModes.values());
  }
  
  async getTransportModeById(id: number): Promise<TransportMode | undefined> {
    return this._transportModes.get(id);
  }
  
  async createTransportMode(insertMode: InsertTransportMode): Promise<TransportMode> {
    const id = this.currentId.transportModes++;
    const transportMode: TransportMode = { ...insertMode, id };
    this._transportModes.set(id, transportMode);
    return transportMode;
  }
  
  // Route methods
  async getAllRoutes(): Promise<Route[]> {
    return Array.from(this._routes.values());
  }
  
  async getRouteById(id: number): Promise<Route | undefined> {
    return this._routes.get(id);
  }
  
  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = this.currentId.routes++;
    const route: Route = { ...insertRoute, id };
    this._routes.set(id, route);
    return route;
  }
  
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

  // Search routes based on search parameters
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
    const allRoutes = Array.from(this._routes.values());
    const matchedRoutes = allRoutes.filter(route => 
      route.originCityId === originCity.id && 
      route.destinationCityId === destinationCity.id
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
          distance: distance // Add the calculated distance
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
}

import { PostgresStorage } from "./db-storage";

// Choose between memory storage and database storage
// Set to true to use the PostgreSQL database
const useDatabase = true;
export const storage = useDatabase 
  ? new PostgresStorage() 
  : new MemStorage();
