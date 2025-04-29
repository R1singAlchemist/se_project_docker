import { getApiUrl } from "./getApiURL";

export default async function deleteBooking(bid: string, token: string) {
  const apiURL = getApiUrl();
  await new Promise((resolve) => setTimeout(resolve, 300));

  const response = await fetch(
    `${apiURL}/api/v1/bookings/${bid}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Cannot delete booking");
  }

  return await response.json();
}
