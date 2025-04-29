import { getApiUrl } from "./getApiURL";

export default async function getPatientHistory(token: string, pid: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const apiURL = getApiUrl();

  const response = await fetch(
    `${apiURL}/api/v1/bookings/patientHistory/${pid}`,
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
