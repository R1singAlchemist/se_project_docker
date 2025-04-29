'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import getUserProfile from '@/libs/getUserProfile';
import getDentist from '@/libs/getDentist';
import { CircularProgress, Button, Chip } from '@mui/material';
import Rating from '@/components/Rating';

interface DentistData {
  _id: string;
  name: string;
  area_expertise: string[];
  year_experience: number;
  StartingPrice: number;
  picture: string;
  rating: any[];
}

export default function DentistProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dentistData, setDentistData] = useState<DentistData | null>(null);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    async function fetchDentistProfile() {
      if (!session?.user?.token) {
        router.push('/signin');
        return;
      }

      try {
        setLoading(true);
        const userProfile = await getUserProfile(session.user.token);
        
        if (userProfile.data.role !== 'dentist' || !userProfile.data.dentist_id) {
          setError('You are not authorized to view this page');
          router.push('/');
          return;
        }

        const cacheBuster = new Date().getTime();
        
        const dentistResponse = await getDentist(userProfile.data.dentist_id + `?_cb=${cacheBuster}`);
        if (dentistResponse.sucess && dentistResponse.data) {
          setDentistData(dentistResponse.data);
          
          // Calculate average rating
          if (dentistResponse.data.rating && dentistResponse.data.rating.length > 0) {
            const total = dentistResponse.data.rating.reduce((acc: number, curr: any) => acc + curr.rating, 0);
            setAverageRating(total / dentistResponse.data.rating.length);
          }
        } else {
          setError('Failed to load dentist profile');
        }
      } catch (err) {
        console.error('Error fetching dentist profile:', err);
        setError('An error occurred while loading your profile');
      } finally {
        setLoading(false);
      }
    }

    fetchDentistProfile();
  }, [session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <CircularProgress color="inherit" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
          <Link 
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-[#4AA3BA] text-white rounded-md hover:bg-[#3b8294] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!dentistData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Profile Not Found</h2>
          <p className="text-gray-700">Your dentist profile could not be found. Please contact an administrator.</p>
          <Link 
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-[#4AA3BA] text-white rounded-md hover:bg-[#3b8294] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Main Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header with Background */}
          <div className="relative h-48 bg-[#f0e6c6]">
            {/* Edit Profile Button */}
            <div className="absolute top-4 right-4">
              <Link href="/dentist/profile/edit">
                <button className="bg-[#4AA3BA] hover:bg-[#3b8294] text-white px-6 py-2 rounded-md font-medium transition-colors">
                  Edit profile
                </button>
              </Link>
            </div>
            
            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-8">
              <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden">
                <Image 
                  src={dentistData.picture || '/img/placeholder-dentist.jpg'} 
                  alt={dentistData.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
          {/* Profile Info */}
          <div className="pt-20 px-8 pb-6">
            <h1 className="text-2xl font-bold text-gray-900">{dentistData.name}</h1>
            
            {/* Location */}
            <div className="flex items-center mt-2 text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Patumwan, Bangkok, TH, Bangkok Thailand</span>
            </div>
            
            {/* Social/Contact Info */}
            <div className="mt-3">
              <div className="flex items-center text-gray-700">
                <span className="font-bold mr-2">@</span> 
                <span>{dentistData.name}</span>
              </div>
            </div>
            
            {/* Key Info */}
            <div className="mt-4 space-y-2">
              <p className="text-gray-700">
                <span className="font-medium">Years of experience:</span> {dentistData.year_experience} Years
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Starting price:</span> {dentistData.StartingPrice} ฿
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6">
              <Link href="/bookingHistory">
                <button className="bg-[#4AA3BA] hover:bg-[#3b8294] text-white px-6 py-2 rounded-md font-medium transition-colors">
                  View Appointment History
                </button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Expertise Section */}
        <div className="bg-white rounded-lg shadow-md mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Area of expertise:</h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(dentistData.area_expertise) && dentistData.area_expertise.map((expertise, index) => (
              <Chip 
                key={index} 
                label={expertise} 
                variant="outlined"
                sx={{ 
                  borderRadius: '16px',
                  backgroundColor: index % 2 === 0 ? '#f0f0f0' : '#ffffff',
                  '&:hover': { backgroundColor: index % 2 === 0 ? '#e8e8e8' : '#f8f8f8' }
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Reviews Section */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4 px-6">Patient Reviews</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Average Rating Summary */}
            <div className="flex items-center gap-4 mb-6 border-b pb-4">
              <div className="text-3xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div>
                {renderStars(Math.round(averageRating))}
                <p className="text-gray-500 text-sm mt-1">
                  Based on {dentistData.rating ? dentistData.rating.length : 0} reviews
                </p>
              </div>
            </div>
            
            {/* Reviews List */}
            <div className="space-y-6">
              {dentistData.rating && dentistData.rating.length > 0 ? (
                dentistData.rating.map((review, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} className={`${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600">{review.review || "No comment provided."}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}