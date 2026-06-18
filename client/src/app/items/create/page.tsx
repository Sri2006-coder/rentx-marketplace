'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, X, Shield } from 'lucide-react';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function CreateListingPage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dailyRate: '',
    securityDeposit: '',
    category: 'cameras',
    condition: 'excellent',
    city: ''
  });
  const [requireVerified, setRequireVerified] = useState(false);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]); 
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return alert('Please upload at least one image');
    
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      
      images.forEach(image => {
        data.append('images', image);
      });
      data.append('requireVerified', String(requireVerified));

      await api.post('/items', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      router.push('/my-listings');
    } catch (err: any) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Listing</h1>
          <p className="text-muted-foreground">List your gear and start earning money today.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Listing Title</Label>
                <Input id="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Sony A7III with 28-70mm Lens" className="bg-black/20 border-white/10" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  required
                  rows={5} 
                  placeholder="Describe the item, what's included, and its condition..." 
                  className="bg-black/20 border-white/10 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                  <Input id="dailyRate" type="number" min="1" value={formData.dailyRate} onChange={handleChange} required placeholder="45" className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
                  <Input id="securityDeposit" type="number" min="0" value={formData.securityDeposit} onChange={handleChange} required placeholder="300" className="bg-black/20 border-white/10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category" 
                    value={formData.category} 
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="cameras">Cameras & Gear</option>
                    <option value="drones">Drones</option>
                    <option value="gaming">Gaming Consoles</option>
                    <option value="audio">Audio Equipment</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <select 
                    id="condition" 
                    value={formData.condition} 
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City Location</Label>
                <Input id="city" value={formData.city} onChange={handleChange} required placeholder="e.g. San Francisco" className="bg-black/20 border-white/10" />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Checkbox 
                  id="requireVerified" 
                  checked={requireVerified}
                  onCheckedChange={(checked) => setRequireVerified(checked as boolean)}
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="requireVerified" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                    <Shield className="w-4 h-4 text-primary" />
                    Only Verified Users Can Rent
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    If enabled, only users with verified identities (Aadhaar/PAN) can submit booking requests for this item.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label>Item Photos</Label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                />
                
                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/10 group">
                        <Image 
                          unoptimized
                          src={preview} 
                          alt="Preview" 
                          fill 
                          className="object-cover"
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div 
                      onClick={triggerFileInput}
                      className="border-2 border-dashed border-white/20 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-black/10"
                    >
                      <UploadCloud className="w-6 h-6 text-muted-foreground mb-2" />
                      <p className="text-xs font-medium">Add More</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors bg-black/10"
                  >
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Listing'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </ProtectedRoute>
  );
}
