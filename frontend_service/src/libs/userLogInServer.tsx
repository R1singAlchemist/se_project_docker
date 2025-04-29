import { getApiUrl } from "./getApiURL";

export default async function userLogIn(userEmail: string, userPassword: string) {

    const apiURL = getApiUrl();

    const response = await fetch(`${apiURL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: userEmail,
            password: userPassword
        }),
    })
    if(!response.ok){
        console.log(response);
        throw new Error("Failed to log-in")
    }

    return await response.json()
}
