'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, User, Menu, Package } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  // In a real app, you would add an event listener for scroll to toggle glassmorphism

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">RentX</span>
        </Link>

        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Find anything to rent..."
              className="w-full h-10 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/items/create" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            List an Item
          </Link>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <Link href="/dashboard/owner" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Owner 
          </Link>
          <Link href="/dashboard/renter" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Renter 
          </Link>
          <Link href="/profile" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors mr-2">
            Profile 
          </Link>
          <Link href="/login">
            <Button variant="ghost" className="text-sm">Log in</Button>
          </Link>
        </div>

        <button className="md:hidden p-2 text-foreground">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
