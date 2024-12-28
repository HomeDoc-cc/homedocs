'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ImageUploadProps {
  images: string[]; // These are now storage keys, not URLs
  onImagesChange: (images: string[]) => void;
  className?: string;
}

export function ImageUpload({ images, onImagesChange, className = '' }: ImageUploadProps) {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch signed URLs for all images
  useEffect(() => {
    async function fetchUrls() {
      const urls: Record<string, string> = {};
      for (const key of images) {
        if (!key) continue; // Skip undefined keys
        try {
          const response = await fetch(`/api/upload/url?key=${encodeURIComponent(key)}`);
          if (response.ok) {
            const { url } = await response.json();
            urls[key] = url;
          }
        } catch (error) {
          console.error('Error fetching URL:', error);
        }
      }
      setImageUrls(prev => ({ ...prev, ...urls }));
    }

    if (images.some(key => key && !imageUrls[key])) {
      fetchUrls();
    }
  }, [images, refreshKey]);

  // Refresh URLs periodically (every 45 minutes to be safe with 1-hour expiration)
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setRefreshKey(key => key + 1);
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [images.length]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files?.length) return;

    setUploadingImages(true);
    setError(null);
    const newImages: string[] = [];

    try {
      for (const file of Array.from(event.target.files)) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload image');
        }

        if (!data.key) {
          throw new Error('No key returned from upload');
        }
        newImages.push(data.key);
      }

      onImagesChange([...images.filter(Boolean), ...newImages]);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  }

  async function handleImageDelete(key: string, index: number) {
    if (!key) return; // Skip if key is undefined

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete image');
      }

      onImagesChange(images.filter((_, i) => i !== index));
      setImageUrls(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete image');
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Images
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        disabled={uploadingImages}
        className="block w-full text-sm text-gray-500 dark:text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-medium
          file:bg-blue-50 file:text-blue-700
          dark:file:bg-blue-900 dark:file:text-blue-300
          hover:file:bg-blue-100 dark:hover:file:bg-blue-800"
      />
      {uploadingImages && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Uploading images...</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.filter(Boolean).map((key, index) => (
            <div key={`${key}-${index}`} className="relative aspect-square">
              {imageUrls[key] ? (
                <Image
                  src={imageUrls[key]}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">Loading...</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleImageDelete(key, index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
