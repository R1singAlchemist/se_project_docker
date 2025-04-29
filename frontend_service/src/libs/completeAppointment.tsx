import { getApiUrl } from "./getApiURL";

export default async function completeAppointment(
    bid: string,
    token: string,
    treatmentDetail: string
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
          status: "completed",
          treatmentDetail: treatmentDetail,
        }),
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to mark appointment as completed");
    }
  
    return await response.json();
  }
  