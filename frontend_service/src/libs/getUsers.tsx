import { getApiUrl } from "./getApiURL";

export default async function getUser(token: string) {
    const apiURL = getApiUrl();
    await new Promise((resolve) => setTimeout(resolve, 300));
  
    const response = await fetch(
      `${apiURL}/api/v1/users`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`
        },
      }
    );
  
    return await response.json();
  }
  