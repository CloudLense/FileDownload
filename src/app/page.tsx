'use client';

import { useState } from 'react';
import AnimatedText from '@/components/AnimatedText';
import Link from 'next/link';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the API route with the URL as a query parameter
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download file');
      }

      // Get filename from headers
      let filename = 'downloaded-file';
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match) filename = match[1];
      }

      // Create blob from response
      const blob = await response.blob();

      // Create download link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setUrl('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to download file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center gap-8">
          <AnimatedText />
          
          <form onSubmit={handleSubmit} className="w-full max-w-lg">
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to download"
                className="w-full px-6 py-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                required
              />
              <button 
                type="submit"
                disabled={isLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 rounded-lg transition-all duration-200 ${
                  isLoading 
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
                } text-white font-medium shadow-lg hover:shadow-xl`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </span>
                ) : (
                  'Download'
                )}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-red-500 text-sm">{error}</p>
            )}
          </form>

          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p>🎶 Just drop the link above, hit download, and your favorite music or video will be ready to save — easy peasy, no tech skills needed! 📂✨</p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Fast & Easy</h3>
              <p className="text-gray-600 dark:text-gray-400">Download files in seconds with our simple interface. No complicated steps required.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure</h3>
              <p className="text-gray-600 dark:text-gray-400">Your downloads are processed securely. We don&apos;t store your files or personal data.</p>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Free</h3>
              <p className="text-gray-600 dark:text-gray-400">Use our service completely free of charge. No hidden fees or subscriptions.</p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link href="/help" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
              Help & FAQ
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/privacy" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
              Privacy Policy
            </Link>
            <span className="text-gray-400">•</span>
            <Link href="/terms" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
