"use client";

import { Paint } from "@/types/prisma";

interface PaintCardProps {
  paint: Paint;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PaintCard({ paint, onEdit, onDelete }: PaintCardProps) {
  return (
    <div className="bg-white shadow rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{paint.name}</h3>
          <p className="text-sm text-gray-500">{paint.brand}</p>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-gray-400 hover:text-red-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Color</p>
          <p className="mt-1">{paint.color}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Finish</p>
          <p className="mt-1">{paint.finish}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Location</p>
          <p className="mt-1">{paint.location}</p>
        </div>
        {paint.code && (
          <div>
            <p className="text-sm font-medium text-gray-500">Paint Code</p>
            <p className="mt-1">{paint.code}</p>
          </div>
        )}
      </div>

      {paint.notes && (
        <div>
          <p className="text-sm font-medium text-gray-500">Notes</p>
          <p className="mt-1 text-sm text-gray-600">{paint.notes}</p>
        </div>
      )}
    </div>
  );
} 