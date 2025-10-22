"use client";

import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
  if (!image) return "/images/blog-placeholder.png";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export default function BlogPostClient({ post, relatedPosts }) {
  const [loading] = useState(!post);
  const [postData] = useState(post);
  const [relatedPostsData] = useState(relatedPosts);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-5 w-1/2 mb-8" />
          <Skeleton className="w-full h-[400px] mb-10 rounded-lg" />
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="mb-8 text-gray-600">
          The blog post you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link href="/blog">
          <Button>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="pt-12 pb-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back to blog link */}
          <Link
            href="/blog"
            className="inline-flex items-center text-primary mb-8 hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Blog
          </Link>

          {/* Post header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-500">
              <time dateTime={postData.createdAt}>
                {formatDate(postData.createdAt)}
              </time>
              <span>•</span>
              {postData.categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog?category=${category.slug}`}
                  className="text-primary hover:underline"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {postData.title}
            </h1>
            {postData.summary && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {postData.summary}
              </p>
            )}
          </header>

          {/* Featured image */}
          {postData.coverImage && (
            <div className="relative w-full h-[400px] md:h-[500px] mb-10 rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(postData.coverImage)}
                alt={postData.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 768px, 1024px"
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Post content */}
          <div
            className="prose prose-lg max-w-none mb-16"
            dangerouslySetInnerHTML={{ __html: postData.content }}
          />

          {/* Related posts */}
          {relatedPostsData.length > 0 && (
            <div className="border-t pt-12">
              <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPostsData.map((relatedPost) => (
                  <article
                    key={relatedPost.id}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <Link href={`/blog/${relatedPost.slug}`} className="block">
                      <div className="relative h-48 w-full">
                        <Image
                          src={getImageUrl(relatedPost.coverImage)}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                          className="object-cover"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <div className="text-xs text-gray-500 mb-1">
                        {formatDate(relatedPost.createdAt)}
                      </div>
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <h3 className="font-bold hover:text-primary transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {relatedPost.summary}
                      </p>
                      <Link href={`/blog/${relatedPost.slug}`}>
                        <Button
                          variant="link"
                          className="px-0 text-primary text-sm"
                        >
                          Read More
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
