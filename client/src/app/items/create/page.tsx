import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, CheckCircle } from 'lucide-react';

export default function CreateListingPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Listing</h1>
        <p className="text-muted-foreground">List your gear and start earning money today.</p>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Listing Title</Label>
            <Input id="title" placeholder="e.g. Sony A7III with 28-70mm Lens" className="bg-black/20 border-white/10" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            {/* Fallback to regular HTML textarea since we didn't install Shadcn Textarea */}
            <textarea 
              id="description" 
              rows={5} 
              placeholder="Describe the item, what's included, and its condition..." 
              className="flex w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dailyRate">Daily Rate ($)</Label>
              <Input id="dailyRate" type="number" placeholder="45" className="bg-black/20 border-white/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit">Security Deposit ($)</Label>
              <Input id="deposit" type="number" placeholder="300" className="bg-black/20 border-white/10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select 
                id="category" 
                className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="cameras">Cameras & Gear</option>
                <option value="drones">Drones</option>
                <option value="gaming">Gaming Consoles</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <select 
                id="condition" 
                className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="like-new">Like New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Label>Item Photos</Label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors bg-black/10">
              <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
            <Button variant="ghost">Cancel</Button>
            <Button>Publish Listing</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
