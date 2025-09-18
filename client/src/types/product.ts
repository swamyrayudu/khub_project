

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
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
  images: string[]; // ✅ Add this line
}
