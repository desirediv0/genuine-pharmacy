"use client";

import { useEffect, useState, Suspense } from "react";
import { fetchApi } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import CategoryFilter from "./components/CategoryFilter";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
  if (!image) return "/images/blog-placeholder.png";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

function BlogContent() {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");

  useEffect(() => {
    async function fetchBlogPosts() {
      setLoading(true);
      try {
        // Add category to the query if it exists
        let url = `/content/blog?page=${page}&limit=9`;
        if (categorySlug) {
          url += `&category=${categorySlug}`;
        }
        const response = await fetchApi(url);
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Failed to fetch blog posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogPosts();
  }, [page, categorySlug]);

  return (
    <>
      {/* Show current category as a title if filtering */}
      {categorySlug && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">
            Category: <span className="text-primary">{categorySlug}</span>
          </h2>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <Skeleton className="w-full h-60" />
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : posts?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative h-60 w-full">
                    <Image
                      src={getImageUrl(post.coverImage)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="mr-3">{formatDate(post.createdAt)}</span>
                    {post.categories?.length > 0 && (
                      <span>{post.categories[0].name}</span>
                    )}
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-bold mb-3 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.summary}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="link" className="px-0 text-primary">
                      Read More
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4"
                >
                  Previous
                </Button>
                {[...Array(pagination.totalPages)].map((_, index) => (
                  <Button
                    key={index}
                    variant={page === index + 1 ? "default" : "outline"}
                    onClick={() => setPage(index + 1)}
                    className="px-4"
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No blog posts found</h2>
          {categorySlug ? (
            <p className="text-gray-600 mb-4">
              There are no posts in this category yet.
            </p>
          ) : (
            <p className="text-gray-600">Check back soon for new articles!</p>
          )}
          {categorySlug && (
            <Button onClick={() => (window.location.href = "/blog")}>
              View All Posts
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Blog</h1>
        <p className="text-gray-600">
          Latest news, tips, and insights from the world of supplements and
          fitness
        </p>
      </div>

      {/* Add the category filter component */}
      <CategoryFilter />

      {/* Wrap the content that uses useSearchParams in Suspense */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <Skeleton className="w-full h-60" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-6" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <BlogContent />
      </Suspense>
    </main>
  );
}
