import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  LayoutDashboard,
  MessageSquare,
  PackagePlus,
  Boxes,
  Tag,
  CircleUser,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full border-b bg-transparent">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Left: App Name */}
        <a href="/" className="text-2xl font-bold tracking-wide">
          LocalHunt
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <a href="/dashboard">
            <Button variant="ghost">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </a>
          <a href="/add-offers">
            <Button variant="ghost">
              <Tag className="h-4 w-4 mr-2" />
              Add Offers
            </Button>
          </a>
          <a href="/requests">
            <Button variant="ghost">
              <MessageSquare className="h-4 w-4 mr-2" />
              User Requests
            </Button>
          </a>
          <a href="/add-products">
            <Button variant="ghost">
              <PackagePlus className="h-4 w-4 mr-2" />
              Add Products
            </Button>
          </a>
          <a href="/my-products">
            <Button variant="ghost">
              <Boxes className="h-4 w-4 mr-2" />
              My Products
            </Button>
          </a>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full p-0 w-10 h-10">
                <Avatar>
                  <AvatarImage src="/profile.png" alt="Profile" />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem>
                <a href="/profile" className="flex items-center">
                  <CircleUser className="h-4 w-4 mr-2" />
                  Profile
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Logout clicked")} className="flex items-center text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <a href="/dashboard" className="flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/add-offers" className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Add Offers
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/requests" className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  User Requests
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/add-products" className="flex items-center">
                  <PackagePlus className="h-4 w-4 mr-2" />
                  Add Products
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/my-products" className="flex items-center">
                  <Boxes className="h-4 w-4 mr-2" />
                  My Products
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a href="/profile" className="flex items-center">
                  <CircleUser className="h-4 w-4 mr-2" />
                  Profile
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Logout clicked")} className="flex items-center text-red-500">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
