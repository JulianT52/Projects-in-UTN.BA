const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function request(path, { method, body, params } = {}) {
  const url = new URL(`${BASE_URL}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });
  }

  const headers = { "Content-Type": "application/json" };

  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody = null;

    try {
      errorBody = await res.json();
    } catch {}

    const message =
      errorBody?.message || errorBody?.error || `Error ${res.status}`;

    throw new Error(message);
  }

  if (res.status === 204) return null;

  return res.json();
}

export const api = {
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path, body) => request(path, { method: "DELETE", body }),
};

export default api;