export const PRODUCT_CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Electronic devices and accessories',
    icon: '📱'
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Fashion and apparel',
    icon: '👕'
  },
  {
    id: 'home-garden',
    name: 'Home & Garden',
    description: 'Home improvement and gardening',
    icon: '🏠'
  },
  {
    id: 'books',
    name: 'Books',
    description: 'Books and educational materials',
    icon: '📚'
  },
  {
    id: 'sports',
    name: 'Sports',
    description: 'Sports and fitness equipment',
    icon: '⚽'
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Health and wellness products',
    icon: '🏥'
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Car parts and accessories',
    icon: '🚗'
  },
  {
    id: 'beauty',
    name: 'Beauty',
    description: 'Beauty and personal care',
    icon: '💄'
  },
  {
    id: 'toys',
    name: 'Toys',
    description: 'Toys and games',
    icon: '🧸'
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    description: 'Jewelry and accessories',
    icon: '💍'
  }
] as const;

export type CategoryId = typeof PRODUCT_CATEGORIES[number]['id'];
export type Category = typeof PRODUCT_CATEGORIES[number];
