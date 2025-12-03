import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About TripBrief - AI Travel Planning Born from Global Experience',
  description:
    'Learn how TripBrief was created by a passionate traveler to solve the repetitive research problem. Discover our mission to help travelers spend more time exploring and less time planning.',
  openGraph: {
    title: 'About TripBrief - AI Travel Planning Born from Global Experience',
    description:
      'Learn how TripBrief was created by a passionate traveler to solve the repetitive research problem.',
    url: 'https://tripbrief.io/about',
  },
}

export default function About() {
  return (
    <div className="min-h-screen bg-swiss-white">
      <main className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto bg-swiss-white border border-swiss-gray-200 rounded-swiss-lg shadow-swiss-md p-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-swiss-black mb-4">About TripBrief</h1>
            <p className="text-xl text-swiss-gray-600">
              Your comprehensive travel companion, born from a passion for exploration
            </p>
          </div>

          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-swiss-black mb-4">The Problem We Solve</h2>
              <p className="text-swiss-gray-700 mb-4">
                Picture this: You&apos;re planning a trip to a new destination, excited to explore,
                but you find yourself bouncing between countless websites, forums, and resources to
                gather all the information you need.
              </p>
              <p className="text-swiss-gray-700 mb-4">
                <em>
                  How do I get around? What&apos;s the best way to pay for transit? Where are the
                  must-see spots? What should I eat? Which neighborhoods should I explore?
                </em>
              </p>
              <p className="text-swiss-gray-700 mb-4">
                These are all great questions that deserve thorough answers! TripBrief was created
                to bring all these essential insights together in one place, giving you
                comprehensive information without the scattered search across multiple sources.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-swiss-black mb-4">Our Mission</h2>
              <div className="bg-swiss-blue bg-opacity-5 p-6 rounded-swiss-lg mb-6 border border-swiss-blue border-opacity-20">
                <p className="text-swiss-gray-800 text-lg italic">
                  &ldquo;To make travel research effortless by consolidating essential destination
                  insights into comprehensive, easy-to-use guides.&rdquo;
                </p>
              </div>
              <p className="text-swiss-gray-700 mb-4">
                Good travel research is invaluable—it opens doors to amazing experiences and helps
                you navigate new places with confidence. The challenge isn&apos;t research itself,
                but having to piece together information from dozens of different sources. We
                believe travel planning should be thorough and enjoyable, not scattered and
                overwhelming.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-swiss-black mb-4">Born from Experience</h2>
              <p className="text-swiss-gray-700 mb-4">
                TripBrief was created by someone who genuinely loves travel research and planning.
                Through various travel experiences— from figuring out subway systems in different
                cities to discovering local food scenes and authentic neighborhoods— a clear pattern
                emerged in how to efficiently gather the most useful information.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Every new destination involved the same systematic approach: understanding
                transportation, identifying key attractions, finding great local spots, and learning
                cultural nuances. Despite all the excellent travel resources available online, there
                was no single place that consolidated this essential research into one comprehensive
                guide.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                That&apos;s where the idea for TripBrief was born—to share this curated research
                approach and create the travel companion that brings everything together in one
                place.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-swiss-black mb-4">
                What Makes TripBrief Different
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-swiss-gray-50 border border-swiss-gray-200 p-6 rounded-swiss-lg">
                  <h3 className="text-lg font-semibold text-swiss-black mb-2">
                    🎯 Comprehensive Coverage
                  </h3>
                  <p className="text-swiss-gray-700 text-sm">
                    One request gets you everything: transportation, attractions, food, culture,
                    practical tips, and local insights.
                  </p>
                </div>
                <div className="bg-swiss-gray-50 border border-swiss-gray-200 p-6 rounded-swiss-lg">
                  <h3 className="text-lg font-semibold text-swiss-black mb-2">
                    ⚡ Instant Results
                  </h3>
                  <p className="text-swiss-gray-700 text-sm">
                    No more bouncing between websites and travel forums. Get your complete brief in
                    seconds, not hours.
                  </p>
                </div>
                <div className="bg-swiss-gray-50 border border-swiss-gray-200 p-6 rounded-swiss-lg">
                  <h3 className="text-lg font-semibold text-swiss-black mb-2">📅 Date-Aware</h3>
                  <p className="text-swiss-gray-700 text-sm">
                    Get information tailored to your specific travel dates, including seasonal
                    events and weather considerations.
                  </p>
                </div>
                <div className="bg-swiss-gray-50 border border-swiss-gray-200 p-6 rounded-swiss-lg">
                  <h3 className="text-lg font-semibold text-swiss-black mb-2">
                    📱 Mobile-Friendly
                  </h3>
                  <p className="text-swiss-gray-700 text-sm">
                    Access your travel brief on any device, with both detailed text and visual
                    cheatsheet formats.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                The Experience We&apos;re Creating
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Imagine landing in a new city and feeling immediately oriented. You know how to get
                from the airport to your accommodation, you understand the local transportation
                system, you have a curated list of must-see attractions and authentic local
                experiences, and you&apos;re aware of any cultural nuances that will help you
                navigate respectfully.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This is the confidence that comes from being prepared—not over-planned, but equipped
                with the essential knowledge that transforms you from a lost tourist into a
                confident explorer. It&apos;s the difference between spending your first day
                figuring things out and spending it actually experiencing your destination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Looking Forward
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                TripBrief is just the beginning. Our vision is to continuously evolve based on
                traveler feedback and real-world usage. We&apos;re committed to making travel
                planning more efficient, more comprehensive, and ultimately more focused on what
                matters most—the experiences waiting for you in each new destination.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Whether you&apos;re a seasoned globetrotter or planning your first international
                adventure, TripBrief is here to help you make the most of every journey. Because
                every destination has stories to tell—we just want to make sure you have more time
                to discover them.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  We&apos;d Love Your Input!
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Have ideas for new features? Suggestions for improvement? Feedback on your travel
                  brief experience? We&apos;re always eager to hear from fellow travelers.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Drop us a line at{' '}
                  <a
                    href="mailto:support@tripbrief.io"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition duration-200"
                  >
                    support@tripbrief.io
                  </a>{' '}
                  — we read every message and your insights help shape the future of TripBrief.
                </p>
              </div>
            </section>

            <div className="text-center mt-8 p-8 bg-swiss-blue bg-opacity-5 border border-swiss-blue border-opacity-20 rounded-swiss-lg">
              <p className="text-swiss-gray-800 text-lg mb-4">Ready to explore with confidence?</p>
              <Link
                href="/"
                className="inline-block px-8 py-4 bg-swiss-blue hover:bg-swiss-blue-dark text-white font-semibold rounded-swiss shadow-swiss-md hover:shadow-swiss-lg transition-all"
              >
                Generate Your First Travel Brief
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
