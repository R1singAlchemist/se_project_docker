import { getApiUrl } from "./getApiURL";

export default async function getBookings(token: string) {
  const apiURL = getApiUrl();

  await new Promise((resolve) => setTimeout(resolve, 300));


  const response = await fetch(
    `${apiURL}/api/v1/bookings`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
      },
    }
  );

  return await response.json();
}
