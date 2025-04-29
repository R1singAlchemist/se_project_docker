import BookingCatalog from "@/components/BookingCatalog";
import Link from "next/link";
import getBookings from "@/libs/getBookings";
import getUserProfile from "@/libs/getUserProfile";
import getUser from "@/libs/getUser";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import UserCatalog from "@/components/UserCatalog";
import BookingHistoryCatalog from "@/components/BookingHistoryCatalog";
import PatientTreatmentHistoryCatalog from "@/components/PatientTreatmentHistoryCatalog";
import getPatientHistory from "@/libs/getPatientHistory";

export default async function Manage({ params }: { params: { pid: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user.token) {
    redirect("/auth/signin");
  }
  const uid = params.pid ;

  const [profile, bookingJson, userJson] = await Promise.all([
    getUserProfile(session.user.token),
    getPatientHistory(session.user.token , params.pid ),
    getUser(session.user.token , params.pid )
  ]);

  return (
    <main className="w-full flex flex-col items-center bg-white min-h-screen">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Patient Treatment History</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>{" "} / <span>Manage</span>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {profile.data.role === "dentist" && (
          <div className="container mx-auto px-6 py-12">
            <Suspense fallback={<p className="text-center">Loading...</p>}>
              <PatientTreatmentHistoryCatalog bookingJson={bookingJson}  patient={userJson} />
            </Suspense>
          </div>
        )}
        
        {profile.data.role === "admin" &&
          (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">
                Schedule your <span className="text-[#4AA3BA]">Dental Booking</span>
              </h2>
            </div>
          )
        }

        {profile.data.role === "user" &&
          (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">
                Schedule your <span className="text-[#4AA3BA]">Dental Booking</span>
              </h2>
            </div>
          )
        }

        {profile.data.role === "banned" &&
          (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-red-500">
                You got banned
              </h2>
            </div>
          )
        }

      </div>
    </main>
  );
}