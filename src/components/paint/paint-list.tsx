'use client';

import { type Paint as PrismaPaint } from '.prisma/client';

interface PaintListProps {
  paints: PrismaPaint[];
  onEdit: (paint?: PrismaPaint) => void;
  onDelete: (paint: PrismaPaint) => void;
}

export function PaintList({ paints, onEdit, onDelete }: PaintListProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {paints.map((paint) => (
          <li key={paint.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">{paint.name}</h3>
                  <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Brand:</span>
                      <span className="ml-2">{paint.brand}</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Color:</span>
                      <span className="ml-2">{paint.color}</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Finish:</span>
                      <span className="ml-2">{paint.finish}</span>
                    </div>
                    {paint.code && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="font-medium">Code:</span>
                        <span className="ml-2">{paint.code}</span>
                      </div>
                    )}
                    {paint.location && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="font-medium">Location:</span>
                        <span className="ml-2">{paint.location}</span>
                      </div>
                    )}
                  </div>
                  {paint.notes && (
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Notes:</span>
                      <span className="ml-2">{paint.notes}</span>
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex space-x-4">
                  <button
                    onClick={() => onEdit(paint)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(paint)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
