'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  Package,
  Calendar,
  ArrowLeft,
  Shield,
  Globe,
  Home,
} from 'lucide-react';
import { getStoreById } from '@/actions/storeActions';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import ContactStoreModal from '@/components/ui/contact-store-modal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  offerPrice: number;
  quantity: number;
  category: string;
  brand: string;
  images: string[];
  status: string;
}

interface StoreDetails {
  id: string;
  shopName: string;
  shopOwnerName: string;
  contact: string;
  gender: string;
  shopContactNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  email: string;
  emailVerified: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
  products: Product[];
}

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { status } = useSession();
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const unwrappedParams = React.use(params);

  useEffect(() => {
    async function fetchStoreDetails() {
      if (status === 'loading') return;

      if (status === 'unauthenticated') {
        router.push('/auth');
        return;
      }

      setLoading(true);
      try {
        const result = await getStoreById(unwrappedParams.id);
        if (result.success && result.store) {
          setStore(result.store);
        } else {
          router.push('/shop/stores');
        }
      } catch (error) {
        console.error('Error fetching store details:', error);
        router.push('/shop/stores');
      } finally {
        setLoading(false);
      }
    }

    fetchStoreDetails();
  }, [unwrappedParams.id, status, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Store className="w-10 h-10 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return null;
  }

  const calculateDiscount = (price: number, offerPrice: number) => {
    if (!offerPrice || offerPrice >= price) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Stores
        </Button>

        {/* Store Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Store Icon */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
                  <Store className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>

              {/* Store Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{store.shopName}</h1>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default" className="gap-1">
                        <Building2 className="w-3 h-3" />
                        Active Store
                      </Badge>
                      {store.emailVerified && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="w-3 h-3" />
                          Verified
                        </Badge>
                      )}
                      <Badge variant="outline" className="gap-1">
                        <Package className="w-3 h-3" />
                        {store.productCount} Products
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Contact Store Button */}
                  <Button
                    onClick={() => setContactModalOpen(true)}
                    className="gap-2 shadow-lg"
                    size="lg"
                  >
                    <Mail className="w-4 h-4" />
                    Contact Store
                  </Button>
                </div>

                {/* Quick Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-primary" />
                    <a href={`tel:${store.shopContactNumber}`} className="font-medium hover:text-primary">
                      {store.shopContactNumber}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href={`mailto:${store.email}`} className="truncate hover:text-primary">
                      {store.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Store Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Owner Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Owner Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{store.shopOwnerName}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{store.gender}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{store.contact}</p>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Country</p>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{store.country}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">State</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{store.state}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">City</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{store.city}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Address</p>
                  <div className="flex items-start gap-2">
                    <Home className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <p className="font-medium">{store.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Store Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="font-medium">
                    {new Date(store.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {new Date(store.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-primary">{store.productCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Store Products
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Browse products from this store
                </p>
              </CardHeader>
              <CardContent>
                {store.products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
                    <p className="text-muted-foreground">No products available yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {store.products.map((product) => {
                      const discount = calculateDiscount(product.price, product.offerPrice);
                      const finalPrice = product.offerPrice > 0 ? product.offerPrice : product.price;

                      return (
                        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="relative w-full h-40 bg-muted">
                            {discount > 0 && (
                              <Badge className="absolute top-2 left-2 z-10 text-xs" variant="destructive">
                                -{discount}%
                              </Badge>
                            )}
                            <Image
                              src={product.images[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                              {product.name}
                            </h3>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-lg font-bold">₹{finalPrice.toLocaleString()}</span>
                              {discount > 0 && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ₹{product.price.toLocaleString()}
                                </span>
                              )}
                            </div>
                            {product.quantity <= 5 && product.quantity > 0 && (
                              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                Only {product.quantity} left
                              </Badge>
                            )}
                            {product.quantity === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Out of Stock
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {store.productCount > 12 && (
                  <div className="mt-6 text-center">
                    <Link href={`/shop/products?store=${store.id}`}>
                      <Button variant="outline" className="gap-2">
                        View All Products ({store.productCount})
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactStoreModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        storeId={store.id}
        storeName={store.shopName}
      />
    </div>
  );
}
