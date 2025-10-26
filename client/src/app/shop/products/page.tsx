'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import {
  IndianRupee,
  MapPin,
  Package,
  Search,
  ShoppingCart,
  Heart,
  Filter,
  Star,
} from 'lucide-react';
import { getAllSellerProducts } from '@/actions/productActions';

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
  createdAt: string;
  updatedAt: string;
  sellerName?: string;
  sellerShopName?: string;
  sellerAddress?: string;
  sellerCity?: string;
  sellerState?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const result = await getAllSellerProducts();
        if (result.success) {
          const mappedProducts = result.products.map((p: any) => ({
            ...p,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            created_at: undefined,
            updated_at: undefined,
          }));
          setProducts(mappedProducts);
          setFilteredProducts(mappedProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const calculateDiscount = (price: number, offerPrice: number) => {
    if (!offerPrice || offerPrice >= price) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-muted-foreground mb-6">
            Discover products from local stores
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Package className="w-10 h-10 text-muted-foreground animate-pulse mb-3" />
            <p className="text-sm text-muted-foreground">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Package className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const discount = calculateDiscount(product.price, product.offerPrice);
              const finalPrice = product.offerPrice > 0 ? product.offerPrice : product.price;

              return (
                <Card key={product.id} className="group hover:shadow-md transition-shadow">
                  {/* Image Section */}
                  <div className="relative w-full h-48 bg-muted overflow-hidden rounded-t-lg">
                    {discount > 0 && (
                      <Badge className="absolute top-2 left-2 z-10 text-xs" variant="destructive">
                        -{discount}%
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 h-8 w-8 bg-background/80 hover:bg-background"
                    >
                      <Heart className="w-4 h-4" />
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

                  <CardFooter className="flex gap-2 p-4 pt-0">
                    <Button
                      className="flex-1 h-9"
                      size="sm"
                      disabled={product.quantity === 0}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      Add
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-9">
                      Details
                    </Button>
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
