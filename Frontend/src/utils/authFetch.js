export const authFetch = async (
  url,
  options = {},
  user,
  setUser
) => {

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${user.accessToken}`,
    },
    credentials: "include",
  });

  // token expired
  if (response.status === 401) {

    console.log("Access token expired. Refreshing...");

    const refreshResponse = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/refreshToken`,
      {
        credentials: "include",
      }
    );

    // refresh token also expired
    if (!refreshResponse.ok) {
      throw new Error("Session expired");
    }

    const refreshData = await refreshResponse.json();

    const newAccessToken = refreshData.accessToken;

    // update user state
    setUser((prev) => ({
      ...prev,
      accessToken: newAccessToken,
    }));

    console.log("New access token generated");

    // retry original request
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`,
      },
      credentials: "include",
    });
  }

  return response;
};