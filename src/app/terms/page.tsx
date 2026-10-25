import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col gap-8">
          <Link href="/" className="text-accent hover:underline">
            ← Back to Home
          </Link>
          
          <h1 className="font-display text-5xl font-bold tracking-tight [font-stretch:85%] text-ink">Terms of Service</h1>
          
          <div className="max-w-prose leading-relaxed">
            <p className="text-muted">Last updated: 5/1/2025</p>

            <h2 className="text-2xl font-semibold text-ink mt-8">1. Acceptance of Terms</h2>
            <p className="text-muted">
              By accessing and using dwnld.in, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-semibold text-ink mt-8">2. Description of Service</h2>
            <p className="text-muted">
              dwnld.in provides a service that allows users to download files from various sources. The service is provided &quot;as is&quot; and we make no representations or warranties of any kind.
            </p>

            <h2 className="text-2xl font-semibold text-ink mt-8">3. User Responsibilities</h2>
            <p className="text-muted">
              As a user of this service, you agree to:
            </p>
            <ul className="list-disc pl-6 text-muted">
              <li>Use the service only for lawful purposes</li>
              <li>Not violate any intellectual property rights</li>
              <li>Not use the service to download copyrighted material without permission</li>
              <li>Not use the service for any illegal activities</li>
            </ul>

            <h2 className="text-2xl font-semibold text-ink mt-8">4. Limitation of Liability</h2>
            <p className="text-muted">
              dwnld.in shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
            </p>

            <h2 className="text-2xl font-semibold text-ink mt-8">5. Changes to Terms</h2>
            <p className="text-muted">
              We reserve the right to modify these terms at any time. We will notify users of any changes by updating the &quot;Last updated&quot; date of these terms.
            </p>

            <h2 className="text-2xl font-semibold text-ink mt-8">6. Contact Information</h2>
            <p className="text-muted">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted">
              Email: support@dwnld.in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 