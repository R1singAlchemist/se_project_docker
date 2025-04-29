'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import getUserProfile from '@/libs/getUserProfile';

export default function TopMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRole() {
      if (session?.user?.token) {
        try {
          const userProfile = await getUserProfile(session.user.token);
          if (userProfile.data?.role) {
            setUserRole(userProfile.data.role);
            setUserId(userProfile.data.dentist_id);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    }

    fetchUserRole();
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  // This function will handle clicking the Manage link and force a full page reload
  const handleManageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use window.location.href to force a full page reload
    window.location.href = '/manage';
  };

  // This function will handle clicking the Dentists link and force a full page reload
  const handleDentistsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Use window.location.href to force a full page reload
    window.location.href = '/dentist';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-300">
      {/* Top contact bar */}
      <div className="bg-[#4AA3BA] text-white py-3 px-6 flex justify-between">
        <div className="flex space-x-6">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm">095-000-0000</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">dentistBook@gmail.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">Patumwan, Bangkok, TH, Bangkok Thailand</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="#" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
            </svg>
          </Link>
          <Link href="#" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </Link>
          <Link href="#" aria-label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Main navigation */}
      <div className="h-[80px] flex flex-row items-center justify-between px-6">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <div className="bg-[#4AA3BA] p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="ml-2 text-2xl font-bold">DentalBook</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-row items-center space-x-8 md:space-x-24">
          <Link href="/" className="text-black hover:text-gray-600 font-semibold text-lg">
            Home
          </Link>

          {userRole === 'dentist' ? (
            <>
              <Link href={`/schedule?did=${userId}`} className="text-black hover:text-gray-600 font-semibold text-lg">
                Schedule
              </Link>
              <Link href="/appointment" className="text-black hover:text-gray-600 font-semibold text-lg">
                Appointments
              </Link>
            </>
          ) : (
            <>
              <Link href="/booking" className="text-black hover:text-gray-600 font-semibold text-lg">
                Bookings
              </Link>
              <Link href="/bookingHistory" className="text-black hover:text-gray-600 font-semibold text-lg">
                Booking History
              </Link>
            </>
          )}
          
          {/* Use anchor tag with click handler for Dentists to force reload */}
          <a 
            href="/dentist" 
            onClick={handleDentistsClick}
            className="text-black hover:text-gray-600 font-semibold text-lg cursor-pointer"
          >
            Dentists
          </a>
          
          {/* Show Manage link for all roles EXCEPT dentist */}
          {session?.user?.token && userRole !== 'dentist' && (
            <a 
              href="/manage" 
              onClick={handleManageClick}
              className="text-black hover:text-gray-600 font-semibold text-lg cursor-pointer"
            >
              Manage
            </a>
          )}
        </div>

        <div className="flex items-center space-x-5">
          {session ? (
            <button
              onClick={handleSignOut}
              className="font-semibold text-lg text-black hover:text-gray-600"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/signin"
              className="font-semibold text-lg text-black hover:text-gray-600"
            >
              Sign In
            </Link>
          )}

          {userRole === 'dentist' && (
            <Link 
              href="/dentist/profile" 
              className="flex items-center justify-center w-10 h-10 bg-[#4AA3BA] rounded-full hover:bg-[#3b8294] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}