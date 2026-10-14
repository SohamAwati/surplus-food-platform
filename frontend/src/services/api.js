const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "/api/v1" : "http://localhost:5001/api/v1");

async function request(path, options = {}) {
  const token = localStorage.getItem("surplus_access_token");
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  // If it's FormData, let the browser set Content-Type with multipart boundary
  if (isFormData && headers["Content-Type"]?.includes("multipart/form-data")) {
    delete headers["Content-Type"];
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg =
      data?.errors?.map((e) => (e.field ? `${e.field}: ${e.message}` : e.message)).join(", ") ||
      data?.error?.message ||
      data?.message ||
      "Something went wrong";

    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

export const api = {
  get(path, customOptions = {}) {
    return request(path, { method: "GET", ...customOptions });
  },

  post(path, body, customOptions = {}) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return request(path, {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
      ...customOptions,
    });
  },

  put(path, body, customOptions = {}) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return request(path, {
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
      ...customOptions,
    });
  },

  patch(path, body, customOptions = {}) {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return request(path, {
      method: "PATCH",
      body: isFormData ? body : JSON.stringify(body),
      ...customOptions,
    });
  },

  delete(path, customOptions = {}) {
    return request(path, {
      method: "DELETE",
      ...customOptions,
    });
  },
};

export default api;
