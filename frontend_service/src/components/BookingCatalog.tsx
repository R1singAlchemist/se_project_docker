"use client";
import Link from "next/link";
import deleteBooking from "@/libs/deleteBooking";
import cancelBooking from "@/libs/cancelBooking";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function BookingCatalog({
  bookingJson,
}: {
  bookingJson: Promise<BookingJson>;
}) {
  const { data: session } = useSession();
  const [bookingJsonReady, setBookingJsonReady] = useState<BookingJson | null>(
    null
  );

  useEffect(() => {
    async function fetchBookingData() {
      try {
        const data = await bookingJson;
        setBookingJsonReady(data);
      } catch (error) {
        console.error("Failed to load dentists:", error);
      }
    }
    fetchBookingData();
  }, [bookingJson]);

  if (!session?.user?.token) {
    return (
      <p className="text-center my-4 text-red-500">
        You must be logged in to see your bookings.
      </p>
    );
  }

  if (!bookingJsonReady) {
    return <p className="text-center my-4">Loading...</p>;
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId, session.user.token);
      setBookingJsonReady({
        ...bookingJsonReady,
        data: bookingJsonReady.data.filter(
          (booking) => booking._id !== bookingId
        ),
      });
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId, session.user.token);
      
      // Update the local state to remove the cancelled booking from the display
      setBookingJsonReady({
        ...bookingJsonReady,
        data: bookingJsonReady.data.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: "cancelled" }  // Change status to cancelled
            : booking
        )
      });
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    }
  };

  if (!bookingJsonReady.data || bookingJsonReady.data.length === 0) {
    return <div className="text-center text-gray-500">No bookings found.</div>;
  }

  // Filter bookings to only show "upcoming" ones
  const upcomingBookings = bookingJsonReady.data.filter(
    (booking) => booking.status === "upcoming"
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {upcomingBookings.length > 0 ? (
        upcomingBookings.map((bookingItem: BookingItem) => (
          <div
            key={bookingItem._id}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="flex w-full text-gray-500 items-center py-4">
              {/* Booking ID */}
              <div className="flex-1.5 min-w-[200px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Booking ID
                </div>
                <div className="text-sm break-all">{bookingItem._id}</div>
              </div>

              {/* Appointment Date */}
              <div className="flex-1 min-w-[200px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Appointment Date
                </div>
                <div className="text-sm">
                  {formatDate(bookingItem.bookingDate)}
                </div>
              </div>

              {/* Dentist Name */}
              <div className="flex-0.5 min-w-[180px] px-4 border-r border-gray-300">
                <div className="font-bold text-black text-lg mb-1">
                  Dentist Name
                </div>
                <div className="text-sm">{bookingItem.dentist.name}</div>
              </div>

              {/* Patient ID */}
              <div className="flex-1 min-w-[180px] px-4">
                <div className="font-bold text-black text-lg mb-1">
                  Patient ID
                </div>
                <div className="text-sm">{session.user._id || "Patient"}</div>
              </div>

              {/* Buttons */}
              <div className="flex-shrink-0 px-4 flex gap-2">
                <Link
                  href={`/booking/${bookingItem._id}`}
                  className="bg-[#4AA3BA] text-white px-4 py-2 rounded-full font-medium hover:bg-[#3b8294] transition duration-300 text-sm whitespace-nowrap"
                >
                  Edit appointment
                </Link>
                <button
                  className="bg-white text-[#4AA3BA] border border-[#4AA3BA] px-4 py-2 rounded-full font-medium hover:text-red-500 hover:border-red-500 transition duration-300 text-sm whitespace-nowrap"
                  onClick={() => handleCancel(bookingItem._id)}
                >
                  Cancel appointment
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500">No upcoming bookings found.</div>
      )}
    </div>
  );
}