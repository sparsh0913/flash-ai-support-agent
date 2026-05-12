export const getValidAccessToken = async (
   user,
   setUser
) => {

   let token = user.accessToken;

   const testResponse = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
      {
         headers: {
            Authorization: `Bearer ${token}`
         },
         credentials: "include"
      }
   );

   // token still valid
   if(testResponse.ok){
      console.log("Access token still valid");
      return token;
   }

   console.log("Access token expired. Refreshing before request...");

   const refreshResponse = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/refreshToken`,
      {
         credentials: "include"
      }
   );

   if(!refreshResponse.ok){
      throw new Error("Session expired");
   }

   const refreshData = await refreshResponse.json();

   const newToken = refreshData.accessToken;

   setUser((prev) => ({
      ...prev,
      accessToken: newToken
   }));

   console.log("New access token generated");

   return newToken;
};