export const getApiUrl = () => {
    if (typeof window === 'undefined') {
      // Server
      return process.env.BACKEND_URL;
    } else {
      // Client
      return process.env.NEXT_PUBLIC_BACKEND_URL;
    }
  };