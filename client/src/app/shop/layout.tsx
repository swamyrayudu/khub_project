
// Example: src/app/shop/layout.tsx

import ShopHeader from "@/components/layouts/header";
import { WishlistProvider } from "@/contexts/WishlistContext";

export default function ShopLayout({ children } :{children:React.ReactNode}) {
  return (
    <WishlistProvider>
      <ShopHeader/>
      {children}
    </WishlistProvider>
  )
}