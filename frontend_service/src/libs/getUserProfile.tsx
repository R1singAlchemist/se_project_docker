import { getApiUrl } from "./getApiURL"

export default async function getUserProfile(token: string) {
    const apiURL = getApiUrl();

    const response = await fetch(`${apiURL}/api/v1/auth/me`, {
        method: "GET",
        headers: {
            authorization: `Bearer ${token}`,
        }
    })

    if(!response.ok){
        throw new Error("Cannot get user profile")
    }

    return await response.json()
}
