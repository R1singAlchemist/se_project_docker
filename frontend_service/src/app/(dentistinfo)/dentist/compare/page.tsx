"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import getDentist from "@/libs/getDentist";

interface Dentist {
  id: number;
  name: string;
  area_expertise: string;
  year_experience: number;
  StartingPrice: number;
  picture: string;
}

export default function CompareDentistPage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");

  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchData = async () => {
      try {
        if (!idsParam) return;

        const ids = idsParam.split(",").map((id) => id.trim());
        const dentistData = await Promise.all(
          ids.map(async (id) => {
            const res = await getDentist(id);
            return res.data;
          })
        );

        setDentists(dentistData);
      } catch (err) {
        setError("Failed to load comparison data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idsParam]);

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-lg mx-auto p-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-red-100 p-4">
              <div className="rounded-full bg-red-200 p-4">
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-gray-800">Error Loading Comparison</h2>
            <p className="mt-2 text-red-600">{error}</p>
            <div className="mt-6">
              <Link href="/dentist">
                <button className="bg-[#4AA3BA] hover:bg-[#3b8294] text-white font-semibold py-2 px-6 rounded-full shadow-md transition">
                  Return to Dentists
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (loading || dentists.length < 2) {
    return (
      <main className="min-h-screen bg-gray-50 pt-32">
        <div className="max-w-lg mx-auto p-8 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-blue-100 p-3">
              <div className="flex space-x-2 justify-center items-center">
                <div className="h-3 w-3 bg-[#4AA3BA] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-3 w-3 bg-[#4AA3BA] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-3 w-3 bg-[#4AA3BA] rounded-full animate-bounce"></div>
              </div>
            </div>
            <h2 className="mt-5 text-2xl font-bold text-gray-800">Loading comparison...</h2>
            <p className="mt-2 text-gray-600">Please wait while we fetch dentist information</p>
          </div>
        </div>
      </main>
    );
  }

  const [dentist1, dentist2] = dentists;

  const priceBetter = dentist1.StartingPrice < dentist2.StartingPrice ? [true, false] : [false, true];
  const experienceBetter = dentist1.year_experience > dentist2.year_experience ? [true, false] : [false, true];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Compare Dentists</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>{" "}
          /{" "}
          <Link href="/dentist" className="hover:text-blue-600">Dentists</Link>{" "}
          / <span>Compare</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Your smile, your choice</h2>
          <p className="text-3xl font-bold text-[#4AA3BA]">Compare and find the dentist who suits you best</p>
        </div>

        <div className="text-center mb-8">
          <Link href="/dentist">
            <button className="bg-[#4AA3BA] hover:bg-[#3b8294] text-white font-semibold py-2 px-6 rounded-full shadow-md transition duration-300 flex items-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dentists
            </button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-16">
          {dentists.map((dentist, idx) => (
            <div
              key={idx}
              className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden relative text-center">
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full p-2 shadow-md z-10">
                  {idx === 0 ? (
                    <span className="text-lg font-bold text-[#4AA3BA]">A</span>
                  ) : (
                    <span className="text-lg font-bold text-[#4AA3BA]">B</span>
                  )}
                </div>
                <Image
                  src={dentist.picture}
                  alt={dentist.name}
                  width={250}
                  height={250}
                  className="w-auto h-64 mx-auto object-cover"
                />
              </div>

              <div className="p-6">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 pb-4 border-b border-gray-200">
                  {dentist.name}
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Area of Expertise:</span>
                    <span className="text-gray-800">{dentist.area_expertise}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Years of Experience:</span>
                    <div className={`flex items-center ${
                      experienceBetter[idx]
                        ? "text-green-600 font-semibold"
                        : "text-gray-800"
                    }`}>
                      <span>{dentist.year_experience} Years</span>
                      {experienceBetter[idx] && (
                        <div className="ml-2 bg-green-100 rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pb-2">
                    <span className="font-medium text-gray-700">Starting Price:</span>
                    <div className={`flex items-center ${
                      priceBetter[idx]
                        ? "text-green-600 font-semibold"
                        : "text-gray-800"
                    }`}>
                      <span>{dentist.StartingPrice.toLocaleString()} ฿</span>
                      {priceBetter[idx] && (
                        <div className="ml-2 bg-green-100 rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Link href={`/booking?did=${dentist.id}`}>
                    <button className="w-full bg-[#4AA3BA] hover:bg-[#3b8294] text-white font-semibold py-3 px-6 rounded-full shadow-md transition duration-300 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Book Appointment
                    </button>
                  </Link>
                  <Link href={`/dentist/${dentist.id}`}>
                    <button className="w-full mt-3 bg-white border border-[#4AA3BA] text-[#4AA3BA] hover:bg-gray-50 font-semibold py-3 px-6 rounded-full shadow-sm transition duration-300">
                      View Profile
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}