import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const login = ({ email, password }) =>
  axios.post(`${API_BASE_URL}/auth/login`, { email, password }, { withCredentials: true });

export const fetchCurrentUser = () =>
  axios.get(`${API_BASE_URL}/auth/user`, { withCredentials: true }).then(res => res.data.data);

export const logout = () =>
  axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });