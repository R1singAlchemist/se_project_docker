import { getApiUrl } from "./getApiURL";

export default async function updateUser(
  token: string,
  uid: string,
  role: string,
  dentist_id?: string
) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const requestBody: any = {
    role: role,
  };

  // only add dentist_id if it's provided
  if (dentist_id) {
    requestBody.dentist_id = dentist_id;
  }

  const apiURL = getApiUrl();

  const response = await fetch(
    `${apiURL}/api/v1/users/${uid}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    throw new Error("Cannot fetch User account");
  }

  return await response.json();
}
