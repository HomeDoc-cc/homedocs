'use client';

import { Combobox } from '@headlessui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useBrands } from '@/hooks/useBrands';

import { type Paint as PrismaPaint } from '.prisma/client';

interface ColorData {
  code: string;
  name: string;
  brand: string;
  hex: string;
  rgbR: number;
  rgbG: number;
  rgbB: number;
}

interface PaintFormData {
  location: string;
  brand: string;
  color: string;
  finish: string;
  code: string;
  notes: string;
}

interface PaintFormProps {
  onSubmit: (data: PaintFormData) => void;
  onCancel: () => void;
  paint?: PrismaPaint | null;
}

export function PaintForm({ onSubmit, onCancel, paint }: PaintFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaintFormData>({
    defaultValues: {
      location: '',
      brand: '',
      color: '',
      finish: '',
      code: '',
      notes: '',
    },
  });

  const { data: brands = [], isLoading: isBrandsLoading } = useBrands();
  const [colorPreview, setColorPreview] = useState<ColorData | null>(null);
  const [brandQuery, setBrandQuery] = useState('');
  const code = watch('code');
  const brand = watch('brand') || '';

  const filteredBrands =
    brandQuery === ''
      ? brands
      : brands.filter((brand) => brand.toLowerCase().includes(brandQuery.toLowerCase()));

  useEffect(() => {
    if (paint) {
      reset({
        location: paint.location || '',
        brand: paint.brand || '',
        color: paint.color || '',
        finish: paint.finish || '',
        code: paint.code || '',
        notes: paint.notes || '',
      });
      setBrandQuery(paint.brand || '');
    } else {
      reset({
        location: '',
        brand: '',
        color: '',
        finish: '',
        code: '',
        notes: '',
      });
      setBrandQuery('');
    }
  }, [paint, reset]);

  useEffect(() => {
    // Function to fetch color data
    const fetchColorData = async (colorCode: string) => {
      console.log('Fetching color data for:', colorCode);
      try {
        const response = await fetch(`/api/colors/${colorCode}`);
        console.log('API response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Color data received:', data);
          // Transform the data to match ColorData interface
          const colorData: ColorData = {
            code: data.code,
            name: data.name,
            brand: data.brand,
            hex: data.hex,
            rgbR: data.rgb.r,
            rgbG: data.rgb.g,
            rgbB: data.rgb.b,
          };
          setColorPreview(colorData);

          // Auto-fill brand and color name if they're empty
          const currentBrand = watch('brand');

          // Always fill in the color name when we get a match
          setValue('color', colorData.name, { shouldValidate: true });

          // Only fill in brand if it's empty
          if (!currentBrand) {
            setValue('brand', colorData.brand, { shouldValidate: true });
            setBrandQuery(colorData.brand);
          }
        } else {
          console.log('API error:', await response.text());
          setColorPreview(null);
        }
      } catch (error) {
        console.error('Failed to fetch color data:', error);
        setColorPreview(null);
      }
    };

    const trimmedCode = code?.trim() || '';
    console.log('Current code:', trimmedCode);

    if (trimmedCode) {
      void fetchColorData(trimmedCode);
    } else {
      setColorPreview(null);
    }
  }, [code, setValue, watch]);

  const handleFormSubmit = async (data: PaintFormData) => {
    try {
      await onSubmit(data);
      // Only reset form after successful submission
      reset();
      setBrandQuery('');
    } catch (error) {
      console.error('Failed to submit paint form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Location
            </label>
            <input
              type="text"
              {...register('location', { required: true })}
              placeholder="e.g., Walls, Trim, Ceiling"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white sm:text-sm"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Location is required</p>
            )}
          </div>

          <div>
            <label
              htmlFor="brand"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Brand
            </label>
            <div className="relative mt-1">
              <Combobox
                value={brand}
                onChange={(value: string) => {
                  if (value) {
                    setValue('brand', value, { shouldValidate: true });
                    setBrandQuery(value);
                  }
                }}
                disabled={isBrandsLoading}
              >
                <div className="relative">
                  <Combobox.Input
                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white sm:text-sm"
                    placeholder="e.g., Sherwin-Williams"
                    displayValue={(value: string) => value}
                    onChange={(event) => setBrandQuery(event.target.value)}
                  />
                  <input type="hidden" {...register('brand', { required: true })} />
                </div>
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {filteredBrands.map((brand) => (
                    <Combobox.Option
                      key={brand}
                      value={brand}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-3 pr-9 ${
                          active ? 'bg-blue-600 text-white' : 'text-gray-900 dark:text-white'
                        }`
                      }
                    >
                      {brand}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </Combobox>
            </div>
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Brand is required</p>
            )}
          </div>

          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Code
            </label>
            <div className="relative mt-1 space-y-2">
              <input
                type="text"
                id="code"
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white sm:text-sm"
                placeholder="e.g., SW 7029"
                {...register('code')}
              />
              {colorPreview && (
                <div className="relative h-32 w-full rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                  <div className="absolute inset-0" style={{ backgroundColor: colorPreview.hex }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="px-3 py-1 text-sm font-medium bg-black/30 text-white rounded">
                      {colorPreview.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="color"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Color
            </label>
            <input
              type="text"
              {...register('color', { required: true })}
              placeholder="e.g., Agreeable Gray"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white sm:text-sm"
            />
            {errors.color && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Color is required</p>
            )}
          </div>

          <div>
            <label
              htmlFor="finish"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Finish
            </label>
            <input
              type="text"
              {...register('finish', { required: false })}
              placeholder="e.g., Eggshell"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white sm:text-sm"
            />
            {errors.finish && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">Finish is required</p>
            )}
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Notes
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Supports markdown: **bold**, *italic*, - lists, etc.)
              </span>
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder={`Example:
**Specifications:**
- Base: ProMar 200
- Coverage: 2 coats needed
- Primer: Not required on previously painted surfaces

*Note: Keep extra paint in garage for touch-ups*`}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:text-white sm:text-sm font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  );
}
