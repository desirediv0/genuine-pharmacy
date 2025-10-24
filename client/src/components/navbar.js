"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Heart,
  ChevronDown,
  LogIn,
  Mail,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useRouter, usePathname } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { ClientOnly } from "./client-only";
import Image from "next/image";
import { toast, Toaster } from "sonner";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, getCartItemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = [
    "Search products...",
    "Search by category...",
    "Search by brand..."
  ];
  const [isHoveringDropdown, setIsHoveringDropdown] = useState(null);
  const searchInputRef = useRef(null);
  const navbarRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchExpanded(false);
    setActiveDropdown(null);
  }, [pathname]);

  // Handle click outside of navbar to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchApi("/public/categories");
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const encoded = encodeURIComponent(searchQuery).replace(/%20/g, "+");
      router.push(`/products?search=${encoded}`);
      setIsSearchExpanded(false);
      setIsMenuOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    // Show logout toast notification
    toast.success("Logged out successfully");
    window.location.href = "/";
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  // Handle hover for dropdowns
  const handleDropdownHover = (dropdown) => {
    setIsHoveringDropdown(dropdown);
    if (dropdown) {
      setActiveDropdown(dropdown);
    }
  };

  const handleDropdownLeave = () => {
    setIsHoveringDropdown(null);
    // Only close if not clicking inside the dropdown
    if (!navbarRef.current?.contains(document.activeElement)) {
      setActiveDropdown(null);
    }
  };

  // Mobile menu with ClientOnly to prevent hydration issues
  const MobileMenu = ({
    isMenuOpen,
    setIsMenuOpen,
    categories,
    isAuthenticated,
    handleLogout,
  }) => {
    const mobileSearchInputRef = useRef(null);

    useEffect(() => {
      // Focus the search input when menu opens with a small delay
      if (isMenuOpen) {
        const timer = setTimeout(() => {
          if (mobileSearchInputRef.current) {
            mobileSearchInputRef.current.focus();
          }
        }, 300);

        return () => clearTimeout(timer);
      }
    }, [isMenuOpen]);

    if (!isMenuOpen) return null;

    return (
      <div
        className="md:hidden fixed inset-0 z-50 bg-white overflow-y-auto"
        style={{ maxHeight: "100vh" }}
      >
        <div className="flex flex-col h-full">
          <div className="sticky top-0 bg-white border-b border-gray-200 flex justify-between items-center px-4 py-3 z-10">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={150}
                height={150}
                className="ml-2 p-2 lg:p-0"
              />
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
            <div className="border-b pb-2 mb-4">
              <Link
                href="/products"
                className="block py-3 text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
            </div>

            <div className="border-b pb-4 mb-4">
              <h3 className="font-bold text-lg mb-3">Categories</h3>
              <div className="space-y-3 pl-2">
                {categories.map((category) => (
                  <div key={category.id} className="py-1">
                    <Link
                      href={`/category/${category.slug}`}
                      className="block hover:text-primary text-base transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>


            <div className="border-b pb-4 mb-4">
              <Link
                href="/about"
                className="block py-3 text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
            </div>

            <div className="border-b pb-4 mb-4">
              <Link
                href="/shipping-policy"
                className="block py-3 text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shipping Policy
              </Link>
            </div>

            <div className="border-b pb-4 mb-4">
              <Link
                href="/contact"
                className="block py-3 text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="border-b pb-4 mb-4">
                <h3 className="font-bold text-lg mb-3">My Account</h3>
                <div className="space-y-3 pl-2">
                  <Link
                    href="/account"
                    className="block py-1.5 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    className="block py-1.5 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block py-1.5 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block py-1.5 text-red-600 hover:text-red-800 w-full text-left transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 mt-6">
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full py-6 text-base">
                    Login
                  </Button>
                </Link>
                <Link href="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full py-6 text-base">Register</Button>
                </Link>
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-medium">connect.genuinepharmacy@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm" ref={navbarRef}>
        <Toaster position="top-center" />
        {/* Top bar */}
        <div className="bg-gradient-to-r from-orange-500 to-blue-500/80 text-white py-1.5">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              {/* Left - Phone number */}
              <div className="hidden md:flex items-center text-xs">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                <span>connect.genuinepharmacy@gmail.com</span>
              </div>

              {/* Center - Free shipping text */}
              <div className="text-center text-xs md:text-sm font-medium mx-auto md:mx-0 capitalize">
                Shop for ₹999+ and receive a scratch card with exciting rewards!
              </div>

              {/* Right - Navigation links */}
              <div className="hidden md:flex items-center space-x-4 text-xs">
                <Link
                  href="/shipping-policy"
                  className="hover:text-gray-200 transition-colors"
                >
                  Shipping
                </Link>
                <Link
                  href="/faqs"
                  className="hover:text-gray-200 transition-colors"
                >
                  FAQs
                </Link>
                <Link
                  href="/contact"
                  className="hover:text-gray-200 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main navbar */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16 md:h-20">
              {/* Menu toggle and search for mobile */}
              <div className="flex items-center md:hidden gap-2">
                <button
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors focus:outline-none"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>

              {/* Logo */}
              <Link href="/" className="flex items-center p-2">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={150}
                  height={150}
                  className="ml-2 p-2 lg:p-0"
                />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/products"
                  className="font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  All Products
                </Link>

                {/* Categories dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => handleDropdownHover("categories")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={`font-medium ${activeDropdown === "categories"
                      ? "text-primary"
                      : "text-gray-700"
                      } hover:text-primary transition-all duration-200 flex items-center focus:outline-none group`}
                    onClick={() => toggleDropdown("categories")}
                    aria-expanded={activeDropdown === "categories"}
                  >
                    Categories
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === "categories" ? "rotate-180" : ""
                        } group-hover:rotate-180`}
                    />
                  </button>
                  <div
                    className={`absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md py-2 border border-gray-100 z-50 transition-all duration-300 ease-in-out transform origin-top ${activeDropdown === "categories"
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                      } ${categories.length > 20
                        ? "w-[500px]"
                        : categories.length > 13
                          ? "w-96"
                          : "w-64"
                      }`}
                  >
                    {categories.length > 20 ? (
                      <div className="grid grid-cols-3 gap-1 px-3">
                        {categories.map((category, index) => (
                          <div key={category.id}>
                            <Link
                              href={`/category/${category.slug}`}
                              className={`block px-3 py-2 hover:bg-gray-50 hover:text-primary transition-all duration-200 rounded text-base ${index % 3 === 0
                                ? "hover:bg-blue-50"
                                : index % 3 === 1
                                  ? "hover:bg-green-50"
                                  : "hover:bg-orange-50"
                                }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {category.name}
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : categories.length > 13 ? (
                      <div className="grid grid-cols-2 gap-1 px-2">
                        {categories.map((category, index) => (
                          <div key={category.id}>
                            <Link
                              href={`/category/${category.slug}`}
                              className={`block px-3 py-2 hover:bg-gray-50 hover:text-primary transition-all duration-200 rounded text-base ${index % 2 === 0
                                ? "hover:bg-blue-50"
                                : "hover:bg-green-50"
                                }`}
                              onClick={() => setActiveDropdown(null)}
                            >
                              {category.name}
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {categories.map((category) => (
                          <div key={category.id}>
                            <Link
                              href={`/category/${category.slug}`}
                              className="block px-4 py-2.5 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {category.name}
                            </Link>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <Link
                        href="/categories"
                        className="block px-4 py-2.5 text-primary font-medium hover:bg-primary/5 transition-all duration-200"
                        onClick={() => setActiveDropdown(null)}
                      >
                        View All Categories
                      </Link>
                    </div>
                  </div>
                </div>

                <Link
                  href="/about"
                  className="font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  About Us
                </Link>

                <Link
                  href="/contact"
                  className="font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </nav>

              {/* Search, Cart, Account */}
              <div className="flex items-center space-x-1 md:space-x-4">
                {/* Search button/form - hide on home (/) */}
                {pathname !== "/" && (
                  <div className="relative">
                    {isSearchExpanded ? (
                      <>
                        <div
                          className="fixed inset-0 bg-black/50 z-40"
                          onClick={() => setIsSearchExpanded(false)}
                        />
                        <div className="fixed inset-x-0 top-0 z-50 w-full animate-in slide-in-from-top duration-300 p-2">
                          <form
                            onSubmit={handleSearch}
                            className="relative bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden max-h-[90vh] md:max-w-[600px] mx-auto"
                          >
                            <div className="flex items-center px-4 py-4 border-b border-gray-100">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Search Products
                              </h3>
                              <button
                                type="button"
                                className="ml-auto p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
                                onClick={() => setIsSearchExpanded(false)}
                                aria-label="Close search"
                              >
                                <X className="h-6 w-6 text-gray-500" />
                              </button>
                            </div>

                            <div className="p-5">
                              <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                  ref={searchInputRef}
                                  type="search"
                                  placeholder={placeholders[placeholderIndex]}
                                  className="w-full pl-12 pr-12 py-3 border-gray-200 focus:border-primary focus:ring-primary rounded-lg text-base"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  autoComplete="off"
                                />
                                {searchQuery && (
                                  <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                  >
                                    <X className="h-5 w-5" />
                                  </button>
                                )}
                              </div>

                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">
                                  Popular Searches
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    "Protein Powder",
                                    "Gainer",
                                    "Bcaa",
                                    "Creatine",
                                  ].map((term) => (
                                    <button
                                      key={term}
                                      type="button"
                                      onClick={() => {
                                        setSearchQuery(term);
                                        handleSearch({
                                          preventDefault: () => { },
                                        });
                                      }}
                                      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-primary/10 text-gray-700 hover:text-primary rounded-full transition-all duration-200"
                                    >
                                      {term}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
                              <button
                                type="button"
                                onClick={() => setIsSearchExpanded(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 font-medium text-sm"
                              >
                                <Search className="h-4 w-4" />
                                Search
                              </button>
                            </div>
                          </form>
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsSearchExpanded(true)}
                        className="p-2 text-gray-600 hover:text-primary transition-all duration-200 focus:outline-none hover:scale-110 hidden md:block"
                        aria-label="Search"
                      >
                        <Search className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Wishlist - Desktop Only */}
                <Link
                  href="/wishlist"
                  className="hidden md:block p-2 text-gray-600 hover:text-primary transition-colors relative"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                {/* Cart */}
                <ClientOnly>
                  <Link
                    href="/cart"
                    className="p-2 text-gray-600 hover:text-primary transition-colors relative"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {getCartItemCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                        {getCartItemCount()}
                      </span>
                    )}
                  </Link>
                </ClientOnly>

                {/* Account - desktop */}
                <div
                  className="hidden md:block relative"
                  onMouseEnter={() => handleDropdownHover("account")}
                  onMouseLeave={handleDropdownLeave}
                >
                  <ClientOnly>
                    <button
                      className={`p-2 ${activeDropdown === "account"
                        ? "text-primary"
                        : "text-gray-600"
                        } hover:text-primary transition-all duration-200 flex items-center focus:outline-none group`}
                      onClick={() => toggleDropdown("account")}
                      aria-expanded={activeDropdown === "account"}
                    >
                      {isAuthenticated ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <LogIn className="h-5 w-5" />
                      )}
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === "account" ? "rotate-180" : ""
                          } group-hover:rotate-180`}
                      />
                    </button>

                    <div
                      className={`absolute right-0 top-full mt-1 w-64 bg-white shadow-lg rounded-md py-2 border border-gray-100 z-50 transition-all duration-300 ease-in-out transform origin-top ${activeDropdown === "account"
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-2 border-b border-gray-100 mb-2">
                            <p className="font-medium">
                              Hi, {user?.name || "User"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                          <Link
                            href="/account"
                            className="block px-4 py-2 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                            onClick={() => setActiveDropdown(null)}
                          >
                            My Account
                          </Link>
                          <Link
                            href="/account/orders"
                            className="block px-4 py-2 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                            onClick={() => setActiveDropdown(null)}
                          >
                            My Orders
                          </Link>
                          <Link
                            href="/wishlist"
                            className="block px-4 py-2 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                            onClick={() => setActiveDropdown(null)}
                          >
                            My Wishlist
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setActiveDropdown(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-all duration-200 mt-2 border-t border-gray-100"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3">
                            <Link
                              href="/auth"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <Button className="w-full mb-2 hover:scale-[1.02] transition-transform duration-200">
                                Login
                              </Button>
                            </Link>
                            <Link
                              href="/auth"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <Button
                                variant="outline"
                                className="w-full hover:scale-[1.02] transition-transform duration-200"
                              >
                                Register
                              </Button>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </ClientOnly>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <ClientOnly>
          <MobileMenu
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            categories={categories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            isAuthenticated={isAuthenticated}
            user={user}
            cart={cart}
            handleLogout={handleLogout}
          />
        </ClientOnly>
      </header>

      {/* Mobile Search Bar - Below Header (hide on home) */}
      {pathname !== "/" && (
        <div className="md:hidden sticky top-[102px] z-40 bg-white shadow-sm px-4 py-2">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="h-5 w-5" />
              </div>
              <Input
                type="text"
                placeholder={placeholders[placeholderIndex]}
                className="w-full pl-11 pr-14 py-5 text-base bg-gray-50/80 border-gray-200 focus:border-primary focus:ring-primary rounded-xl placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 pr-3">
                {searchQuery && (
                  <button
                    type="button"
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="p-1.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 gap-1">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-2 px-1 ${pathname === "/" ? "text-primary" : "text-gray-600"
              }`}
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            href={isAuthenticated ? "/account" : "/auth"}
            className={`flex flex-col items-center justify-center py-2 px-1 ${pathname.includes("/account") || pathname === "/auth"
              ? "text-primary"
              : "text-gray-600"
              }`}
          >
            {isAuthenticated ? (
              <User className="h-6 w-6" />
            ) : (
              <LogIn className="h-6 w-6" />
            )}
            <span className="text-xs mt-1">You</span>
          </Link>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 text-gray-600 w-full"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs mt-1">More</span>
          </button>

          <Link
            href="/cart"
            className={`flex flex-col items-center justify-center py-2 px-1 relative ${pathname === "/cart" ? "text-primary" : "text-gray-600"
              }`}
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <ClientOnly>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </ClientOnly>
            </div>
            <span className="text-xs mt-1">Cart</span>
          </Link>

          <a
            href="https://genuinenutrition.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center p-2 bg-orange-500 rounded-l-md overflow-hidden h-12 my-auto`}
          >
            <Image src="/logo-white.png" alt="Genuine Nutrition" width={200} height={200}
              className="object-contain h-full w-full"
            />
          </a>
        </div>
      </div>
    </>
  );
}
