'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search, Menu, Package, Bell, User, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <div className="relative flex items-center" ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="text-muted-foreground hover:text-foreground transition-colors relative p-1.5 rounded-full hover:bg-white/5"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-primary rounded-full border-2 border-background text-[8px] font-bold flex items-center justify-center text-primary-foreground px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 top-full bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={() => markAllAsRead()}
                          className="text-[11px] text-primary hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              setShowNotifications(false);
                              if (n.link) {
                                router.push(n.link);
                              }
                            }}
                            className={`p-4 text-left cursor-pointer hover:bg-white/5 transition-colors ${
                              !n.isRead ? 'bg-white/[0.03]' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-xs font-semibold ${!n.isRead ? 'text-white' : 'text-zinc-300'}`}>
                                {n.title}
                              </span>
                              <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
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
