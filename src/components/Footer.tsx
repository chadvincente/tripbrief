import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-swiss-white border-t border-swiss-gray-200 mt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold text-swiss-black">TripBrief</h3>
            <p className="text-sm text-swiss-gray-600 mt-1">AI-powered travel planning companion</p>
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-8">
            <Link
              href="/about"
              className="text-sm text-swiss-gray-600 hover:text-swiss-blue transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/terms"
              className="text-sm text-swiss-gray-600 hover:text-swiss-blue transition-colors font-medium"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-swiss-gray-600 hover:text-swiss-blue transition-colors font-medium"
            >
              Privacy Policy
            </Link>
            <div className="text-sm text-swiss-gray-500">
              © {new Date().getFullYear()} TripBrief
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-swiss-gray-200">
          <p className="text-xs text-swiss-gray-500 text-center leading-relaxed">
            <span className="font-semibold">Disclaimer:</span> Travel information is AI-generated
            and should be verified before making travel decisions. TripBrief is not liable for
            inaccuracies or changes in travel conditions.
          </p>
        </div>
      </div>
    </footer>
  )
}
