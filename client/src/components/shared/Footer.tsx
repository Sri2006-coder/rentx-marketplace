import Link from 'next/link';
import { Package } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/50 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <Package className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">RentX</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The premium peer-to-peer rental marketplace. Own less. Experience more.
            </p>

          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Renters</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search" className="hover:text-primary transition-colors">Browse Gear</Link></li>
              <li><Link href="/dashboard/renter" className="hover:text-primary transition-colors">Renter Dashboard</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Owners</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/items/create" className="hover:text-primary transition-colors">List your item</Link></li>
              <li><Link href="/dashboard/owner" className="hover:text-primary transition-colors">Owner Dashboard</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Insurance</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 RentX Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
