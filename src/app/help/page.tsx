import Link from 'next/link';

export default function Help() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col gap-8">
          <Link href="/" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Help & FAQ</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">How do I use dwnld.in?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Simply paste the URL of the file you want to download into the input field and click the Download button. The file will be downloaded to your device.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">What types of files can I download?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Our service supports downloading various file types including videos, music, documents, and more. However, please ensure you have the right to download the content.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Is there a file size limit?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Currently, we support files up to 2GB in size. For larger files, we recommend using alternative download methods.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Is my data secure?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Yes, we take your privacy and security seriously. We do not store your downloaded files, and all downloads are processed securely. For more information, please read our <Link href="/privacy" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">Privacy Policy</Link>.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">What should I do if my download fails?</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  If your download fails, please try the following:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400">
                  <li>Check your internet connection</li>
                  <li>Verify the URL is correct</li>
                  <li>Try again after a few minutes</li>
                  <li>Contact support if the issue persists</li>
                </ul>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mt-8">Contact Support</h2>
            <p className="text-gray-600 dark:text-gray-400">
              If you need further assistance, please contact our support team at:
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Email: support@dwnld.in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 