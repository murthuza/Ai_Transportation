import { useState } from "react";
import { MapPin, Menu, X, Clock, Info, Phone, Train, Car, Bus, Plane, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <header className="bg-gradient-to-r from-purple-800 via-indigo-700 to-blue-800 shadow-lg relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 opacity-10">
        <Train className="h-32 w-32 text-yellow-300" />
      </div>
      <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-10">
        <Plane className="h-32 w-32 text-yellow-300" />
      </div>
      
      {/* Status bar */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-yellow-300" />
              <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1">
              <Phone className="h-3 w-3 text-yellow-300" />
              <span>Helpline: 1800-123-4567</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a href="#" className="hover:text-yellow-300 transition-colors">Login</a>
            <span>|</span>
            <a href="#" className="hover:text-yellow-300 transition-colors">Register</a>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-yellow-400 rounded-full shadow-lg">
            <MapPin className="h-9 w-9 text-purple-900" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-sans tracking-wide">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-300">
                YatraSmart
              </span> 
              <span className="text-white">Hub</span>
            </h1>
            <p className="text-xs text-yellow-100 hidden sm:block">India's Premier Smart City Transportation</p>
          </div>
        </div>
        
        <nav className="hidden md:flex space-x-2">
          <a href="/" className="px-3 py-2 rounded-md text-white hover:bg-indigo-600 hover:text-yellow-300 transition-colors font-medium flex items-center space-x-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </a>
          <a href="#about" className="px-3 py-2 rounded-md text-white hover:bg-indigo-600 hover:text-yellow-300 transition-colors font-medium flex items-center space-x-1">
            <Info className="h-4 w-4" />
            <span>About</span>
          </a>
          <a href="#services" className="px-3 py-2 rounded-md text-white hover:bg-indigo-600 hover:text-yellow-300 transition-colors font-medium flex items-center space-x-1">
            <Train className="h-4 w-4" />
            <span>Services</span>
          </a>
          <a href="#contact" className="px-3 py-2 rounded-full text-purple-900 bg-yellow-400 hover:bg-yellow-300 transition-colors font-medium flex items-center space-x-1 shadow-md">
            <Phone className="h-4 w-4" />
            <span>Contact</span>
          </a>
        </nav>
        
        <Button 
          variant="outline" 
          className="md:hidden text-white border-white hover:bg-indigo-600 hover:text-yellow-300" 
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      
      {/* Transport icons bar - visible on larger screens */}
      <div className="hidden md:block border-t border-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex justify-center space-x-10">
            <div className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors">
              <div className="p-1.5 bg-red-600 rounded-full">
                <Train className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Train</span>
            </div>
            <div className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors">
              <div className="p-1.5 bg-green-600 rounded-full">
                <Bus className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Bus</span>
            </div>
            <div className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors">
              <div className="p-1.5 bg-purple-600 rounded-full">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Flight</span>
            </div>
            <div className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors">
              <div className="p-1.5 bg-blue-600 rounded-full">
                <Car className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium">Taxi</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden transition-all duration-300 ease-in-out",
        isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <Card className="mx-4 mb-4 border-t-0 rounded-t-none bg-indigo-900 shadow-lg">
          <div className="flex flex-col py-2">
            <a href="/" className="px-4 py-3 text-white hover:bg-indigo-700 hover:text-yellow-300 font-medium flex items-center space-x-2 rounded-md mx-2 my-1 transition-colors">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </a>
            <a href="#about" className="px-4 py-3 text-white hover:bg-indigo-700 hover:text-yellow-300 font-medium flex items-center space-x-2 rounded-md mx-2 my-1 transition-colors">
              <Info className="h-5 w-5" />
              <span>About</span>
            </a>
            <a href="#services" className="px-4 py-3 text-white hover:bg-indigo-700 hover:text-yellow-300 font-medium flex items-center space-x-2 rounded-md mx-2 my-1 transition-colors">
              <Train className="h-5 w-5" />
              <span>Services</span>
            </a>
            <a href="#contact" className="px-4 py-3 bg-yellow-400 text-purple-900 hover:bg-yellow-300 font-medium flex items-center space-x-2 rounded-md mx-2 my-1 transition-colors shadow-md">
              <Phone className="h-5 w-5" />
              <span>Contact</span>
            </a>
            <div className="border-t border-indigo-700 mt-2 pt-2">
              <div className="px-4 py-2 text-xs font-semibold text-yellow-200">TRANSPORT TYPES</div>
              <div className="grid grid-cols-2 gap-3 px-4 py-3">
                <div className="flex items-center space-x-2 text-white bg-indigo-800 rounded-md p-2 hover:bg-red-600 transition-colors">
                  <Train className="h-4 w-4" />
                  <span>Train</span>
                </div>
                <div className="flex items-center space-x-2 text-white bg-indigo-800 rounded-md p-2 hover:bg-green-600 transition-colors">
                  <Bus className="h-4 w-4" />
                  <span>Bus</span>
                </div>
                <div className="flex items-center space-x-2 text-white bg-indigo-800 rounded-md p-2 hover:bg-purple-600 transition-colors">
                  <Plane className="h-4 w-4" />
                  <span>Flight</span>
                </div>
                <div className="flex items-center space-x-2 text-white bg-indigo-800 rounded-md p-2 hover:bg-blue-600 transition-colors">
                  <Car className="h-4 w-4" />
                  <span>Taxi</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </header>
  );
}
