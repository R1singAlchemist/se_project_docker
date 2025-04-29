import BookingCatalog from "@/components/BookingCatalog";
import Link from "next/link";
import getBookings from "@/libs/getBookings";
import getUserProfile from "@/libs/getUserProfile";
import getUser from "@/libs/getUsers";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import UserCatalog from "@/components/UserCatalog";
import BookingHistoryCatalog from "@/components/BookingHistoryCatalog";
import AppointmentCatalog from "@/components/AppointmentCatalog";


// ONLY FOR DENTIST


export default async function Manage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.token) {
    redirect("/auth/signin");
  }

  const [profile, bookingJson, userJson] = await Promise.all([
    getUserProfile(session.user.token),
    getBookings(session.user.token),
    getUser(session.user.token)
  ]);

  return (
    <main className="w-full flex flex-col items-center bg-white min-h-screen">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Summarize your appointments</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>{" "} / <span>appointment</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {profile.data.role === "dentist" &&
          (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">
                Complete <span className="text-[#4AA3BA]">Appointment</span>
              </h2>
            </div>
          )
        }

        {profile.data.role === "dentist" && (
          <div className="container mx-auto px-6 py-12">
            <Suspense fallback={<p className="text-center">Loading...</p>}>
              <AppointmentCatalog bookingJson={bookingJson} />
            </Suspense>
          </div>
        )}
      </div>
    </main>
  );
}