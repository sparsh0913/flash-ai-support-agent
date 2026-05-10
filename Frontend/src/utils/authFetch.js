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

  if (response.status === 401) {

    const refreshResponse = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/refreshToken`,
      {
        credentials: "include",
      }
    );

    if (!refreshResponse.ok) {
      throw new Error("Session expired");
    }

    const refreshData = await refreshResponse.json();

    const newAccessToken = refreshData.accessToken;

    setUser((prev) => ({
      ...prev,
      accessToken: newAccessToken,
    }));

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