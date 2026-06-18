'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Menu, Package, Bell, User, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();

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
          <Link href="/search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Browse
          </Link>
          
          {user ? (
            <>
              <Link href="/verification" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-2">
                Verification
              </Link>
              <Link href="/items/create" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                List Item
              </Link>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <Link href="/my-listings" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                My Listings
              </Link>
              <Link href="/my-rentals" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                My Rentals
              </Link>
              <Link href="/payments" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors mr-2">
                Payments
              </Link>
              <Link href="/wishlist" className="text-muted-foreground hover:text-foreground transition-colors relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] bg-red-500 rounded-full border-2 border-background text-[10px] font-bold flex items-center justify-center text-white px-1">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>
              <button className="text-muted-foreground hover:text-foreground transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background"></span>
              </button>
              <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors mx-2">
                <User className="w-5 h-5" />
              </Link>
              <Button variant="ghost" className="text-sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <Link href="/login">
                <Button variant="ghost" className="text-sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button className="text-sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2 text-foreground">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
}
