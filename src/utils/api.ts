export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('veritas_token');
  if (token) {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
  }
  return fetch(url, options);
};
