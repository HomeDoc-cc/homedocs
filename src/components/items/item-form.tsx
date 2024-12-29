import { useState } from 'react';

import { ImageUpload } from '@/components/image-upload';

export interface ItemFormData {
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyUntil?: string;
  manualUrl?: string;
  images: string[];
}

interface ItemFormProps {
  initialData?: Partial<ItemFormData>;
  onSubmit: (data: ItemFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function ItemForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Create Item',
  isLoading = false,
}: ItemFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [formData, setFormData] = useState<ItemFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    manufacturer: initialData?.manufacturer || '',
    modelNumber: initialData?.modelNumber || '',
    serialNumber: initialData?.serialNumber || '',
    purchaseDate: initialData?.purchaseDate
      ? new Date(initialData.purchaseDate).toISOString().split('T')[0]
      : '',
    warrantyUntil: initialData?.warrantyUntil
      ? new Date(initialData.warrantyUntil).toISOString().split('T')[0]
      : '',
    manualUrl: initialData?.manualUrl || '',
    images: initialData?.images || [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const data: ItemFormData = {
      ...formData,
      images,
    };

    try {
      await onSubmit(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Item Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., Living Room Sofa"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
            (Supports markdown: **bold**, *italic*, - lists, etc.)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white font-mono"
          placeholder={`Example:
**Specifications:**
- Dimensions: 24" x 36"
- Material: Oak
- Finish: Natural

Visit https://example.com for more info`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Furniture"
          />
        </div>

        <div>
          <label
            htmlFor="manufacturer"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Manufacturer
          </label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., IKEA"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="modelNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Model Number
          </label>
          <input
            type="text"
            id="modelNumber"
            name="modelNumber"
            value={formData.modelNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., XYZ-123"
          />
        </div>

        <div>
          <label
            htmlFor="serialNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Serial Number
          </label>
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            value={formData.serialNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., SN123456789"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="purchaseDate"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label
            htmlFor="warrantyUntil"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Warranty Until
          </label>
          <input
            type="date"
            id="warrantyUntil"
            name="warrantyUntil"
            value={formData.warrantyUntil}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="manualUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Manual URL
        </label>
        <input
          type="url"
          id="manualUrl"
          name="manualUrl"
          value={formData.manualUrl}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="e.g., https://manufacturer.com/manual.pdf"
        />
      </div>

      <ImageUpload images={images} onImagesChange={setImages} />

      {error && <div className="text-red-500 text-sm text-center">{error}</div>}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
