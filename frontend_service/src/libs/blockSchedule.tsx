import { getApiUrl } from "./getApiURL"

export default async function blockSchedule(did:string, token: string, userBookingDate: string) {
    const apiURL = getApiUrl();
    const response = await fetch(`${apiURL}/api/v1/dentists/${did}/bookings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            bookingDate: userBookingDate,
            status: "blocked"
        }),
    })

    if(!response.ok){
        throw new Error("Cannot create booking")
    }

    return await response.json()
}
