'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  MapPin,
  Package,
  Heart,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { getAllSellerProducts } from '@/actions/productActions';
import { removeFromWishlist } from '@/actions/wishlist-actions';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/contexts/WishlistContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  offerPrice: number;
  quantity: number;
  category: string;
  brand: string;
  sku: string;
  status: string;
  weight?: number;
  dimensions: string;
  tags: string[];
  images: string[];
  googleMapsUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  sellerName?: string;
  sellerShopName?: string;
  sellerAddress?: string;
  sellerCity?: string;
  sellerState?: string;
}

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { wishlistItems, removeFromWishlistState } = useWishlist();

  useEffect(() => {
    loadWishlist();
  }, [wishlistItems]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      if (wishlistItems.length > 0) {
        // Get all products
        const productsResult = await getAllSellerProducts();
        
        if (productsResult.success) {
          // Filter products that are in wishlist
          const mappedProducts = productsResult.products
            .filter((p: any) => wishlistItems.includes(p.id))
            .map((p: any) => ({
              ...p,
              createdAt: p.created_at,
              updatedAt: p.updated_at,
              created_at: undefined,
              updated_at: undefined,
            }));
          
          setWishlistProducts(mappedProducts);
        }
      } else {
        setWishlistProducts([]);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const result = await removeFromWishlist(productId);
      
      if (result.success) {
        toast.success(result.message);
        // Update context and remove from local state
        removeFromWishlistState(productId);
        setWishlistProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  const calculateDiscount = (price: number, offerPrice: number) => {
    if (!offerPrice || offerPrice >= price) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
  };

  const handleOpenInGoogleMaps = (product: Product) => {
    if (product.googleMapsUrl && product.googleMapsUrl.trim() !== '') {
      window.open(product.googleMapsUrl, '_blank');
      return;
    }

    if (product.latitude && product.longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${product.latitude},${product.longitude}`;
      window.open(url, '_blank');
      return;
    }

    toast.error('Google Maps location not available');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold">My Wishlist</h1>
          </div>
          <p className="text-muted-foreground">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Heart className="w-10 h-10 text-muted-foreground animate-pulse mb-3" />
            <p className="text-sm text-muted-foreground">Loading wishlist...</p>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Start adding products you love to your wishlist
            </p>
            <Button onClick={() => router.push('/shop/products')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {wishlistProducts.map((product) => {
              const discount = calculateDiscount(product.price, product.offerPrice);
              const finalPrice = product.offerPrice > 0 ? product.offerPrice : product.price;
              const hasLocation = product.latitude && product.longitude;
              const hasGoogleMapsUrl = product.googleMapsUrl && product.googleMapsUrl.trim() !== '';

              return (
                <Card key={product.id} className="group hover:shadow-md transition-shadow">
                  {/* Image Section */}
                  <div className="relative w-full h-48 bg-muted overflow-hidden rounded-t-lg">
                    {discount > 0 && (
                      <Badge className="absolute top-2 left-2 z-10 text-xs" variant="destructive">
                        -{discount}%
                      </Badge>
                    )}
                    {hasLocation && (
                      <Badge className="absolute top-2 right-2 z-10 text-xs bg-blue-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        Location
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute bottom-2 right-2 z-10 h-8 w-8 bg-background/80 hover:bg-red-50"
                      onClick={() => handleRemoveFromWishlist(product.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <Image
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base line-clamp-2 font-semibold">
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{product.brand}</span>
                      {product.brand && product.category && <span>•</span>}
                      <span>{product.category}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {product.description}
                    </p>

                    {/* Seller Info */}
                    {(product.sellerShopName || product.sellerCity) && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 p-2 bg-muted/30 rounded">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <div className="line-clamp-1">
                          {product.sellerShopName && (
                            <span className="font-medium text-foreground">
                              {product.sellerShopName}
                            </span>
                          )}
                          {product.sellerCity && (
                            <span className="ml-1">• {product.sellerCity}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price Section */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xl font-bold">₹{finalPrice.toLocaleString()}</span>
                      {discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through">
                          ₹{product.price.toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
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

                  <CardFooter className="flex flex-col gap-2 p-4 pt-0">
                    {/* Open in Google Maps */}
                    {(hasGoogleMapsUrl || hasLocation) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full h-9"
                        onClick={() => handleOpenInGoogleMaps(product)}
                      >
                        <ExternalLink className="w-4 h-4 mr-1.5" />
                        Open in Google Maps
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
