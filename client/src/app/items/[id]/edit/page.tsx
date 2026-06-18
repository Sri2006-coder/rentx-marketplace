'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { api } from '@/lib/api';

export default function EditListingPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dailyRate: '',
    securityDeposit: '',
    category: '',
    condition: '',
    city: '',
    status: ''
  });

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await api.get(`/items/${id}`);
        const item = res.data.data;
        setFormData({
          title: item.title,
          description: item.description,
          dailyRate: item.dailyRate,
          securityDeposit: item.securityDeposit,
          category: item.category,
          condition: item.condition,
          city: item.city,
          status: item.status
        });
      } catch (err) {
        alert('Item not found');
        router.push('/my-listings');
      } finally {
        setFetching(false);
      }
    };
    if (id) fetchItem();
  }, [id, router]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/items/${id}`, formData);
      router.push('/my-listings');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Edit Listing</h1>
          <p className="text-muted-foreground">Update your item details.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Listing Title</Label>
                <Input id="title" value={formData.title} onChange={handleChange} required className="bg-black/20 border-white/10" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  required
                  rows={5} 
                  className="bg-black/20 border-white/10 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dailyRate">Daily Rate ($)</Label>
                  <Input id="dailyRate" type="number" min="1" value={formData.dailyRate} onChange={handleChange} required className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
                  <Input id="securityDeposit" type="number" min="0" value={formData.securityDeposit} onChange={handleChange} required className="bg-black/20 border-white/10" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City Location</Label>
                  <Input id="city" value={formData.city} onChange={handleChange} required className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Listing Status</Label>
                  <select 
                    id="status" 
                    value={formData.status} 
                    onChange={handleChange}
                    className="flex h-9 w-full rounded-md border border-white/10 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </ProtectedRoute>
  );
}
