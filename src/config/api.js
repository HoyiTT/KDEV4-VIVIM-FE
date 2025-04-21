// export const API_BASE_URL = 'https://dev.vivim.co.kr/api';
export const API_BASE_URL = 'https://dev.vivim.co.kr/api';
// export const API_BASE_URL = 'https://localhost/api';



export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/auth/login`,
  
  // Users
  USERS: `${API_BASE_URL}/users`,
  USER_DETAIL: (id) => `${API_BASE_URL}/users/${id}`,
  USER_PASSWORD_MODIFY: (userId, password) => `${API_BASE_URL}/users/modifypassword/${userId}?password=${password}`,
  
  // Companies
  COMPANIES: `${API_BASE_URL}/companies`,
  COMPANY_DETAIL: (id) => `${API_BASE_URL}/companies/${id}`,
  COMPANY_EMPLOYEES: (companyId) => `${API_BASE_URL}/companies/${companyId}/employees`,
  
  // Projects
  PROJECTS: `${API_BASE_URL}/projects`,
  PROJECT_DETAIL: (id) => `${API_BASE_URL}/projects/${id}`,
  ADMIN_PROJECTS: `${API_BASE_URL}/projects/all`,
  USER_PROJECTS: (userId) => `${API_BASE_URL}/projects?userId=${userId}`,
  PROJECT_POSTS: (projectId) => `${API_BASE_URL}/projects/${projectId}/posts`,
  PROJECT_POST_LINK: (projectId, postId) => `${API_BASE_URL}/projects/${projectId}/posts/${postId}/link`,
  PROJECT_POST_FILE: (projectId, postId) => `${API_BASE_URL}/projects/${projectId}/posts/${postId}/file/stream`,
  
  // Add this to your existing API_ENDPOINTS object
  RESET_PASSWORD: `${API_BASE_URL}/users/resetpassword`,
  AUDIT_LOGS: `${API_BASE_URL}/auditLog`,
  AUDIT_LOGS_SEARCH: `${API_BASE_URL}/auditLog/search`,
};