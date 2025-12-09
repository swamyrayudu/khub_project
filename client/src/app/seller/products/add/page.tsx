"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { addProduct } from '@/actions/productActions';
import { PRODUCT_CATEGORIES } from '@/lib/constants/categories';
import ImageUpload from '@/components/ui/image-upload';
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
  X,
  ShoppingBag,
  ImageIcon,
  Percent,
  MapPin
} from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  offerPrice: string;
  quantity: string;
  category: string;
  brand: string;
  sku: string;
  weight: string;
  dimensions: string;
  tags: string;
  images: string[];
  googleMapsUrl: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    offerPrice: '',
    quantity: '',
    category: '',
    brand: '',
    sku: '',
    weight: '',
    dimensions: '',
    tags: '',
    images: [],
    googleMapsUrl: ''
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

  const handleImageChange = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: urls }));
    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
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

    if (formData.offerPrice && parseFloat(formData.offerPrice) >= parseFloat(formData.price)) {
      newErrors.offerPrice = 'Offer price must be less than regular price';
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

    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    // Validate Google Maps URL format if provided
    if (formData.googleMapsUrl && formData.googleMapsUrl.trim() !== '') {
      const googleMapsPatterns = [
        /^https?:\/\/(www\.)?google\.[a-z]+\/maps/i,
        /^https?:\/\/maps\.google\.[a-z]+/i,
        /^https?:\/\/goo\.gl\/maps/i,
        /^https?:\/\/maps\.app\.goo\.gl/i
      ];
      
      const isValid = googleMapsPatterns.some(pattern => pattern.test(formData.googleMapsUrl));
      
      if (!isValid) {
        newErrors.googleMapsUrl = 'Please provide a valid Google Maps URL';
      }
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
          if (key === 'images') {
            serverFormData.append('images', JSON.stringify(value));
          } else if (typeof value === 'string' && value.trim()) {
            serverFormData.append(key, value.trim());
          } else if (typeof value === 'string') {
            serverFormData.append(key, value);
          }
        });

        console.log("📤 Submitting product data...");
        const result = await addProduct(serverFormData);

        if (result.success) {
          toast.success(result.message, {
            position: "top-center",
            autoClose: 3000,
          });

          setFormData({
            name: '', description: '', price: '', offerPrice: '', quantity: '',
            category: '', brand: '', sku: '', weight: '',
            dimensions: '', tags: '', images: [], googleMapsUrl: ''
          });
          setErrors({});

          setTimeout(() => {
            router.push('/seller/viewproducts');
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
      name: '', description: '', price: '', offerPrice: '', quantity: '',
      category: '', brand: '', sku: '', weight: '',
      dimensions: '', tags: '', images: [], googleMapsUrl: ''
    });
    setErrors({});
  };

  const discountPercentage = formData.price && formData.offerPrice 
    ? Math.round(((parseFloat(formData.price) - parseFloat(formData.offerPrice)) / parseFloat(formData.price)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              disabled={isPending}
              className="bg-card border-border"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">Add New Product</h1>
              <p className="text-muted-foreground">Add a new product to your inventory and start selling</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-primary" />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-3xl p-8 shadow-xl border border-border backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Information */}
            <Card className="border-border bg-background/50">
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
                  <Label htmlFor="name" className="flex items-center text-sm font-medium text-card-foreground">
                    <Package className="w-4 h-4 mr-2 text-primary" />
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter a clear, descriptive product name"
                    required
                    disabled={isPending}
                    className={`bg-background border-border ${errors.name ? 'border-destructive' : ''}`}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-card-foreground">
                    Product Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your product features, benefits, and specifications..."
                    rows={4}
                    disabled={isPending}
                    className="bg-background border-border"
                  />
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-card-foreground">
                      Category
                    </Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleSelectChange('category', value)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="bg-background border-border">
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

                  <div className="space-y-2">
                    <Label htmlFor="brand" className="text-sm font-medium text-card-foreground">
                      Brand
                    </Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Enter brand name"
                      disabled={isPending}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card className="border-border bg-background/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-blue-600" />
                  <span>Product Images</span>
                </CardTitle>
                <CardDescription>
                  Upload high-quality images of your product to attract customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-card-foreground">
                    Product Images *
                  </Label>
                  <ImageUpload
                    value={formData.images}
                    onChange={handleImageChange}
                    disabled={isPending}
                    maxFiles={5}
                  />
                  {errors.images && (
                    <p className="text-sm text-destructive">{errors.images}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card className="border-border bg-background/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span>Pricing & Inventory</span>
                </CardTitle>
                <CardDescription>Set your product pricing and stock information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Regular Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center text-sm font-medium text-card-foreground">
                      <DollarSign className="w-4 h-4 mr-2 text-primary" />
                      Regular Price (₹) *
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={`bg-background border-border ${errors.price ? 'border-destructive' : ''}`}
                      required
                      disabled={isPending}
                    />
                    {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                  </div>

                  {/* Offer Price */}
                  <div className="space-y-2">
                    <Label htmlFor="offerPrice" className="flex items-center text-sm font-medium text-card-foreground">
                      <Percent className="w-4 h-4 mr-2 text-primary" />
                      Offer Price (₹)
                      {discountPercentage > 0 && (
                        <span className="ml-2 text-green-600 text-sm">
                          ({discountPercentage}% off)
                        </span>
                      )}
                    </Label>
                    <Input
                      id="offerPrice"
                      name="offerPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.offerPrice}
                      onChange={handleInputChange}
                      placeholder="0.00 (optional)"
                      className={`bg-background border-border ${errors.offerPrice ? 'border-destructive' : ''}`}
                      disabled={isPending}
                    />
                    {errors.offerPrice && <p className="text-sm text-destructive">{errors.offerPrice}</p>}
                    <p className="text-xs text-muted-foreground">
                      Set a lower price to offer discounts to customers
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="flex items-center text-sm font-medium text-card-foreground">
                    <Hash className="w-4 h-4 mr-2 text-primary" />
                    Quantity in Stock *
                  </Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    className={`bg-background border-border max-w-xs ${errors.quantity ? 'border-destructive' : ''}`}
                    required
                    disabled={isPending}
                  />
                  {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
                </div>
              </CardContent>
            </Card>

            {/* ✅ NEW: Location Information */}
            <Card className="border-border bg-background/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  <span>Location Information</span>
                </CardTitle>
                <CardDescription>
                  Add your product&apos;s location to help customers find you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="googleMapsUrl" className="flex items-center text-sm font-medium text-card-foreground">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    Google Maps URL
                  </Label>
                  <Input
                    id="googleMapsUrl"
                    name="googleMapsUrl"
                    type="url"
                    value={formData.googleMapsUrl}
                    onChange={handleInputChange}
                    placeholder="https://maps.google.com/..."
                    disabled={isPending}
                    className={`bg-background border-border ${errors.googleMapsUrl ? 'border-destructive' : ''}`}
                  />
                  {errors.googleMapsUrl && (
                    <p className="text-sm text-destructive">{errors.googleMapsUrl}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Paste the Google Maps link of your product location. The coordinates will be extracted automatically.
                  </p>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-xs font-medium text-card-foreground mb-1">How to get Google Maps URL:</p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Open Google Maps and search for your location</li>
                      <li>Click &quot;Share&quot; and then &quot;Copy link&quot;</li>
                      <li>Paste the link here</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="border-border bg-background/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="w-5 h-5 text-purple-600" />
                  <span>Additional Details</span>
                </CardTitle>
                <CardDescription>Optional information to help manage your inventory</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-medium text-card-foreground">
                    SKU (Stock Keeping Unit)
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="e.g., TSHIRT-001 (leave empty to auto-generate)"
                    disabled={isPending}
                    className={`bg-background border-border ${errors.sku ? 'border-destructive' : ''}`}
                  />
                  {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
                  <p className="text-xs text-muted-foreground">
                    Unique identifier for inventory tracking. Auto-generated if left empty.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center text-sm font-medium text-card-foreground">
                      <Weight className="w-4 h-4 mr-2 text-primary" />
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className={`bg-background border-border ${errors.weight ? 'border-destructive' : ''}`}
                      disabled={isPending}
                    />
                    {errors.weight && <p className="text-sm text-destructive">{errors.weight}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions" className="flex items-center text-sm font-medium text-card-foreground">
                      <Ruler className="w-4 h-4 mr-2 text-primary" />
                      Dimensions
                    </Label>
                    <Input
                      id="dimensions"
                      name="dimensions"
                      value={formData.dimensions}
                      onChange={handleInputChange}
                      placeholder="e.g., 10cm × 20cm × 5cm"
                      className="bg-background border-border"
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium text-card-foreground">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., summer, cotton, casual (comma-separated)"
                    disabled={isPending}
                    className="bg-background border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add tags to help customers find your product. Separate with commas.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleClearForm}
                disabled={isPending}
                className="bg-card border-border"
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
                  className="bg-card border-border"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={isPending}
                  className="min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90"
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
      </div>
    </div>
  );
}
