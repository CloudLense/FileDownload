import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-col gap-8">
          <Link href="/" className="text-accent hover:underline">
            ← Back to Home
          </Link>
          
          <h1 className="font-display text-5xl font-bold tracking-tight [font-stretch:85%] text-ink">Privacy Policy</h1>
          
          <div className="max-w-prose leading-relaxed">
            <p className="text-muted">Last updated: 5/1/2025</p>

            <h2 className="text-2xl font-semibold text-ink mt-8">1. Introduction</h2>
            <p className="text-muted">
              Welcome to dwnld.in. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-semibold text-ink mt-8">2. Information We Collect</h2>
            <p className="text-muted">
              We collect and process the following data about you:
            </p>
            <ul className="list-disc pl-6 text-muted">
              <li>URLs you submit for downloading</li>
              <li>IP address and browser information</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2 className="text-2xl font-semibold text-ink mt-8">3. How We Use Your Information</h2>
            <p className="text-muted">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted">
              <li>Process your download requests</li>
              <li>Improve our service</li>
              <li>Analyze usage patterns</li>
              <li>Ensure security and prevent abuse</li>
            </ul>

            <h2 className="text-2xl font-semibold text-ink mt-8">4. Data Security</h2>
            <p className="text-muted">
              We implement appropriate security measures to protect your personal data from unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-2xl font-semibold text-ink mt-8">5. Your Rights</h2>
            <p className="text-muted">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted">
              <li>Access your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request deletion of your personal data</li>
              <li>Object to processing of your personal data</li>
            </ul>

            <h2 className="text-2xl font-semibold text-ink mt-8">6. Contact Us</h2>
            <p className="text-muted">
              If you have any questions about this privacy policy or our data practices, please contact us at:
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