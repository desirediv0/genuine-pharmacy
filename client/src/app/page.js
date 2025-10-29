"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, fetchProductsByType } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import BenefitsSec from "@/components/benifit-sec";
import CategoriesCarousel from "@/components/catgry";
import Headtext from "@/components/ui/headtext";
import { useRouter } from "next/navigation";
import {
  scratch
} from "@/assets";
import SupplementStoreUI from "@/components/SupplementStoreUI";
import CategoryGrid from "@/components/CategoryGrid";
import BrandCarousel from "@/components/BrandCarousel";
import ProducCard from "@/components/ProducCard";

const HeroCarousel = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Search products via public API (debounced)
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchApi(`/public/products?search=${encodeURIComponent(query)}&limit=6`);
        setSuggestions(res?.data?.products || []);
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    // Navigate to products page with search query
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
  };

  const handleSelect = (product) => {
    router.push(`/products/${product.slug}`);
    setShowSuggestions(false);
  };

  return (
    <header
      className="w-full text-white"
      style={{ background: "linear-gradient(90deg,#09396A 0%, #09396A 30%, #E65F1C 100%)" }}
    >
      <div className="container mx-auto px-4 py-6 lg:py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left promo image */}
          <div className="flex md:items-center md:justify-start md:w-64">
            <div className="w-64 h-64  overflow-hidden ">
              <Image src={"/1st.png"} alt="promo-left" width={300} height={300} className="object-cover" />
            </div>
          </div>

          {/* Title and subtitle */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex-1 md:flex-none text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Buy Health Care Items and Essentials</h1>
              <p className="text-sm md:text-base text-white/80 mt-2">Fast delivery • Authentic products • Trusted pharmacy</p>
            </div>

            {/* Center: prominent Search pill */}
            <div className="w-full md:flex-1 max-w-4xl">
              <form onSubmit={handleSubmit} className="relative">
                <label htmlFor="hero-search" className="sr-only">Search Medicines</label>
                <div className="flex items-center bg-white rounded shadow px-3 py-2  text-gray-700">
                  <svg className="w-6 h-6 text-gray-400 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35"></path><circle cx="11" cy="11" r="6"></circle></svg>
                  <input
                    id="hero-search"
                    type="search"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                    placeholder="Search Medicines"
                    className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-base md:text-lg"
                    onFocus={() => setShowSuggestions(true)}
                  />
                  <button type="submit" className="ml-4 inline-flex items-center px-6 py-2 rounded bg-[#E65F1C] text-white text-sm md:text-base shadow-md">Search</button>
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && (suggestions.length > 0 || loading) && (
                  <div className="absolute left-0 right-0 mt-3 bg-white rounded shadow z-50 overflow-hidden text-gray-800">
                    {loading ? (
                      <div className="p-3 text-sm">Loading...</div>
                    ) : (
                      suggestions.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelect(p)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                        >
                          <div className="w-14 h-14 relative flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                            {p.image ? (
                              <Image src={p.image} alt={p.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm md:text-base">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.category?.name || ""}</div>
                          </div>
                          <div className="text-sm text-gray-600">{p.basePrice ? `₹${p.basePrice}` : ""}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right promo image */}
          <div className="hidden lg:flex md:items-center md:justify-end md:w-64">
            <div className="w-64 h-64  overflow-hidden ">
              <Image src={"/2nd.png"} alt="promo-right" width={300} height={300} className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Announcement Banner
const AnnouncementBanner = () => {
  return (
    <div className="bg-primary/10 py-2 md:py-4 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-center">
          <div className="flex items-center">
            <span className="text-xs md:text-base font-medium">
              ⚡ Spend ₹999 or more and unlock a scratch card – win exciting
              goodies!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Featured Products Component with modern card design and carousel
const FeaturedProducts = ({
  products = [],
  isLoading = false,
  error = null,
}) => {
  const [api, setApi] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Handle slide change
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Failed to load products</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product, index) => (
              <CarouselItem
                key={product.id || product.slug || index}
                className="pl-4 basis-1/2 md:basis-1/4 lg:basis-1/6 py-5 md:py-6"
              >
                <ProducCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Controls */}
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white/90 hover:bg-white hover:text-black border-gray-200 text-gray-700 shadow-lg" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 bg-white/90 hover:bg-white hover:text-black border-gray-200 text-gray-700 shadow-lg" />
        </Carousel>
      </div>

      <div className="text-center mt-2">
        <Link href="/products">
          <Button
            variant="outline"
            size="lg"
            className="font-medium border-primary text-primary hover:bg-primary hover:text-white group rounded-full"
          >
            View All Products
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </Link>
      </div>
    </>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Riya Mehta",
      role: "Verified Buyer",
      quote:
        "Genuine Pharmacy always delivers authentic supplements. The packaging is secure and delivery is super fast!",
      rating: 5,
      verified: true,
    },
    {
      name: "Arjun Patel",
      role: "Regular Customer",
      quote:
        "I’ve ordered from Genuine Pharmacy several times — never faced any issue with product quality or delivery.",
      rating: 5,
      verified: true,
    },
    {
      name: "Neha Sharma",
      role: "Fitness Enthusiast",
      quote:
        "Totally trust Genuine Pharmacy for all my health supplements. They always send genuine and fresh products.",
      rating: 5,
      verified: true,
    },
    {
      name: "Manish Verma",
      role: "Certified Trainer",
      quote:
        "I recommend Genuine Pharmacy to all my clients. Reliable source for authentic fitness products.",
      rating: 5,
      verified: true,
    },
    {
      name: "Snehal Desai",
      role: "Wellness Coach",
      quote:
        "Love the clean packaging and fast service. Offers are great and products are always genuine.",
      rating: 5,
      verified: true,
    },
    {
      name: "Rahul Nair",
      role: "Health Consultant",
      quote:
        "Customer service is excellent and product range is wide. Genuine Pharmacy is my go-to for supplements.",
      rating: 5,
      verified: true,
    },
  ];


  // Carousel logic
  const [api, setApi] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrentSlide(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  return (
    <section className="py-10 bg-white relative">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <Headtext text="WHAT OUR CUSTOMERS SAY" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <Carousel setApi={setApi} opts={{ align: "center", loop: true }}>
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/3 px-2">
                  <div className="bg-gray-50 rounded-xl shadow-md p-5 flex flex-col h-full justify-between">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/80 text-white font-bold text-lg mr-3">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-base text-gray-900 mb-0.5">
                          {testimonial.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-0.5">
                          {testimonial.role}
                        </p>
                        {testimonial.verified && (
                          <div className="flex items-center text-green-600 text-xs font-medium">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="2"
                                fill="white"
                              />
                              <path
                                d="M9 12l2 2l4-4"
                                stroke="green"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                            Verified customer
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => {
                        const isHalf = testimonial.rating - i === 0.5;
                        return (
                          <span key={i}>
                            {isHalf ? (
                              <svg
                                className="w-4 h-4 text-yellow-400 inline"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <defs>
                                  <linearGradient id={`half${index}${i}`}>
                                    <stop offset="50%" stopColor="#facc15" />
                                    <stop
                                      offset="50%"
                                      stopColor="white"
                                      stopOpacity="1"
                                    />
                                  </linearGradient>
                                </defs>
                                <path
                                  fill={`url(#half${index}${i})`}
                                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"
                                />
                              </svg>
                            ) : (
                              <Star
                                className={`h-4 w-4 ${i < Math.floor(testimonial.rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                                  }`}
                              />
                            )}
                          </span>
                        );
                      })}
                    </div>
                    <p className="text-gray-700 text-sm mb-2">
                      “{testimonial.quote}”
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 shadow" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white border border-gray-200 shadow" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

// Newsletter Section
const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      console.log(`Subscribed with: ${email}`);
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail("");
    }
  };

  return (
    <section className="relative py-10 md:py-12 overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-black/90 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1500"
          alt="Fitness background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-10 rounded-2xl border border-white/20 shadow-xl">
            <div className="flex flex-col md:flex-row gap-10 items-center">
              {/* Left content */}
              <div className="w-full md:w-1/2 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  JOIN OUR <span className="text-gray-400">FITNESS</span>{" "}
                  COMMUNITY
                </h2>

                <p className="text-gray-300 mb-5">
                  Get exclusive workout tips, nutrition advice, and special
                  offers straight to your inbox.
                </p>

                <div className="flex flex-col gap-2 md:gap-4 mb-3 md:mb-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <div className="h-6 w-6 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                      </div>
                    </div>
                    <span className="text-sm">Weekly fitness newsletter</span>
                  </div>

                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 7h-9"></path>
                        <path d="M14 17H5"></path>
                        <circle cx="17" cy="17" r="3"></circle>
                        <circle cx="7" cy="7" r="3"></circle>
                      </svg>
                    </div>
                    <span className="text-sm">Personalized workout plans</span>
                  </div>

                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                      </svg>
                    </div>
                    <span className="text-sm">
                      Exclusive discounts & offers
                    </span>
                  </div>
                </div>
              </div>

              {/* Right form */}
              <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow-lg">
                {subscribed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-10"
                  >
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-green-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Thank You for Subscribing!
                    </h3>
                    <p className="text-gray-600">
                      Check your inbox for a welcome message and a special
                      discount code.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Subscribe to Our Newsletter
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Your Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center"
                        >
                          Subscribe Now
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7"></path>
                          </svg>
                        </motion.button>
                      </div>

                      <p className="text-xs text-gray-500 text-center mt-4">
                        By subscribing, you agree to our Privacy Policy and
                        consent to receive updates from our company.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-square bg-gray-200"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
      <div className="h-8 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
);

// Home page component
export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch products by different types
    const fetchData = async () => {
      try {
        setProductsLoading(true);

        // Fetch products by different types
        const [featuredRes, latestRes, bestsellerRes, trendingRes, newRes] =
          await Promise.allSettled([
            fetchProductsByType("featured", 8),
            fetchProductsByType("latest", 8),
            fetchProductsByType("bestseller", 8),
            fetchProductsByType("trending", 8),
            fetchProductsByType("new", 8),
          ]);

        // Set featured products (fallback to regular featured if type doesn't exist)
        if (featuredRes.status === "fulfilled") {
          setFeaturedProducts(featuredRes.value?.data?.products || []);
        } else {
          // Fallback to regular featured products
          const fallbackRes = await fetchApi(
            "/public/products?featured=true&limit=8"
          );
          setFeaturedProducts(fallbackRes?.data?.products || []);
        }

        // Set latest products
        if (latestRes.status === "fulfilled") {
          setLatestProducts(latestRes.value?.data?.products || []);
        }

        // Set bestseller products
        if (bestsellerRes.status === "fulfilled") {
          setBestsellerProducts(bestsellerRes.value?.data?.products || []);
        }

        // Set trending products
        if (trendingRes.status === "fulfilled") {
          setTrendingProducts(trendingRes.value?.data?.products || []);
        }

        // Set new products
        if (newRes.status === "fulfilled") {
          setNewProducts(newRes.value?.data?.products || []);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err?.message || "Failed to fetch data");
      } finally {
        setProductsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <HeroCarousel />
      <CategoriesCarousel />
      {/* <AnnouncementBanner /> */}

      {/* Brand Carousels */}
      <BrandCarousel tag="TOP" title="TOP BRANDS" />

      {/* Featured Categories Section */}

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-5 md:py-6 my-3 md:my-4 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Headtext text="FEATURED PRODUCTS" />
              <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
                High-quality supplements to enhance your fitness journey
              </p>
            </div>

            <FeaturedProducts
              products={featuredProducts}
              isLoading={productsLoading}
              error={error}
            />
          </div>
        </section>
      )}
      <SupplementStoreUI />

      <BrandCarousel tag="NEW" title="NEW BRANDS" />

      {/* <GymSupplementShowcase /> */}
      <CategoryGrid />

      {/* Latest Products Section */}
      {latestProducts.length > 0 && (
        <section className="py-10 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Headtext text="LATEST PRODUCTS" />
              <p className="text-gray-600 my-6 max-w-2xl mx-auto">
                Discover our newest additions to the collection
              </p>
            </div>

            <FeaturedProducts
              products={latestProducts}
              isLoading={productsLoading}
              error={error}
            />
          </div>
        </section>
      )}

      {/* Bestseller Products Section */}
      {bestsellerProducts.length > 0 && (
        <section className="py-5 md:py-6 my-3 md:my-4 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Headtext text="BEST SELLERS" />
              <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
                Our most popular products loved by customers
              </p>
            </div>

            <FeaturedProducts
              products={bestsellerProducts}
              isLoading={productsLoading}
              error={error}
            />
          </div>
        </section>
      )}

      {/* <SupplementStoreUI /> */}
      {/* Trending Products Section */}
      {trendingProducts.length > 0 && (
        <section className="py-5 md:py-6 my-3 md:my-4 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Headtext text="TRENDING NOW" />
              <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
                Products that are currently trending in the fitness community
              </p>
            </div>

            <FeaturedProducts
              products={trendingProducts}
              isLoading={productsLoading}
              error={error}
            />
          </div>
        </section>
      )}

      {/* New Products Section */}
      {newProducts.length > 0 && (
        <section className="py-5 md:py-6 my-3 md:my-4 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Headtext text="NEW ARRIVALS" />
              <p className="text-gray-600 mt-6 max-w-2xl mx-auto">
                Fresh products just added to our collection
              </p>
            </div>

            <FeaturedProducts
              products={newProducts}
              isLoading={productsLoading}
              error={error}
            />
          </div>
        </section>
      )}
      <BrandCarousel tag="HOT" title="HOT BRANDS" />

      <Image
        src={scratch}
        alt="scratch"
        width={1920}
        height={1080}
        className="object-cover object-center"
      />

      <BenefitsSec />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
}
