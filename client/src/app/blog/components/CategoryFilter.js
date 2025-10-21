"use client";

import { useState, useEffect, Suspense } from "react";
import { fetchApi } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function CategoryFilterContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const response = await fetchApi("/content/blog-categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch blog categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleCategoryClick = (slug) => {
    if (slug === activeCategory) {
      // If clicking on the already active category, remove the filter
      router.push(`/blog`);
    } else {
      // Otherwise, apply the filter
      router.push(`/blog?category=${slug}`);
    }
  };

  if (loading || categories.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center flex-wrap gap-2">
        <Button
          variant={activeCategory ? "outline" : "default"}
          size="sm"
          onClick={() => router.push("/blog")}
          className="rounded-full"
        >
          All Posts
        </Button>

        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={activeCategory === category.slug ? "default" : "outline"}
            className="px-3 py-1 text-sm cursor-pointer hover:bg-muted transition-colors"
            onClick={() => handleCategoryClick(category.slug)}
          >
            {category.name}
            {category.postCount > 0 && (
              <span className="ml-1 text-xs opacity-70">
                ({category.postCount})
              </span>
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export default function CategoryFilter() {
  return (
    <Suspense fallback={null}>
      <CategoryFilterContent />
    </Suspense>
  );
}
