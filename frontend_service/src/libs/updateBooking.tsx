import { getApiUrl } from "./getApiURL";

export default async function updateBooking(
    bid: string,
    token: string,
    userBookingDate: string,
    dentist: string
  ) {

    const apiURL = getApiUrl();

    const response = await fetch(
      `${apiURL}/api/v1/bookings/${bid}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingDate: userBookingDate,
          dentist: dentist
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error("Cannot create booking");
    }
  
    return await response.json();
  }