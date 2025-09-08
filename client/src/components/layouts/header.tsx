import Link from "next/link";
import { Button } from "../ui/button";
import { ModeToggle } from "../theme/toggle";


export default function ShopHeader() {
  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 dark:bg-black">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          LocalHunt
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 text-base font-medium">
          <Link href="/shop/products" className="hover:text-primary transition-colors">products</Link>
          <Link href="/seller/home" className="hover:text-primary transition-colors">map</Link>
          <Link href="/admin/home" className="hover:text-primary transition-colors">orders</Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/auth">
            <Button variant="outline" className="rounded-full px-6 py-2">Sign In</Button>
          </Link>
          <ModeToggle/>
        </div>

        {/* Mobile Nav Toggle (optional, for future) */}
        <button className="md:hidden p-2 rounded hover:bg-gray-100">
          <span className="sr-only">Open menu</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}
