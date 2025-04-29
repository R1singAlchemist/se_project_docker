'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@mui/material';

export default function Banner() {
  const router = useRouter();
  
  return (
    <div className="relative w-full bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0 pr-0 lg:pr-8">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#4AA3BA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-2 text-gray-700 font-medium">Your Smile, Our Schedule.</p>
            </div>
            
            <h1 className="text-4xl font-bold mb-2 whitespace-nowrap">
              First step toward a <span className="text-[#4AA3BA]">healthier smile</span>?
            </h1>
            <h2 className="text-4xl mb-6">
              <span className="text-[#4AA3BA]">Book your appointment</span> today!
            </h2>
            
            <ul className="space-y-2 mb-8">
              <li className="flex items-center">
                <span className="text-gray-700 mr-2">•</span>
                <span className="text-gray-600">Fast & Easy Online Booking</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-700 mr-2">•</span>
                <span className="text-gray-600">Verified & Trusted Dentists</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-700 mr-2">•</span>
                <span className="text-gray-600">Hassle-Free Appointment Management</span>
              </li>
            </ul>
            
            <Button
              variant="contained"
              onClick={() => router.push('/booking')}
              className="font-semibold text-lg rounded-full"
              sx={{
                borderRadius: '9999px',
                backgroundColor: '#4AA3BA',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#3b8294',
                },
                padding: '10px 24px',
              }}
            >
              Book now
            </Button>
          </div>
          
          <div className="w-full lg:w-1/2 relative">
            <div className="relative">
              <div className="w-full h-96 relative mb-5">
                <div className="absolute top-0 right-[-20px] w-full h-full rounded-full bg-[#4AA3BA]"></div>
                <div className="absolute top-0 right-[-20px] w-full h-full">
                  <Image
                    src="/img/Dentist_Banner.jpg"
                    alt="Dentist"
                    width={600}
                    height={600}
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mx-auto -mt-4 relative z-10">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-semibold text-gray-700">Name</p>
                    <p className="text-gray-600">John Doe</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Years of experience</p>
                    <p className="text-gray-600">12 Years</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="font-semibold text-gray-700">Area of expertise</p>
                  <p className="text-gray-600">General Dentistry</p>
                </div>
                <div className="text-center">
                  <Button
                    variant="contained"
                    onClick={() => router.push('/booking')}
                    className="font-semibold text-lg rounded-full w-full"
                    sx={{
                      borderRadius: '9999px',
                      backgroundColor: '#4AA3BA',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#3b8294',
                      },
                      padding: '8px 24px',
                    }}
                  >
                    Make an appointment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* About Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-gray-500 uppercase tracking-wider">ABOUT US</p>
          <h2 className="text-4xl font-bold mt-2">
            Welcome to <span className="text-[#4AA3BA]">DentalBook</span>!
          </h2>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0">
            <Image
              src="/img/Dentist_About_Us.jpg" 
              alt="Dentist working"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
          
          <div className="w-full lg:w-1/2 lg:pl-16">
            <p className="text-gray-600 mb-6">
              At DentalBook, we make it easier than ever to find and book your next dental appointment. Whether you're looking for a routine checkup, emergency care, or specialized treatment, our platform connects you with trusted, experienced dentists who meet your needs.
            </p>
            <p className="text-gray-600 mb-6">
              We understand that visiting the dentist can sometimes feel like a hassle, which is why we've designed a streamlined, user-friendly platform that takes the stress out of booking your appointment. With just a few clicks, you can search for available dentists in your area, compare reviews, and secure a time that works best for you.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 mb-10 lg:mb-0 lg:pr-16">
            <h2 className="text-4xl font-bold mb-8">Why Choose Us?</h2>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-gray-700 mr-2 mt-1">•</span>
                <p className="text-gray-600">
                  <span className="font-semibold">Quick and Easy Booking:</span> Book your appointment in minutes, with no phone calls or wait times.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-gray-700 mr-2 mt-1">•</span>
                <p className="text-gray-600">
                  <span className="font-semibold">Verified Dentists:</span> We only work with licensed professionals, so you can trust that you're getting the best care.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-gray-700 mr-2 mt-1">•</span>
                <p className="text-gray-600">
                  <span className="font-semibold">Flexible Scheduling:</span> Find appointments that fit your schedule, whether it's early morning, late evening, or weekends.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-gray-700 mr-2 mt-1">•</span>
                <p className="text-gray-600">
                  <span className="font-semibold">Convenient Locations:</span> Browse through a wide range of local dentists to find one near you.
                </p>
              </li>
              <li className="flex items-start">
                <span className="text-gray-700 mr-2 mt-1">•</span>
                <p className="text-gray-600">
                  <span className="font-semibold">Transparent Reviews:</span> Read reviews from real patients to help you choose the right dentist for your needs.
                </p>
              </li>
            </ul>
            
            <p className="mt-6 text-gray-600">
              Whether you need a routine cleaning, teeth whitening, or something more complex, we are here to help make your dental care as convenient as possible. Experience hassle-free dental bookings with DentalBook today!
            </p>
          </div>
          
          <div className="w-full lg:w-1/2">
            <Image
              src="/img/Dentist_About_Us2.jpg" 
              alt="Dentist working"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}