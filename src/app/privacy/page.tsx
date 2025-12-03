import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - TripBrief',
  description:
    "Learn how TripBrief protects your privacy. We use cookie-free analytics and don't store personal data. Read our complete privacy policy.",
  robots: {
    index: false,
    follow: true,
  },
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-swiss-white">
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-swiss-white border border-swiss-gray-200 rounded-swiss-lg shadow-swiss-md p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-swiss-black mb-4">Privacy Policy</h1>
            <p className="text-swiss-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-swiss-black mb-4">
                1. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-swiss-black mb-2">Information You Provide</h3>
              <ul className="list-disc pl-6 text-swiss-gray-700 mb-4">
                <li>
                  <strong>Search Queries:</strong> Destinations and travel dates you enter to
                  generate travel briefs
                </li>
                <li>
                  <strong>Email Addresses:</strong> When you voluntarily subscribe to our newsletter
                  or updates
                </li>
                <li>
                  <strong>Contact Information:</strong> If you contact us for support or feedback
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Information Automatically Collected
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>
                  <strong>Analytics Data:</strong> Page views, session data, device information, and
                  general location (via Umami Analytics)
                </li>
                <li>
                  <strong>Usage Patterns:</strong> How you interact with our service, popular
                  destinations searched
                </li>
                <li>
                  <strong>Technical Data:</strong> IP address (for rate limiting), browser type,
                  operating system
                </li>
                <li>
                  <strong>Server Logs:</strong> Request timestamps, response times, and error logs
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>
                  <strong>Service Delivery:</strong> Process your travel brief requests and generate
                  personalized responses
                </li>
                <li>
                  <strong>Rate Limiting:</strong> Prevent service abuse and manage API costs using
                  IP-based tracking
                </li>
                <li>
                  <strong>Analytics:</strong> Understand usage patterns and improve our service
                </li>
                <li>
                  <strong>Email Communications:</strong> Send newsletters, updates, and
                  travel-related content (with your consent)
                </li>
                <li>
                  <strong>Service Improvement:</strong> Analyze popular destinations and optimize
                  our AI responses
                </li>
                <li>
                  <strong>Technical Operations:</strong> Monitor service performance, debug issues,
                  and ensure security
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                3. Data Sharing and Third Parties
              </h2>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Third-Party Services We Use
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>
                  <strong>AI Services:</strong> Your search queries are sent to third-party AI
                  providers to generate travel briefs
                </li>
                <li>
                  <strong>Analytics Providers:</strong> Privacy-focused analytics services that
                  don&apos;t use cookies or track personal data
                </li>
                <li>
                  <strong>Hosting Services:</strong> Web hosting and cloud infrastructure providers
                  (may process technical data)
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Data Sharing Policy
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may
                share aggregated, anonymized data about usage patterns to improve our service or for
                business development purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                4. Data Storage and Security
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>
                  <strong>Data Retention:</strong> Search queries are processed in real-time and not
                  permanently stored
                </li>
                <li>
                  <strong>Rate Limiting Data:</strong> IP-based rate limiting data is temporary and
                  automatically expires
                </li>
                <li>
                  <strong>Email Data:</strong> Newsletter subscriptions are stored securely until
                  you unsubscribe
                </li>
                <li>
                  <strong>Analytics:</strong> Umami analytics data is stored according to their
                  privacy policy
                </li>
                <li>
                  <strong>Security:</strong> We use industry-standard security measures to protect
                  your data
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Your Rights and Choices
              </h2>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>
                  <strong>Email Unsubscribe:</strong> You can unsubscribe from our newsletter at any
                  time
                </li>
                <li>
                  <strong>Data Access:</strong> Request information about data we have collected
                  about you
                </li>
                <li>
                  <strong>Data Deletion:</strong> Request deletion of your personal data (subject to
                  legal requirements)
                </li>
                <li>
                  <strong>Analytics Opt-out:</strong> You can disable analytics by using browser
                  settings or ad blockers
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Cookies and Tracking
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                TripBrief uses minimal tracking technologies:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
                <li>
                  <strong>No Cookies:</strong> Our analytics platforms don&apos;t use cookies
                </li>
                <li>
                  <strong>Local Storage:</strong> May be used for temporary data (like form inputs)
                </li>
                <li>
                  <strong>Session Data:</strong> Temporary data for rate limiting (not persistent)
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Children&apos;s Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                TripBrief is not directed to children under 13. We do not knowingly collect personal
                information from children under 13. If you believe we have collected information
                from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. International Users
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                TripBrief is operated from the United States. If you are using our service from
                outside the US, your information may be transferred to and processed in the United
                States.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Changes to This Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the &ldquo;Last
                updated&rdquo; date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Contact Us
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please
                contact us at: privacy@tripbrief.io
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
