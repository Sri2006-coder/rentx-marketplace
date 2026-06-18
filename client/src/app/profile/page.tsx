'use client';

import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Camera, Shield } from 'lucide-react';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    bio: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 mt-8 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Account Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl text-center">
              <CardContent className="pt-6">
                <div className="relative w-32 h-32 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center group overflow-hidden">
                  <User className="w-16 h-16 text-primary" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  {user?.trustProfile?.verifiedBadge && <VerifiedBadge />}
                  <p className="text-sm text-muted-foreground mt-1">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Trust Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-sm text-muted-foreground">Trust Score</span>
                  <span className="font-bold text-lg">{user?.trustProfile?.trustScore || 0}<span className="text-sm text-muted-foreground font-normal">/100</span></span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-sm text-muted-foreground">Identity</span>
                  {user?.trustProfile?.verifiedBadge ? (
                    <span className="text-sm font-medium text-green-500">Verified</span>
                  ) : (
                    <Link href="/verification" className="text-sm font-medium text-primary hover:underline">Verify Now</Link>
                  )}
                </div>
                <Link href="/verification" className="w-full mt-2 block">
                  <Button variant="outline" className="w-full">
                    Verification Center
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your contact details and bio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleChange} className="bg-black/20 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={handleChange} className="bg-black/20 border-white/10" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} disabled className="bg-black/40 border-white/5 text-muted-foreground cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="bg-black/20 border-white/10" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={handleChange} placeholder="San Francisco" className="bg-black/20 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State / Province</Label>
                    <Input id="state" value={formData.state} onChange={handleChange} placeholder="CA" className="bg-black/20 border-white/10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About Me (Bio)</Label>
                  <Textarea 
                    id="bio" 
                    value={formData.bio} 
                    onChange={handleChange}
                    placeholder="Tell others a bit about yourself..." 
                    className="bg-black/20 border-white/10 resize-none h-32" 
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
