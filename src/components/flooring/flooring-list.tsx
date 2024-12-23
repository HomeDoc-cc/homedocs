import { type Flooring as PrismaFlooring } from ".prisma/client";

interface FlooringListProps {
  floorings: PrismaFlooring[];
  onEdit: (flooring?: PrismaFlooring) => void;
  onDelete: (flooring: PrismaFlooring) => void;
}

export function FlooringList({ floorings, onEdit, onDelete }: FlooringListProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {floorings.map((flooring) => (
          <li key={flooring.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {flooring.name}
                  </h3>
                  <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Type:</span>
                      <span className="ml-2">{flooring.type}</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Material:</span>
                      <span className="ml-2">{flooring.material}</span>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="font-medium">Brand:</span>
                      <span className="ml-2">{flooring.brand}</span>
                    </div>
                    {flooring.color && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="font-medium">Color:</span>
                        <span className="ml-2">{flooring.color}</span>
                      </div>
                    )}
                    {flooring.pattern && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className="font-medium">Pattern:</span>
                        <span className="ml-2">{flooring.pattern}</span>
                      </div>
                    )}
                  </div>
                  {flooring.notes && (
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Notes:</span>
                      <span className="ml-2">{flooring.notes}</span>
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 flex space-x-4">
                  <button
                    onClick={() => onEdit(flooring)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(flooring)}
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