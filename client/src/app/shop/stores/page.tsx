'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Search,
  Package,
  Clock,
  User,
  Building2,
  ArrowRight,
  ShoppingBag,
  LogIn,
} from 'lucide-react';
import { getAllStores } from '@/actions/storeActions';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface StoreData {
  id: string;
  shopName: string;
  shopOwnerName: string;
  shopContactNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  email: string;
  status: string | null;
  createdAt: Date;
}

export default function StoresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchStores() {
      if (status === 'unauthenticated') {
        setLoading(false);
        return;
      }

      if (status === 'loading') {
        return;
      }

      setLoading(true);
      try {
        console.log('Fetching stores...');
        const result = await getAllStores();
        console.log('Stores result:', result);
        
        if (result.success) {
          console.log('Fetched stores count:', result.stores.length);
          setStores(result.stores);
          setFilteredStores(result.stores);
        } else {
          console.error('Failed to fetch stores');
        }
      } catch (error) {
        console.error('Error fetching stores:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStores();
  }, [status]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = stores.filter(
        (store) =>
          store.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.state.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [searchQuery, stores]);

  const handleStoreClick = (storeId: string) => {
    router.push(`/shop/stores/${storeId}`);
  };

  // Show login prompt if user is not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto max-w-7xl px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Stores</h1>
            <p className="text-muted-foreground">Discover local stores near you</p>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Login Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please log in to discover and explore local stores
                </p>
                <Link href="/auth">
                  <Button size="lg" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Sign In to Continue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Stores</h1>
          <p className="text-muted-foreground mb-6">Discover local stores near you</p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search stores by name, city, or state..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredStores.length} {filteredStores.length === 1 ? 'store' : 'stores'} found
          </p>
        </div>

        {/* Loading State */}
        {loading || status === 'loading' ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Store className="w-10 h-10 text-muted-foreground animate-pulse mb-3" />
            <p className="text-sm text-muted-foreground">Loading stores...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Store className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No stores found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Card
                key={store.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                onClick={() => handleStoreClick(store.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Building2 className="w-3 h-3" />
                      Active
                    </Badge>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">
                    {store.shopName}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium truncate">{store.shopOwnerName}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2 text-muted-foreground">
                        {store.city}, {store.state}
                      </p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">{store.shopContactNumber}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground truncate">{store.email}</span>
                  </div>

                  {/* Member Since */}
                  <div className="flex items-center gap-2 text-sm pt-2 border-t">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground text-xs">
                      Member since {new Date(store.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  {/* View Details Button */}
                  <Button 
                    className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground" 
                    variant="outline" 
                    size="sm"
                    suppressHydrationWarning
                  >
                    View Store Details
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
