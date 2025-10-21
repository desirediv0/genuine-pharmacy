"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchApi } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
  Search,
} from "lucide-react";
import { ClientOnly } from "@/components/client-only";
import { toast } from "sonner";
import CategoriesCarousel from "@/components/catgry";
import ProducCard from "@/components/ProducCard";

// Add ProductCardSkeleton component
function ProductCardSkeleton() {
  return (
    <div className="bg-white overflow-hidden shadow-md rounded-sm animate-pulse">
      <div className="h-64 w-full bg-gray-200"></div>
      <div className="p-4">
        <div className="flex justify-center mb-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-3/4 mx-auto bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-center">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Helper to decode "+" back to space from querystring
  const decodePlus = (str) => (str ? str.replace(/\+/g, " ") : "");
  const searchQuery = decodePlus(searchParams.get("search") || "");
  const categorySlug = searchParams.get("category") || "";
  const flavorId = searchParams.get("flavor") || "";
  const weightId = searchParams.get("weight") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortParam = searchParams.get("sort") || "createdAt";
  const orderParam = searchParams.get("order") || "desc";

  // Determine which section should be open based on URL params
  const getInitialActiveSection = () => {
    if (searchQuery) return "search";
    if (categorySlug) return "categories";
    if (flavorId) return "flavors";
    if (weightId) return "weights";
    return "search";
  };

  const [activeFilterSection, setActiveFilterSection] = useState(
    getInitialActiveSection()
  );

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Initialize selected filters from URL params
  const [selectedFlavors, setSelectedFlavors] = useState(
    flavorId ? [flavorId] : []
  );
  const [selectedWeights, setSelectedWeights] = useState(
    weightId ? [weightId] : []
  );

  const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);

  const [filters, setFilters] = useState({
    search: searchQuery,
    category: categorySlug,
    flavor: flavorId,
    weight: weightId,
    minPrice: minPrice,
    maxPrice: maxPrice,
    sort: sortParam,
    order: orderParam,
  });

  // Local controlled input state for the Search field
  const [searchInput, setSearchInput] = useState(searchQuery);
  useEffect(() => {
    // Keep input in sync if filters.search changes (e.g., via URL or programmatically)
    setSearchInput(filters.search || "");
  }, [filters.search]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Add a state for tracking debug mode
  const [debugMode, setDebugMode] = useState(false);

  // Keep filters in sync with URL when search params change (e.g., navbar search while on products page)
  useEffect(() => {
    const newFiltersFromURL = {
      search: searchQuery,
      category: categorySlug,
      flavor: flavorId,
      weight: weightId,
      minPrice: minPrice,
      maxPrice: maxPrice,
      sort: sortParam,
      order: orderParam,
    };

    const isSame =
      filters.search === newFiltersFromURL.search &&
      filters.category === newFiltersFromURL.category &&
      filters.flavor === newFiltersFromURL.flavor &&
      filters.weight === newFiltersFromURL.weight &&
      String(filters.minPrice || "") === String(newFiltersFromURL.minPrice || "") &&
      String(filters.maxPrice || "") === String(newFiltersFromURL.maxPrice || "") &&
      filters.sort === newFiltersFromURL.sort &&
      filters.order === newFiltersFromURL.order;

    if (!isSame) {
      setFilters(newFiltersFromURL);
      setSelectedFlavors(flavorId ? [flavorId] : []);
      setSelectedWeights(weightId ? [weightId] : []);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [
    searchQuery,
    categorySlug,
    flavorId,
    weightId,
    minPrice,
    maxPrice,
    sortParam,
    orderParam,
  ]);


  // Add function to handle filter section toggle
  const toggleFilterSection = (section) => {
    setActiveFilterSection(activeFilterSection === section ? null : section);
  };

  // Function to update URL with current filters, encoding spaces as "+" instead of %20
  const updateURL = (newFilters) => {
    const pairs = [];
    const add = (k, v) => {
      if (v !== undefined && v !== null && v !== "") {
        const key = encodeURIComponent(k);
        const val = encodeURIComponent(String(v)).replace(/%20/g, "+");
        pairs.push(`${key}=${val}`);
      }
    };

    // Only add parameters that have values
    add("search", newFilters.search);
    add("category", newFilters.category);
    add("flavor", newFilters.flavor);
    add("weight", newFilters.weight);
    add("minPrice", newFilters.minPrice);
    add("maxPrice", newFilters.maxPrice);
    if (newFilters.sort !== "createdAt" || newFilters.order !== "desc") {
      add("sort", newFilters.sort);
      add("order", newFilters.order);
    }

    // Update URL without refreshing the page
    const qs = pairs.join("&");
    const newURL = qs ? `?${qs}` : window.location.pathname;
    router.push(newURL, { scroll: false });
  };

  // Fetch products based on filters useEffect
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query params from filters
        const queryParams = new URLSearchParams();

        queryParams.append("page", pagination.page);
        queryParams.append("limit", pagination.limit);

        // Ensure sort is a valid field in the backend
        const validSortFields = ["createdAt", "updatedAt", "name", "featured"];
        let sortField = filters.sort;

        // Default to createdAt if the sort field is not valid
        if (!validSortFields.includes(sortField)) {
          sortField = "createdAt";
          console.warn(
            `Invalid sort field: ${filters.sort}, using createdAt instead`
          );
        }

        queryParams.append("sort", sortField);
        queryParams.append("order", filters.order);

        // Add other non-variant filters
        if (filters.search) {
          queryParams.append("search", filters.search);
        }
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

        // Add flavor and weight filters individually
        // The server should return any product that has at least one matching flavor OR weight
        if (selectedFlavors.length > 0) {
          queryParams.append("flavor", selectedFlavors[0]);
        }

        if (selectedWeights.length > 0) {
          queryParams.append("weight", selectedWeights[0]);
        }

        const response = await fetchApi(
          `/public/products?${queryParams.toString()}`
        );

        let filteredProducts = response.data.products || [];

        // If both flavor AND weight filters are active, we need to do client-side filtering
        // to ensure we only show products that have variants with BOTH the selected flavor AND weight
        if (
          selectedFlavors.length > 0 &&
          selectedWeights.length > 0 &&
          filteredProducts.length > 0
        ) {
          // For each product, check if it has any variant that matches both flavor and weight
          const productsWithExactMatch = [];

          for (const product of filteredProducts) {
            try {
              // Fetch detailed product info including all variants
              const detailResponse = await fetchApi(
                `/public/products/${product.slug}`
              );
              const detailedProduct = detailResponse.data.product;

              // Check if any variant has both the selected flavor AND weight
              const hasMatchingVariant = detailedProduct.variants.some(
                (variant) =>
                  variant.flavor?.id === selectedFlavors[0] &&
                  variant.weight?.id === selectedWeights[0]
              );

              if (hasMatchingVariant) {
                productsWithExactMatch.push(product);
              }
            } catch (err) {
              console.error(
                `Error fetching details for product ${product.slug}:`,
                err
              );
            }
          }

          // Update the filtered list and pagination count
          filteredProducts = productsWithExactMatch;
          setPagination({
            ...response.data.pagination,
            total: productsWithExactMatch.length,
          });
        } else {
          // Just use the server response directly
          setPagination(response.data.pagination || {});
        }

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    filters,
    pagination.page,
    pagination.limit,
    selectedFlavors,
    selectedWeights,
  ]);

  // Fetch categories, flavors, and weights useEffect
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesRes, flavorsRes, weightsRes] = await Promise.all([
          fetchApi("/public/categories"),
          fetchApi("/public/flavors"),
          fetchApi("/public/weights"),
        ]);

        setCategories(categoriesRes.data.categories || []);
        setFlavors(flavorsRes.data.flavors || []);
        setWeights(weightsRes.data.weights || []);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Add the price range update useEffect


  // Add the fetch max price useEffect
  useEffect(() => {
    const fetchMaxPrice = async () => {
      try {
        const response = await fetchApi("/public/products/max-price");
        const maxPrice = response.data.maxPrice || 1000;
        setMaxPossiblePrice(Math.ceil(maxPrice / 100) * 100); // Round up to nearest hundred
      } catch (err) {
        console.error("Error fetching max price:", err);
        setMaxPossiblePrice(1000); // Default fallback
      }
    };

    fetchMaxPrice();
  }, []);

  // Error notification useEffect
  useEffect(() => {
    if (error) {
      toast.error(`Error loading products. Please try again.`);
    }
  }, [error]);

  // Add useEffect to handle scroll on page change
  useEffect(() => {
    // Wait for the browser to render the new content/layout before scrolling.
    // Using requestAnimationFrame twice (or a short timeout) ensures layout is stable
    // and the smooth scroll reaches the intended position instead of stopping early.
    let raf1 = 0;
    let raf2 = 0;
    let timeoutId = 0;

    const doScroll = () => {
      const mainContent = document.getElementById("products-main");
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    // Try a double rAF first for smoothness
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        // small timeout fallback in case images or fonts shift layout
        timeoutId = window.setTimeout(doScroll, 80);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timeoutId);
    };
  }, [pagination.page]); // This will trigger whenever the page changes

  // Modify handleFilterChange to update URL
  const handleFilterChange = (name, value) => {
    // For number inputs, ensure we're handling empty strings and non-numeric values
    if ((name === "minPrice" || name === "maxPrice") && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return; // Don't update if not a valid number
      }
      value = numValue.toString();
    }

    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    updateURL(newFilters);

    // Reset to page 1 when filters change
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    // Close mobile filters after selecting a filter on mobile
    if (
      mobileFiltersOpen &&
      window.innerWidth < 768 &&
      name !== "minPrice" &&
      name !== "maxPrice" &&
      name !== "search"
    ) {
      setMobileFiltersOpen(false);
    }

    // Open the corresponding section when a filter is applied
    switch (name) {
      case "search":
        if (value) setActiveFilterSection("search");
        break;
      case "category":
        if (value) setActiveFilterSection("categories");
        break;
      case "flavor":
        if (value) setActiveFilterSection("flavors");
        break;
      case "weight":
        if (value) setActiveFilterSection("weights");
        break;
    }
  };

  // Modify handleFlavorChange
  const handleFlavorChange = (flavorId) => {
    const isAlreadySelected = selectedFlavors.includes(flavorId);
    let updatedFlavors;

    if (isAlreadySelected) {
      updatedFlavors = selectedFlavors.filter((id) => id !== flavorId);
      setSelectedFlavors(updatedFlavors);
    } else {
      updatedFlavors = [flavorId];
      setSelectedFlavors(updatedFlavors);
    }

    const newFlavorValue = updatedFlavors.length > 0 ? updatedFlavors[0] : "";
    handleFilterChange("flavor", newFlavorValue);
  };

  // Modify handleWeightChange
  const handleWeightChange = (weightId) => {
    const isAlreadySelected = selectedWeights.includes(weightId);
    let updatedWeights;

    if (isAlreadySelected) {
      updatedWeights = selectedWeights.filter((id) => id !== weightId);
      setSelectedWeights(updatedWeights);
    } else {
      updatedWeights = [weightId];
      setSelectedWeights(updatedWeights);
    }

    const newWeightValue = updatedWeights.length > 0 ? updatedWeights[0] : "";
    handleFilterChange("weight", newWeightValue);
  };

  // Modify clearFilters to also clear URL
  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "",
      flavor: "",
      weight: "",
      minPrice: "",
      maxPrice: "",
      sort: "createdAt",
      order: "desc",
    };
    setFilters(clearedFilters);
    setSelectedFlavors([]);
    setSelectedWeights([]);
    updateURL(clearedFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setActiveFilterSection("search");
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const value = e.target.value;

    switch (value) {
      case "newest":
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "desc");
        break;
      case "oldest":
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "asc");
        break;
      case "price-low":
        // Looking at the backend code, we need to use a field that exists in the product model
        // Using createdAt as a fallback since price doesn't exist on the product model
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "asc");
        break;
      case "price-high":
        // Looking at the backend code, we need to use a field that exists in the product model
        // Using createdAt as a fallback since price doesn't exist on the product model
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "desc");
        break;
      case "name-asc":
        handleFilterChange("sort", "name");
        handleFilterChange("order", "asc");
        break;
      case "name-desc":
        handleFilterChange("sort", "name");
        handleFilterChange("order", "desc");
        break;
      default:
        break;
    }
  };

  // Add this function to handle scrolling
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Update handlePageChange to use the scroll function
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    scrollToTop();
  };


  // Display loading state
  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div id="products-main">
      <div>
        <div className="hidden md:flex mx-auto max-w-7xl">
          <CategoriesCarousel />
        </div>
        {/* Hero Banner - add triple click handler for debug mode */}
        <div
          className="relative w-full h-[280px] mb-10 rounded-lg overflow-hidden"
          onDoubleClick={() => setDebugMode(!debugMode)}
        >
          <Image
            src="/banner-background.jpg"
            alt="Premium Supplements"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center md:pl-12">
            <h1 className="text-xl md:text-5xl font-bold text-white mb-4 md:text-left text-center p-2">
              PREMIUM SUPPLEMENTS
            </h1>
            <p className="text-sm md:text-xl text-white max-w-xl md:text-left text-center">
              Fuel your performance with premium quality supplements
            </p>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="md:hidden flex items-center justify-between mb-6 flex-col md:flex-row">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button
            variant="outline"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2"
          >
            <Filter className="h-5 w-5" />
            Filters
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`md:w-1/4 lg:w-1/5 ${mobileFiltersOpen
              ? "block fixed inset-0 z-50 bg-white p-4 overflow-auto"
              : "hidden"
              } md:block md:static md:z-auto md:bg-transparent md:p-0`}
          >
            <div className="bg-white rounded-lg shadow-sm border sticky top-28">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold uppercase">Filters</h2>
                <div className="flex gap-2">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline flex items-center"
                  >
                    Clear all
                  </button>
                  <button
                    className="md:hidden text-gray-500"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="p-4 border-b">
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleFilterSection("search")}
                >
                  <h3 className="text-sm font-medium uppercase">Search</h3>
                  {activeFilterSection === "search" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFilterSection === "search"
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                    }`}
                >
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleFilterChange("search", searchInput);
                    }}
                    className="relative"
                  >
                    <Input
                      name="search"
                      placeholder="Search products..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full pr-10 border-gray-300"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Categories Filter */}
              <div className="p-4 border-b">
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleFilterSection("categories")}
                >
                  <h3 className="text-sm font-medium uppercase">Categories</h3>
                  {activeFilterSection === "categories" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFilterSection === "categories"
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category.id} className="ml-2">
                        <div
                          className={`cursor-pointer hover:text-primary flex items-center ${filters.category === category.slug
                            ? "font-medium text-primary"
                            : ""
                            }`}
                          onClick={() =>
                            handleFilterChange("category", category.slug)
                          }
                        >
                          <ChevronRight className="h-4 w-4 mr-1" />
                          {category.name}
                        </div>
                        {category.children && category.children.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1">
                            {category.children.map((child) => (
                              <div
                                key={child.id}
                                className={`cursor-pointer hover:text-primary text-sm ${filters.category === child.slug
                                  ? "font-medium text-primary"
                                  : ""
                                  }`}
                                onClick={() =>
                                  handleFilterChange("category", child.slug)
                                }
                              >
                                {child.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Flavors Filter */}
              <div className="p-4 border-b">
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleFilterSection("flavors")}
                >
                  <h3 className="text-sm font-medium uppercase">Flavor</h3>
                  {activeFilterSection === "flavors" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFilterSection === "flavors"
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="space-y-2">
                    {flavors.map((flavor) => (
                      <div
                        key={flavor.id}
                        className={`cursor-pointer hover:text-primary ml-2 flex items-center ${selectedFlavors.includes(flavor.id)
                          ? "font-medium text-primary"
                          : ""
                          }`}
                        onClick={() => handleFlavorChange(flavor.id)}
                      >
                        <div className="w-4 h-4 border border-gray-300 rounded mr-2 flex items-center justify-center">
                          {selectedFlavors.includes(flavor.id) && (
                            <div className="w-2 h-2 rounded-sm bg-primary"></div>
                          )}
                        </div>
                        {flavor.image && (
                          <div className="w-4 h-4 rounded-full overflow-hidden mr-2">
                            <Image
                              src={flavor.image}
                              alt={flavor.name}
                              width={16}
                              height={16}
                            />
                          </div>
                        )}
                        {flavor.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weights Filter */}
              <div className="p-4">
                <div
                  className="flex items-center justify-between mb-2 cursor-pointer"
                  onClick={() => toggleFilterSection("weights")}
                >
                  <h3 className="text-sm font-medium uppercase">Weight</h3>
                  {activeFilterSection === "weights" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${activeFilterSection === "weights"
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="space-y-2">
                    {weights.map((weight) => (
                      <div
                        key={weight.id}
                        className={`cursor-pointer hover:text-primary ml-2 flex items-center ${selectedWeights.includes(weight.id)
                          ? "font-medium text-primary"
                          : ""
                          }`}
                        onClick={() => handleWeightChange(weight.id)}
                      >
                        <div className="w-4 h-4 border border-gray-300 rounded mr-2 flex items-center justify-center">
                          {selectedWeights.includes(weight.id) && (
                            <div className="w-2 h-2 rounded-sm bg-primary"></div>
                          )}
                        </div>
                        {weight.display}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="md:w-3/4 lg:w-4/5">
            {/* Display product count and sort options */}
            <div className="flex justify-between md:justify-end mb-6 items-center md:flex-row flex-col ">
              <div className="text-sm">
                {loading && !products.length ? (
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold">{products.length}</span> of{" "}
                    <span className="font-semibold">
                      {pagination.total || 0}
                    </span>{" "}
                    products
                  </>
                )}
              </div>

              {loading && (
                <div className="text-sm text-gray-500 flex items-center ml-auto mr-4">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              )}

              <div className="inline-flex items-center border rounded-md overflow-hidden bg-white flex-col md:flex-row w-full md:w-auto mt-4 md:mt-0 mx-2">
                <span className="px-3 py-2 text-sm">SORT BY</span>
                <select
                  id="sort"
                  name="sort"
                  className="border-l px-3 py-2 focus:outline-none w-full md:w-auto"
                  onChange={handleSortChange}
                  disabled={loading}
                  value={
                    filters.sort === "createdAt" && filters.order === "desc"
                      ? "newest"
                      : filters.sort === "createdAt" && filters.order === "asc"
                        ? "oldest"
                        : filters.sort === "name" && filters.order === "asc"
                          ? "name-asc"
                          : filters.sort === "name" && filters.order === "desc"
                            ? "name-desc"
                            : "newest"
                  }
                >
                  <option value="newest">Featured</option>
                  <option value="price-low">Price, low to high</option>
                  <option value="price-high">Price, high to low</option>
                  <option value="name-asc">Alphabetically, A-Z</option>
                  <option value="name-desc">Alphabetically, Z-A</option>
                  <option value="oldest">Date, old to new</option>
                </select>
              </div>
            </div>

            {/* Active Filters - Updated for single selection */}
            {(filters.search ||
              filters.category ||
              selectedFlavors.length > 0 ||
              selectedWeights.length > 0 ||
              filters.minPrice ||
              filters.maxPrice) && (
                <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-gray-50 rounded-md border">
                  <span className="text-sm font-medium">Active Filters:</span>

                  {filters.search && (
                    <div className="bg-primary text-white text-xs px-2 py-1 rounded-md flex items-center">
                      <span>Search: {filters.search}</span>
                      <button
                        onClick={() => handleFilterChange("search", "")}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {filters.category && (
                    <div className="bg-primary text-white text-xs px-2 py-1 rounded-md flex items-center">
                      <span>
                        Category:{" "}
                        {categories.find((c) => c.slug === filters.category)
                          ?.name || filters.category}
                      </span>
                      <button
                        onClick={() => handleFilterChange("category", "")}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {selectedFlavors.length > 0 && (
                    <div className="bg-primary text-white text-xs px-2 py-1 rounded-md flex items-center">
                      <span>
                        Flavor:{" "}
                        {flavors.find((f) => f.id === selectedFlavors[0])?.name ||
                          selectedFlavors[0]}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedFlavors([]);
                          handleFilterChange("flavor", "");
                        }}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {selectedWeights.length > 0 && (
                    <div className="bg-primary text-white text-xs px-2 py-1 rounded-md flex items-center">
                      <span>
                        Weight:{" "}
                        {weights.find((w) => w.id === selectedWeights[0])
                          ?.display || selectedWeights[0]}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedWeights([]);
                          handleFilterChange("weight", "");
                        }}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {(filters.minPrice || filters.maxPrice) && (
                    <div className="bg-primary text-white text-xs px-2 py-1 rounded-md flex items-center">
                      <span>
                        Price: {filters.minPrice || "0"} -{" "}
                        {filters.maxPrice || "∞"}
                      </span>
                      <button
                        onClick={() => {
                          handleFilterChange("minPrice", "");
                          handleFilterChange("maxPrice", "");
                        }}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary underline ml-2"
                  >
                    Clear All
                  </button>
                </div>
              )}

            {/* Products Grid with Loading State */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                {[...Array(pagination.limit || 12)].map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center border">
                <div className="text-gray-400 mb-4">
                  <AlertCircle className="h-12 w-12 mx-auto" />
                </div>
                <h2 className="text-xl font-semibold mb-3">
                  No products found
                </h2>

                {/* Custom message based on active filters */}
                {selectedFlavors.length > 0 && selectedWeights.length > 0 ? (
                  <p className="text-gray-600 mb-6">
                    No products match both the selected flavor and weight. Try a
                    different combination or clear one of the filters.
                  </p>
                ) : selectedFlavors.length > 0 ? (
                  <p className="text-gray-600 mb-6">
                    No products available with this flavor. Try selecting a
                    different flavor or clear filters.
                  </p>
                ) : selectedWeights.length > 0 ? (
                  <p className="text-gray-600 mb-6">
                    No products available with this weight. Try selecting a
                    different weight or clear filters.
                  </p>
                ) : filters.minPrice || filters.maxPrice ? (
                  <p className="text-gray-600 mb-6">
                    No products match the selected price range. Try adjusting
                    your price filter.
                  </p>
                ) : (
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search term.
                  </p>
                )}

                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    onClick={clearFilters}
                    className="bg-primary text-white"
                  >
                    Clear All Filters
                  </Button>

                  {/* Show relevant clear buttons based on filters */}
                  {selectedFlavors.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFlavors([]);
                        handleFilterChange("flavor", "");
                      }}
                    >
                      Clear Flavor Filter
                    </Button>
                  )}

                  {selectedWeights.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedWeights([]);
                        handleFilterChange("weight", "");
                      }}
                    >
                      Clear Weight Filter
                    </Button>
                  )}

                  {(filters.minPrice || filters.maxPrice) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleFilterChange("minPrice", "");
                        handleFilterChange("maxPrice", "");
                      }}
                    >
                      Clear Price Filter
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                {loading
                  ? // Show skeleton cards when loading with existing data
                  [...Array(pagination.limit || 12)].map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))
                  : // Show actual products when not loading
                  products.map((product) => (
                    <ProducCard key={product.id} product={product} />
                  ))}
              </div>
            )}

            {/* Restore original pagination UI */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-10 mb-4">
                <div className="inline-flex items-center rounded-md overflow-hidden border divide-x">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="rounded-none border-0 hover:bg-gray-100 hover:text-black"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  </Button>

                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1;
                    // Show first page, last page, and pages around the current page
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 &&
                        page <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`px-3 py-2 text-sm ${pagination.page === page
                            ? "bg-primary text-white"
                            : "hover:bg-gray-100"
                            }`}
                        >
                          {page}
                        </button>
                      );
                    }

                    // Show ellipsis for skipped pages
                    if (
                      (page === 2 && pagination.page > 3) ||
                      (page === pagination.pages - 1 &&
                        pagination.page < pagination.pages - 2)
                    ) {
                      return (
                        <span key={page} className="px-3 py-2">
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                    className="rounded-none border-0 hover:bg-gray-100 hover:text-black"
                  >
                    <ChevronUp className="h-4 w-4 rotate-90" />

                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <ClientOnly
      fallback={
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <ProductsContent />
      </Suspense>
    </ClientOnly>
  );
}
