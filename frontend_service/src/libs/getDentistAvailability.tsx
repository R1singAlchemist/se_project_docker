import { getApiUrl } from "./getApiURL";

export default async function getDentistAvailability(id: string) {
    const apiURL = getApiUrl();

    const response = await fetch(`${apiURL}/api/v1/dentists/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    
    if (!response.ok) {
        throw new Error("Failed to fetch dentist availability");
    }
    
    return await response.json();
}