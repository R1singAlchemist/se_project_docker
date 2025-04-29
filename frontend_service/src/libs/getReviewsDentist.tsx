import { getApiUrl } from "./getApiURL"

export default async function getReviewsDentist(id: string) {
    const apiURL = getApiUrl();
    const response =await fetch(`${apiURL}/api/v1/dentists/reviews/${id}`)
    if(!response.ok) {
        throw new Error("Failed to fetch reviews dentist")
    }

    return await response.json()
}