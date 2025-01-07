'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { ImageModal } from './image-modal';

interface ImageGalleryProps {
  images: string[];
  homeId: string;
  className?: string;
}

interface ImageUrlCache {
  url: string;
  thumbnailUrl: string;
  expiry: number;
}

export function ImageGallery({ images, homeId, className = '' }: ImageGalleryProps) {
  const [imageUrls, setImageUrls] = useState<Record<string, ImageUrlCache>>({});
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch signed URLs for all images
  useEffect(() => {
    async function fetchUrls() {
      const now = Date.now();
      const urls: Record<string, ImageUrlCache> = {};
      const keysToFetch = images.filter(
        (key) =>
          key && !failedUrls.includes(key) && (!imageUrls[key] || imageUrls[key].expiry < now)
      );

      if (keysToFetch.length === 0) return;

      try {
        // Batch fetch URLs
        const responses = await Promise.all(
          keysToFetch.map((key) =>
            fetch(
              `/api/upload/url?key=${encodeURIComponent(key)}&homeId=${encodeURIComponent(homeId)}`
            ).then((r) => r.json())
          )
        );

        responses.forEach((response, index) => {
          const key = keysToFetch[index];
          if (response.url) {
            urls[key] = {
              url: response.url,
              thumbnailUrl: response.thumbnailUrl || response.url,
              expiry: now + 45 * 60 * 1000, // 45 minutes
            };
          } else {
            // If we get a response but no URL, mark as failed
            setFailedUrls((prev) => [...prev, key]);
          }
        });

        setImageUrls((prev) => ({ ...prev, ...urls }));
      } catch (error) {
        console.error('Error fetching URLs:', error);
        // Mark all keys in this batch as failed
        setFailedUrls((prev) => [...prev, ...keysToFetch]);
      }
    }

    fetchUrls();
  }, [images, imageUrls, refreshKey, homeId, failedUrls]);

  // Refresh URLs periodically (every 45 minutes to be safe with 1-hour expiration)
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      // Only refresh if there are URLs that will expire soon
      if (Object.values(imageUrls).some((cache) => cache.expiry - now < 5 * 60 * 1000)) {
        setRefreshKey((key) => key + 1);
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [images.length, imageUrls]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {images.filter(Boolean).map((key, index) => (
          <div key={`${key}-${index}`} className="relative aspect-square">
            {imageUrls[key] ? (
              <button
                type="button"
                onClick={() => setSelectedImage(imageUrls[key].url)}
                className="group relative w-full h-full"
              >
                <Image
                  src={imageUrls[key].thumbnailUrl}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg transition-opacity group-hover:opacity-75"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={index < 4}
                  loading={index >= 4 ? 'lazy' : undefined}
                  blurDataURL={imageUrls[key].thumbnailUrl}
                  placeholder="blur"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                    View
                  </span>
                </div>
              </button>
            ) : failedUrls.includes(key) ? (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Failed to load image</span>
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Loading...</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
      />
    </div>
  );
}
