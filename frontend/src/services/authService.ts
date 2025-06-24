// services/authService.ts
import axios from 'axios';

export const loginUser = async (email: string, password: string) => {
  const response = await axios.post('/api/auth/login', {
    email,
    password
  });
  return response.data;
};
