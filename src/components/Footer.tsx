import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">TripBrief</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              AI-powered travel planning companion
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link 
              href="/terms" 
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
            >
              Privacy Policy
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} TripBrief. All rights reserved.
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <strong>Disclaimer:</strong> Travel information is AI-generated and should be verified before making travel decisions. 
            TripBrief is not liable for inaccuracies or changes in travel conditions.
          </p>
        </div>
      </div>
    </footer>
  )
}