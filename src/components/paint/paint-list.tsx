'use client';

import { useColor } from '@/hooks/useColor';

import { type Paint as PrismaPaint } from '.prisma/client';

interface PaintWithRoom extends PrismaPaint {
  room?: {
    name: string;
  } | null;
}

interface PaintListProps {
  paints: PaintWithRoom[];
  onEdit: (paint?: PrismaPaint) => void;
  onDelete: (paint: PrismaPaint) => void;
  roomName?: string;
}

function PaintItem({
  paint,
  onEdit,
  onDelete,
}: { paint: PaintWithRoom } & Pick<PaintListProps, 'onEdit' | 'onDelete'>) {
  const { data: colorData } = useColor(paint.code);

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            {colorData && (
              <div
                className="h-24 w-24 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden flex-shrink-0"
                style={{ backgroundColor: colorData.hex }}
              >
                <div className="h-full w-full flex items-end justify-center p-2">
                  <span className="px-2 py-1 text-xs font-medium bg-black/30 text-white rounded truncate max-w-full">
                    {colorData.name}
                  </span>
                </div>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {paint.location}
                </h3>
                {paint.room && (
                  <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-200">
                    {paint.room.name}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Brand:</span>
                  <span className="ml-2">{paint.brand}</span>
                </div>
                {paint.code && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Code:</span>
                    <span className="ml-2">{paint.code}</span>
                  </div>
                )}
                {!colorData && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Color:</span>
                    <span className="ml-2">{paint.color}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Finish:</span>
                  <span className="ml-2">{paint.finish}</span>
                </div>
              </div>
              {paint.notes && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Notes:</span>
                  <span className="ml-2">{paint.notes}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex space-x-4">
          <button
            onClick={() => onEdit(paint)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(paint)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function PaintList({ paints, onEdit, onDelete, roomName }: PaintListProps) {
  // Separate paints into room-specific and whole-home
  const roomPaints = paints.filter((paint) => paint.roomId);
  const homePaints = paints.filter((paint) => !paint.roomId);

  return (
    <div className="space-y-8">
      {roomPaints.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {roomName ? `${roomName} Paints` : 'Room Paints'}
          </h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {roomPaints.map((paint) => (
                <li key={paint.id}>
                  <PaintItem paint={paint} onEdit={onEdit} onDelete={onDelete} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {homePaints.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Whole Home Paints
          </h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {homePaints.map((paint) => (
                <li key={paint.id}>
                  <PaintItem paint={paint} onEdit={onEdit} onDelete={onDelete} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {paints.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 shadow sm:rounded-md">
          <p className="text-gray-500 dark:text-gray-400">No paints found</p>
        </div>
      )}
    </div>
  );
}
