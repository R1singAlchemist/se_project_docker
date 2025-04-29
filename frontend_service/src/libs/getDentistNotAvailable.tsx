import { getApiUrl } from "./getApiURL";

export default async function getDentistNotAvailable(id: string) {
    const apiURL = getApiUrl();

    const timestamp = new Date().getTime();
    
    const regularResponse = await fetch(`${apiURL}/api/v1/dentists/availibility/${id}?_t=${timestamp}`);
    if(!regularResponse.ok) {
        throw new Error("Failed to fetch dentist availability");
    }
    
    const allBookingsResponse = await fetch(`${apiURL}/api/v1/bookings?dentistId=${id}&_t=${timestamp}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('userToken') || ''}` 
        }
    });
    
    if (!allBookingsResponse.ok) {
        return await regularResponse.json();
    }
    
    const regularData = await regularResponse.json();
    const allBookingsData = await allBookingsResponse.json();
    
    if (regularData.success && allBookingsData.success) {
        const blockedBookings = allBookingsData.data.filter((booking: any) => 
            booking.status === "blocked"
          );
        
        const combinedBookings = [
            ...regularData.data,
            ...blockedBookings
        ];
        
        return {
            success: true,
            data: combinedBookings
        };
    }
    
    return regularData;
}