const API_BASE_URL = 'https://dev.vivim.co.kr/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  
  // Companies
  COMPANIES: `${API_BASE_URL}/companies`,
  COMPANY_BY_ID: (id) => `${API_BASE_URL}/companies/${id}`,
  COMPANY_EMPLOYEES: (id) => `${API_BASE_URL}/companies/${id}/employees`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
  
  // Projects
  PROJECTS: `${API_BASE_URL}/projects`,
  ALL_PROJECTS: `${API_BASE_URL}/projects/all`,
  PROJECT_BY_ID: (id) => `${API_BASE_URL}/projects/${id}`,
};