"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { getSellerProducts, getProductStats } from '@/actions/productActions';
import Image from 'next/image';
import { 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Store,
  Activity,
  Calendar,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Award,
  Loader2,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  Star,
  Bell,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UserData {
  id: string;
  email: string;
  name: string;
  shopName?: string;
  role: string;
  status: string;
}

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

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStock: number;
  lowStock: number;
  totalValue: number;
  averagePrice: number;
  productsWithOffers: number;
}

export default function SellerHomeContent() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('userData');

    if (!token || !userDataString) {
      router.push('/seller/auth/login');
      return;
    }

    try {
      const user = JSON.parse(userDataString);
      setUserData(user);
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to parse user data:', error);
      router.push('/seller/auth/login');
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products and stats in parallel
      const [productsResult, statsResult] = await Promise.all([
        getSellerProducts(),
        getProductStats()
      ]);

      if (productsResult.success) {
        setProducts(productsResult.products);
      }

      if (statsResult.success && statsResult.stats) {
        setProductStats(statsResult.stats);
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const quickActions = [
    {
      title: 'Add Product',
      description: 'Add new products to your inventory and start selling',
      icon: Plus,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      href: '/seller/products/add',
      priority: 'high'
    },
    {
      title: 'View Products',
      description: 'Manage your existing products and inventory',
      icon: Package,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600',
      href: '/seller/viewproducts',
      priority: 'high'
    },
    {
      title: 'Analytics',
      description: 'Track your sales performance and insights',
      icon: BarChart3,
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
      href: '/seller/analytics',
      priority: 'medium'
    },
    {
      title: 'Orders',
      description: 'Process orders and manage fulfillment',
      icon: ShoppingCart,
      color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
      href: '/seller/orders',
      priority: 'high'
    },
    {
      title: 'Customer Messages',
      description: 'View and reply to customer inquiries',
      icon: Bell,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
      href: '/seller/messages',
      priority: 'high'
    },
    {
      title: 'Customer support',
      description: 'Manage customer relationships and support',
      icon: Users,
      color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600',
      href: '/seller/contect',
      priority: 'medium'
    },
    {
      title: 'Settings',
      description: 'Configure your store and preferences',
      icon: Settings,
      color: 'bg-gray-100 dark:bg-gray-900/20 text-gray-600',
      href: '/seller/settings',
      priority: 'low'
    }
  ];

  const recentProducts = products.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {userData.name} 👋
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-card border-border"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            
            <Button 
              onClick={() => router.push('/seller/products/add')}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 border-primary/20 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <Store className="w-6 h-6 text-primary mr-2" />
                  <h2 className="text-xl font-semibold text-card-foreground">
                    {userData.shopName || 'Your Store'}
                  </h2>
                  <Badge className="ml-3 bg-green-100 text-green-700 border-green-200">
                    {userData.status}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-3">
                  {productStats ? 
                    `You have ${productStats.totalProducts} products in your inventory` :
                    'Start growing your business by adding products'
                  }
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              <div className="hidden md:block">
                <div className="bg-primary/10 p-4 rounded-xl">
                  <TrendingUp className="w-12 h-12 text-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Total Revenue */}
          <Card className="hover:shadow-lg transition-all duration-200 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    ₹{productStats ? productStats.totalValue.toLocaleString() : '0'}
                  </p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Target className="w-3 h-3 mr-1" />
                    Inventory Value
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="hover:shadow-lg transition-all duration-200 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Products</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {productStats ? productStats.totalProducts : products.length}
                  </p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {productStats ? productStats.activeProducts : 0} Active
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="hover:shadow-lg transition-all duration-200 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Status</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {productStats ? productStats.lowStock : 0}
                  </p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Low Stock Items
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Price */}
          <Card className="hover:shadow-lg transition-all duration-200 border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Price</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    ₹{productStats ? Math.round(productStats.averagePrice).toLocaleString() : '0'}
                  </p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Award className="w-3 h-3 mr-1" />
                    {productStats ? productStats.productsWithOffers : 0} With Offers
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 text-primary mr-2" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Manage your store efficiently with these shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleNavigation(action.href)}
                      className="bg-background rounded-lg p-4 border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center mb-3">
                        <div className={`p-2 ${action.color} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                          <action.icon className="w-5 h-5" />
                        </div>
                        <div className="ml-3 flex-1">
                          <h4 className="font-medium text-card-foreground group-hover:text-primary transition-colors duration-200">
                            {action.title}
                          </h4>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {action.description}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Products */}
          <div>
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 text-primary mr-2" />
                    Recent Products
                  </CardTitle>
                  {products.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push('/seller/viewproducts')}
                    >
                      View All
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Your latest additions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentProducts.length > 0 ? (
                  <div className="space-y-4">
                    {recentProducts.map((product) => (
                      <div key={product.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
                           onClick={() => router.push(`/seller/viewproducts/edit/${product.id}`)}>
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {product.images.length > 0 ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-card-foreground truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm font-medium text-primary">
                              ₹{product.offerPrice > 0 ? product.offerPrice : product.price}
                            </span>
                            <Badge 
                              variant={product.quantity > 5 ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {product.quantity} left
                            </Badge>
                          </div>
                        </div>
                        
                        <Edit className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => router.push('/seller/products/add')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Product
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground text-sm mb-3">No products yet</p>
                    <Button 
                      size="sm"
                      onClick={() => router.push('/seller/products/add')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Product
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alerts & Notifications */}
        {productStats && (productStats.outOfStock > 0 || productStats.lowStock > 0) && (
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
                <Bell className="w-5 h-5 mr-2" />
                Attention Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productStats.outOfStock > 0 && (
                  <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                      <span className="text-red-700 dark:text-red-300">
                        {productStats.outOfStock} products are out of stock
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/seller/viewproducts')}
                    >
                      Manage Stock
                    </Button>
                  </div>
                )}
                
                {productStats.lowStock > 0 && (
                  <div className="flex items-center justify-between bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                      <span className="text-yellow-700 dark:text-yellow-300">
                        {productStats.lowStock} products have low stock (≤5 items)
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/seller/viewproducts')}
                    >
                      Restock Items
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 text-primary mr-2" />
                Activity Overview
              </CardTitle>
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </div>
            <CardDescription>
              Keep track of your store activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">
                        Added product: {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start by adding your first product to see activity here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
