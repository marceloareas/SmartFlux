export async function fetchApi(url: string, options: RequestInit = {}) {
  let token = localStorage.getItem('accessToken');
  
  if (!options.headers) {
    options.headers = {};
  }
  
  if (token) {
    (options.headers as any)['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, options);

  if (res.status === 401 || res.status === 403) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
          try {
              const refreshRes = await fetch('/api/auth/refresh', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ refreshToken })
              });
              
              if (refreshRes.ok) {
                  const data = await refreshRes.json();
                  localStorage.setItem('accessToken', data.accessToken);
                  localStorage.setItem('refreshToken', data.refreshToken);
                  
                  // Retry the original request
                  (options.headers as any)['Authorization'] = `Bearer ${data.accessToken}`;
                  res = await fetch(url, options);
              } else {
                  // Refresh failed
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  window.location.href = '/login';
                  throw new Error('Unauthorized');
              }
          } catch (err) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.location.href = '/login';
              throw new Error('Unauthorized');
          }
      } else {
          window.location.href = '/login';
          throw new Error('Unauthorized');
      }
  }

  if (!res.ok) {
      throw new Error('API Error');
  }

  return res;
}
