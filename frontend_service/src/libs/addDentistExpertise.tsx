import { getApiUrl } from "./getApiURL";

export default async function addDentistExpertise(id: string, token: string, expertise: string[]) {
  const apiURL = getApiUrl();
  try {
    console.log('Updating expertise for dentist ID:', id);
    console.log('New expertise list:', expertise);
    
    const updateResponse = await fetch(`${apiURL}/api/v1/dentists/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        area_expertise: expertise
      })
    });
    
    const updateResponseText = await updateResponse.text();
    console.log('Direct update response:', updateResponseText);
    
    if (!updateResponse.ok) {
      console.log('Direct update failed, trying individual expertise updates...');
      
      try {
        const removeResponse = await fetch(`${apiURL}/api/v1/dentists/${id}/expertise`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            expertise: "all" 
          })
        });

        if (!removeResponse.ok) {
          console.log('Error removing expertise:', await removeResponse.text());
        }
      } catch (e) {
        console.error('Error in remove expertise step:', e);
      }
      
      const results = await Promise.all(expertise.map(async (exp) => {
        const response = await fetch(`${apiURL}/api/v1/dentists/${id}/expertise`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            expertise: exp
          })
        });
        
        const responseText = await response.text();
        console.log(`Added expertise "${exp}" response:`, responseText);
        
        try {
          return JSON.parse(responseText);
        } catch (e) {
          return { success: false, text: responseText };
        }
      }));
      
      return { success: true, results };
    }
    
    try {
      return JSON.parse(updateResponseText);
    } catch (e) {
      return { success: true, text: updateResponseText };
    }
  } catch (error) {
    console.error('Error in addDentistExpertise:', error);
    throw error;
  }
}