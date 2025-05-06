import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-[#464E47] hover:opacity-90 transition-opacity">
            Free Time Finder
          </Link>
          <nav className="space-x-4">
            <Link 
              href="/availability" 
              className="text-[#464E47] hover:opacity-90 transition-opacity font-medium"
            >
              Availability
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
} 