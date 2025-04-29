import Link from 'next/link';
import getDentists from '@/libs/getDentists';
import DentistCatalog from '@/components/DentistCatalog';
import { Suspense } from 'react';
import TopMenu from '@/components/TopMenu';

export default function Dentist() {
  const dentists = getDentists();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <TopMenu />
      
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Dentists</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link> / <span>Dentists</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Get to know our</h2>
        <p className="text-3xl font-bold text-[#4AA3BA]">skilled dental professionals</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <Suspense fallback={<p className="text-center">Loading...</p>}>
          <DentistCatalog dentistsJson={dentists} />
        </Suspense>
      </div>
    </div>
  );
}