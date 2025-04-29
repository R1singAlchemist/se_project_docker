"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import getBooking from "@/libs/getBooking";
import completeAppointment from "@/libs/completeAppointment";

export default function CompleteAppointment({ params }: { params: { bid: string } }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [bookingJson, setBookingJson] = useState<any>(null);
  const [treatmentDetail, setTreatmentDetail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !session.user?.token) {
      router.push("/auth/signin");
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.user?.token) {
      getBooking(session.user.token, params.bid)
        .then((data) => {
          setBookingJson(data);
          // If there are already treatment details, pre-fill the field
          if (data.data.treatmentDetail) {
            setTreatmentDetail(data.data.treatmentDetail);
          }
        })
        .catch(() => setError("Failed to load booking data"));
    }
  }, [session, params.bid]);

  const handleCompleteAppointment = async () => {
    if (!treatmentDetail.trim()) {
      setError("Please enter treatment details.");
      return;
    }

    if (!session?.user?.token) {
      setError("You must be logged in to complete an appointment.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await completeAppointment(
        bookingJson.data._id,
        session.user.token,
        treatmentDetail
      );
      setSuccess("Appointment marked as completed successfully!");
      
      // Redirect to appointments list after a short delay
      setTimeout(() => {
        router.push("/appointment");
      });
    } catch (err) {
      setError("Failed to complete appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!bookingJson) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl animate-fade-in">
          <div className="flex justify-center space-x-2 mb-5">
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-3 w-3 bg-[#5EBFD3] rounded-full animate-bounce"></div>
          </div>

          <p className="text-lg font-medium text-gray-700 animate-pulse">
            Loading appointment details<span className="animate-ellipsis">...</span>
          </p>

          <div className="mt-6 w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-[#5EBFD3] rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full flex flex-col items-center bg-white min-h-screen">
      <div className="w-full bg-gray-100 py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Complete Appointment</h1>
        <div className="mt-2 text-sm text-gray-600">
          <Link href="/dentist/appointments" className="hover:text-blue-600">
            Appointments
          </Link>{" "}
          / <span>Complete Appointment</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">
            Complete <span className="text-[#4AA3BA]">Patient Appointment</span>
          </h2>
          <p className="mt-3 text-gray-600">
            Add treatment details and mark this appointment as completed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto p-8">
          {/* Appointment Information */}
          <div className="mb-8 p-6 bg-[#F0F7FA] rounded-lg border border-[#D0E6EB]">
            <h3 className="text-lg font-medium text-[#4AA3BA] mb-4">
              Appointment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#4AA3BA] font-medium mb-1">
                  Patient Name
                </p>
                <p className="font-medium text-gray-700">
                  {bookingJson.data.user?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#4AA3BA] font-medium mb-1">
                  Date & Time
                </p>
                <p className="font-medium text-gray-700">
                  {new Date(bookingJson.data.bookingDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#4AA3BA] font-medium mb-1">
                  Booking ID
                </p>
                <p className="font-medium text-gray-700">
                  {bookingJson.data._id}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#4AA3BA] font-medium mb-1">
                  Current Status
                </p>
                <p className="font-medium text-gray-700">
                  {bookingJson.data.status}
                </p>
              </div>
            </div>
          </div>

          {/* Treatment Details Form */}
          <div className="mb-6">
            <label
              htmlFor="treatmentDetail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Treatment Details
            </label>
            <textarea
              id="treatmentDetail"
              name="treatmentDetail"
              rows={6}
              className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#5EBFD3] focus:border-[#5EBFD3] transition-colors duration-200"
              placeholder="Enter detailed treatment information, procedures performed, and recommendations..."
              value={treatmentDetail}
              onChange={(e) => setTreatmentDetail(e.target.value)}
            ></textarea>
            <p className="mt-2 text-sm text-gray-500">
              Provide comprehensive details about the treatment provided to the patient.
            </p>
          </div>

          {/* Error and Success Messages */}
          <div className="mb-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                <p className="text-green-600">{success}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className={`w-full bg-[#5EBFD3] hover:bg-[#4AA3BA] text-white font-medium py-3 px-6 rounded-full transition-colors duration-200 shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
              onClick={handleCompleteAppointment}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Mark as Completed"
              )}
            </button>
            <Link
              href="/appointment"
              className="w-full sm:w-auto text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-full transition-colors duration-200"
            >
              Cancel
            </Link>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">
                  Once marked as completed, this action cannot be undone. The patient will be able to view these treatment details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}