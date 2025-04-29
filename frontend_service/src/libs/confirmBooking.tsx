import { getApiUrl } from "./getApiURL";

export default async function confirmBooking(bookingId: string) {
  const apiURL = getApiUrl();
  try {
    const response = await fetch(
      `${apiURL}/api/v1/bookings/${bookingId}/confirm`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseText = await response.text();
    let jsonResponse;
    
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response:", responseText);
      throw new Error("Invalid response from server");
    }

    if (!response.ok) {
      // Check if it's already confirmed - we can treat that as success
      if (jsonResponse.message && jsonResponse.message.includes("already confirmed")) {
        return {
          success: true,
          data: { status: 'confirmed' },
          message: "Appointment is already confirmed"
        };
      }
      
      throw new Error(responseText);
    }

    return jsonResponse;
  } catch (error: any) {
    console.error("Confirmation error At libs:", error);
    
    // If the error message suggests the booking is already confirmed, return success
    if (typeof error.message === 'string' && 
        (error.message.includes("already confirmed") || 
         error.message.includes("Only upcoming bookings can be confirmed"))) {
      return {
        success: true,
        data: { status: 'confirmed' },
        message: "Appointment is already confirmed"
      };
    }
    
    throw error;
  }
}