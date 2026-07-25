export const parseJsonResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type") || "";
  let data: any;

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = { detail: "Réponse du serveur au format invalide." };
    }
  } else {
    const text = await res.text();
    data = { detail: text || `Erreur serveur (${res.status})` };
  }

  if (!res.ok) {
    const errorMsg = data?.detail || data?.message || `Erreur ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return data;
};

export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('veritas_token');
  if (token) {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
  }
  return fetch(url, options);
};

