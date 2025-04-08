import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// City table for origins and destinations
export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
});

export const insertCitySchema = createInsertSchema(cities).omit({
  id: true,
});

export type InsertCity = z.infer<typeof insertCitySchema>;
export type City = typeof cities.$inferSelect;

// Transportation table for route options
export const transportModes = pgTable("transport_modes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Train, Flight, Bus, Car
  icon: text("icon").notNull(), // Icon name for the mode
  color: text("color").notNull(), // Brand color for the mode
});

export const insertTransportModeSchema = createInsertSchema(transportModes).omit({
  id: true,
});

export type InsertTransportMode = z.infer<typeof insertTransportModeSchema>;
export type TransportMode = typeof transportModes.$inferSelect;

// Transportation routes
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  originCityId: integer("origin_city_id").notNull(),
  destinationCityId: integer("destination_city_id").notNull(),
  transportModeId: integer("transport_mode_id").notNull(),
  provider: text("provider").notNull(), // IndiGo, Rajdhani Express, etc.
  price: integer("price").notNull(), // In INR
  duration: integer("duration").notNull(), // In minutes
  departureTime: text("departure_time").notNull(), // HH:MM format
  arrivalTime: text("arrival_time").notNull(), // HH:MM format
  comfortScore: integer("comfort_score").notNull(), // 1-5
  amenities: json("amenities").notNull(), // Array of amenities
  description: text("description").notNull(),
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
});

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

// Schema for search parameters
export const searchParamsSchema = z.object({
  origin: z.string().min(1, "Origin city is required"),
  destination: z.string().min(1, "Destination city is required"),
  date: z.string().optional(),
  preference: z.enum(["time", "cost", "comfort"]).default("time"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// Extended route type with city and transport mode information
export type RouteWithDetails = Route & {
  originCity: City;
  destinationCity: City;
  transportMode: TransportMode;
  tags: string[];
  distance?: number; // Distance in kilometers
};
