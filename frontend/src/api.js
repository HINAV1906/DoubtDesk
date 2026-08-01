export const API_BASE = 'http://localhost:8000/api';

export const getToken = () => localStorage.getItem('token');

export const authHeaders = () => ({
  'Authorization': `Token ${getToken()}`,
});

export const authJsonHeaders = () => ({
  'Authorization': `Token ${getToken()}`,
  'Content-Type': 'application/json',
});

export const clearAuthSession = () => {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  localStorage.removeItem('fullName');
  localStorage.removeItem('enroll');
  localStorage.removeItem('shortname');
  localStorage.removeItem('rollno');
  localStorage.removeItem('div');
  localStorage.removeItem('branch');
  localStorage.removeItem('subject');
  localStorage.removeItem('mobile');
};

