export const loginUser = async (email: string, password: string) => {
  const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
    email,
    password
  });
  return response.data;
};
