'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { z } from 'zod';

interface ShareHomeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  homeId: string;
  onShare?: () => void;
}

const shareSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['READ', 'WRITE'], {
    invalid_type_error: 'Please select a valid role',
  }),
});

type ShareFormData = z.infer<typeof shareSchema>;

export function ShareHomeDialog({ isOpen, onClose, homeId, onShare }: ShareHomeDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'READ' | 'WRITE'>('READ');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setShowResend(false);

    try {
      // Validate form data
      const formData: ShareFormData = {
        email,
        role,
      };
      shareSchema.parse(formData);

      setIsLoading(true);

      const response = await fetch(`/api/homes/${homeId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage: string;
        
        try {
          const data = JSON.parse(text);
          errorMessage = data.error;
          
          // Show resend option if there's a pending invite
          if (errorMessage === 'Pending invitation already exists for this email') {
            setShowResend(true);
          }
        } catch {
          errorMessage = text || 'Failed to share home';
        }
        
        throw new Error(errorMessage);
      }

      onShare?.();
      onClose();
      setEmail('');
      setRole('READ');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setValidationErrors(errors);
      } else {
        setError(error instanceof Error ? error.message : 'Failed to share home');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/homes/${homeId}/share/resend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend invitation');
      }

      onShare?.();
      onClose();
      setEmail('');
      setRole('READ');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to resend invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setValidationErrors({});
    setEmail('');
    setRole('READ');
    setShowResend(false);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Share Home
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                          ${validationErrors.email 
                            ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                          }
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400
                        `}
                        placeholder="Enter email address"
                        required
                        disabled={isLoading}
                      />
                      {validationErrors.email && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {validationErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Access level
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'READ' | 'WRITE')}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                          ${validationErrors.role 
                            ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                          }
                          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                          disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400
                        `}
                        disabled={isLoading}
                      >
                        <option value="READ">Read only</option>
                        <option value="WRITE">Can edit</option>
                      </select>
                      {validationErrors.role && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {validationErrors.role}
                        </p>
                      )}
                    </div>

                    {error && (
                      <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-900">
                        <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
                        {showResend && (
                          <button
                            type="button"
                            onClick={handleResend}
                            disabled={isLoading}
                            className="mt-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            Resend invitation
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-gray-800"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-blue-600 dark:disabled:hover:bg-blue-500"
                      >
                        {isLoading ? 'Sharing...' : 'Share'}
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
