import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { mockItems } from '@/lib/mockData';
import { Calendar, Shield, Star, User, MapPin } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default function ItemDetailsPage({ params }: { params: { id: string } }) {
  const item = mockItems.find((i) => i.id === params.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block">
          &larr; Back to search
        </Link>
        <div className="flex items-center gap-2 text-sm text-primary font-medium uppercase tracking-wider mb-2">
          {item.category}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{item.title}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-medium text-foreground">{item.rating}</span>
            <span>({item.reviewsCount} reviews)</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {item.city}, {item.state}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image & Description */}
        <div className="lg:col-span-2 space-y-8">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted border border-white/10">
            <img 
              src={item.images[0]} 
              alt={item.title} 
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div>
              <h3 className="font-semibold mb-1">Condition</h3>
              <p className="text-muted-foreground">{item.condition}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Security Deposit</h3>
              <p className="text-muted-foreground">${item.securityDeposit}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl shadow-primary/5">
              <div className="text-3xl font-bold mb-6">
                ${item.dailyRate} <span className="text-lg font-normal text-muted-foreground">/ day</span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-3 bg-black/20 rounded-lg border border-white/5 flex items-center justify-between cursor-pointer hover:bg-black/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Dates</div>
                      <div className="text-sm font-medium">Select dates</div>
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full h-12 text-lg font-semibold mb-4">
                Request Booking
              </Button>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure payment & deposit holding</span>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Owned by</div>
                  <div className="font-medium">Alex Johnson</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
