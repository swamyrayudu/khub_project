
// Example: src/app/shop/layout.tsx

import ShopHeader from "@/components/layouts/header";

export default function ShopLayout({ children } :{children:React.ReactNode}) {
  return (
    <>
      <ShopHeader/>
      {children}
    </>
  )
}