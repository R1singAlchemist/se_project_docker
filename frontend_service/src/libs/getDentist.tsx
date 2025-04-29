import { getApiUrl } from "./getApiURL";

export default async function getDentist(id: string) {
    // Remove any query parameters from the ID for the actual API call
    const cleanId = id.split('?')[0];

    const apiURL = getApiUrl();
    
    // Add a cache-busting timestamp to prevent browser caching
    const timestamp = new Date().getTime();
    const response = await fetch(`${apiURL}/api/v1/dentists/${cleanId}?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
    
    if(!response.ok) {
        throw new Error("Failed to fetch dentist");
    }

    return await response.json();
}