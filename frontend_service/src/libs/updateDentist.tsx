import { getApiUrl } from "./getApiURL";

export default async function updateDentist(id: string, token: string, updateData: any) {
  const apiURL = getApiUrl();

  try {
    console.log('Updating dentist with ID:', id);
    console.log('Update data:', updateData);
    console.log('Bio field being sent:', updateData.bio);
    
    const timestamp = new Date().getTime();
    
    const response = await fetch(`${apiURL}/api/v1/dentists/${id}?_t=${timestamp}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      cache: 'no-store',
      body: JSON.stringify(updateData)
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    if (!response.ok) {
      throw new Error(`Failed to update dentist information: ${response.status} ${responseText}`);
    }
    
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing response as JSON:', parseError);
      return { success: true, message: 'Update successful but received invalid JSON response' };
    }
  } catch (error) {
    console.error('Error in updateDentist:', error);
    throw error;
  }
}