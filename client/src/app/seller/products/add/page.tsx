"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { addProduct } from '@/actions/productActions';
import { PRODUCT_CATEGORIES } from '@/lib/constants/categories';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Hash, 
  Weight, 
  Ruler, 
  Tag,
  Save,
  Loader2,
  Info,
  X,
  ShoppingBag
} from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  quantity: string;
  category: string;
  brand: string;
  sku: string;
  weight: string;
  dimensions: string;
  tags: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    brand: '',
    sku: '',
    weight: '',
    dimensions: '',
    tags: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (formData.weight && parseFloat(formData.weight) < 0) {
      newErrors.weight = 'Weight cannot be negative';
    }

    if (formData.sku && formData.sku.length > 0 && formData.sku.length < 3) {
      newErrors.sku = 'SKU must be at least 3 characters if provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    startTransition(async () => {
      try {
        const serverFormData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value.trim()) serverFormData.append(key, value.trim());
        });

        console.log("📤 Submitting product data...");
        const result = await addProduct(serverFormData);

        if (result.success) {
          toast.success(result.message, {
            position: "top-center",
            autoClose: 3000,
          });

          setFormData({
            name: '', description: '', price: '', quantity: '',
            category: '', brand: '', sku: '', weight: '',
            dimensions: '', tags: ''
          });
          setErrors({});

          setTimeout(() => {
            router.push('/seller/products');
          }, 1500);
        } else {
          toast.error(result.message, {
            position: "top-right",
            autoClose: 5000,
          });
        }

      } catch (error) {
        console.error('Submit error:', error);
        toast.error('Failed to add product. Please try again.');
      }
    });
  };

  const handleClearForm = () => {
    setFormData({
      name: '', description: '', price: '', quantity: '',
      category: '', brand: '', sku: '', weight: '',
      dimensions: '', tags: ''
    });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={isPending}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground">Add a new product to your inventory and start selling</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-3 rounded-lg">
          <ShoppingBag className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-primary" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>Enter the essential details of your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter a clear, descriptive product name"
                required
                disabled={isPending}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product features, benefits, and specifications..."
                rows={4}
                disabled={isPending}
              />
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                  disabled={isPending}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Pricing & Inventory</span>
            </CardTitle>
            <CardDescription>Set your product pricing and stock information</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`pl-9 ${errors.price ? 'border-destructive' : ''}`}
                  required
                  disabled={isPending}
                />
              </div>
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity in Stock *</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  className={`pl-9 ${errors.quantity ? 'border-destructive' : ''}`}
                  required
                  disabled={isPending}
                />
              </div>
              {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-purple-600" />
              <span>Additional Details</span>
            </CardTitle>
            <CardDescription>Optional information to help manage your inventory</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
              <Input
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g., TSHIRT-001 (leave empty to auto-generate)"
                disabled={isPending}
                className={errors.sku ? 'border-destructive' : ''}
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
              <p className="text-xs text-muted-foreground">
                Unique identifier for inventory tracking. Auto-generated if left empty.
              </p>
            </div>

            {/* Weight & Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.weight}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className={`pl-9 ${errors.weight ? 'border-destructive' : ''}`}
                    disabled={isPending}
                  />
                </div>
                {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
              </div>

              {/* Dimensions */}
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    placeholder="e.g., 10cm × 20cm × 5cm"
                    className="pl-9"
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., summer, cotton, casual (comma-separated)"
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Add tags to help customers find your product. Separate with commas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearForm}
            disabled={isPending}
          >
            <X className="w-4 h-4 mr-2" />
            Clear Form
          </Button>
          
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding Product...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Product
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
