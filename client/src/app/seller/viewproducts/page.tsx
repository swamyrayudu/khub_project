"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSellerProducts } from "@/actions/productActions";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Package,
  Edit,
  Eye,
  Trash2,
  ShoppingBag,
  Star,
  IndianRupee,
  Percent,
  Calendar,
  Hash,
  Tag,
  Box,
  Search,
  Filter,
  Grid3X3,
  List,
  Loader2,
} from "lucide-react";

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
  created_at: string;
  updated_at: string;
}

export default function ViewProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const result = await getSellerProducts();
      if (result.success) {
        setProducts(result.products);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map((p) => p.category))].filter(
    Boolean
  );

  const calculateDiscount = (price: number, offerPrice: number) => {
    if (offerPrice > 0 && offerPrice < price) {
      return Math.round(((price - offerPrice) / price) * 100);
    }
    return 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">
                Your Products
              </h1>
              <p className="text-muted-foreground">
                Manage your inventory • {products.length} product
                {products.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/seller/products/add")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {products.length === 0 ? (
          /* Empty State */
          <div className="bg-card rounded-3xl p-12 text-center shadow-xl border border-border backdrop-blur-sm">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              No Products Yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start building your inventory by adding your first product. You
              can upload images, set prices, and manage your catalog.
            </p>
            <Button
              onClick={() => router.push("/seller/products/add")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <>
            {/* Filters and Search */}
            <div className="bg-card rounded-3xl p-6 shadow-xl border border-border backdrop-blur-sm mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {/* View Toggle */}
                  <div className="flex items-center space-x-2 bg-background border border-border rounded-xl p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="p-2"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="p-2"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {searchTerm && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Showing {filteredProducts.length} result
                  {filteredProducts.length !== 1 ? "s" : ""} for "{searchTerm}"
                </div>
              )}
            </div>

            {/* Products Grid/List */}
            <div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => {
                const discount = calculateDiscount(
                  product.price,
                  product.offerPrice
                );

                return (
                  <Card
                    key={product.id}
                    className={`bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
                      viewMode === "list" ? "flex flex-row" : ""
                    }`}
                  >
                    {/* Product Image */}
                    <div
                      className={`relative ${
                        viewMode === "list"
                          ? "w-48 flex-shrink-0"
                          : "aspect-square"
                      }`}
                    >
                      {product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes={
                            viewMode === "list"
                              ? "192px"
                              : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          }
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Package className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <Badge
                        className={`absolute top-2 left-2 ${
                          product.status === "active"
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {product.status}
                      </Badge>

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                          {discount}% OFF
                        </Badge>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-4 flex-1">
                      <div className="space-y-3">
                        {/* Product Name & Category */}
                        <div>
                          <h3 className="font-semibold text-card-foreground text-lg line-clamp-2">
                            {product.name}
                          </h3>
                          {product.category && (
                            <p className="text-sm text-muted-foreground">
                              {product.category}
                            </p>
                          )}
                        </div>
                        {/* Description */}
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        {/* Pricing */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-lg font-bold text-card-foreground">
                            <IndianRupee className="w-4 h-4" />
                            {product.offerPrice > 0 &&
                            product.offerPrice < product.price
                              ? product.offerPrice.toFixed(2)
                              : product.price.toFixed(2)}
                          </div>
                          {product.offerPrice > 0 &&
                            product.offerPrice < product.price && (
                              <div className="flex items-center text-sm text-muted-foreground line-through">
                                <IndianRupee className="w-3 h-3" />
                                {product.price.toFixed(2)}
                              </div>
                            )}
                        </div>
                        {/* Product Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Hash className="w-3 h-3 mr-1" />
                            Qty: {product.quantity}
                          </div>
                          <div className="flex items-center">
                            <Box className="w-3 h-3 mr-1" />
                            SKU: {product.sku || "N/A"}
                          </div>
                        </div>
                        {/* Tags */}
                        {product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {product.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{product.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        {/* Created Date */}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3 mr-1" />
                          Added {formatDate(product.created_at)}
                        </div>
                        {/* Action Buttons */}
                        // In the Action Buttons section
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              router.push(`/seller/viewproducts/edit/${product.id}`)
                            }
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="bg-card rounded-3xl p-8 text-center shadow-xl border border-border backdrop-blur-sm">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
