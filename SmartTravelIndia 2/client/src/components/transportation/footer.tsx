import { Separator } from "@/components/ui/separator";
import { MapPin, Mail, Phone, Clock, Train, Car, Bus, Plane, Navigation, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 mt-12">
      {/* Newsletter section */}
      <div className="bg-primary-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold">Stay Updated</h3>
              <p className="text-primary-100 text-sm mt-1">Get the latest travel deals and updates directly to your inbox</p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-primary-800 border-primary-600 text-white placeholder:text-primary-300 w-full sm:w-64"
              />
              <Button type="button" variant="secondary" className="whitespace-nowrap">
                Subscribe Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-primary-100 rounded-full">
                <MapPin className="h-6 w-6 text-primary-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                    Smart Journey
                  </span> 
                </h2>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              AI-Powered Multi-Modal Transportation System for Smart Cities helps travelers find the optimal way to travel across India based on time, cost, and comfort preferences.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-primary-700 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-700 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-700 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-700 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4 border-b border-gray-200 pb-2">Transportation</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors flex items-center gap-2">
                  <Train className="h-4 w-4" />
                  <span>Trains</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  <span>Flights</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  <span>Buses</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>Cars & Taxis</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  <span>Route Planner</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4 border-b border-gray-200 pb-2">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Press</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Partnerships</a></li>
            </ul>
          </div>
          
          <div id="contact">
            <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase mb-4 border-b border-gray-200 pb-2">Contact & Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>1800-123-4567</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>support@smartjourney.in</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Customer Support</span>
                </a>
              </li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">FAQ</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} Smart Journey India. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary-700 transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
