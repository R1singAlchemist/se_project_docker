import { getApiUrl } from "./getApiURL"

export default async function getDentists() {

    await new Promise((resolve) => setTimeout(resolve, 300))

    const apiURL = getApiUrl();

    const response = await fetch(`${apiURL}/api/v1/dentists`)
    if(!response.ok) {
        throw new Error("Failed to fetch dentists")
    }

    return await response.json()
}