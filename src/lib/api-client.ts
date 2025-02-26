type ApiResponse<T> = {
  data: T;
  error?: never;
} | {
  data?: never;
  error: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);

  const token = localStorage.getItem("authToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error || `HTTP error! status: ${response.status}` };
    }

    const data: T = await response.json();
    return { data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

async function getBlobClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<{ blob: Blob; fileName: string }>> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem("authToken");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json();

      return { error: errorData.error || `HTTP error! status: ${response.status}` };
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition");

    let fileName = "submission-fallback.pdf"; // falblack
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^;\r\n"]+)/i);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    return { data: { blob, fileName } };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint),
  getBlob: (endpoint: string) => getBlobClient(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  postFormData: <T>(endpoint: string, data: FormData) =>
    apiClient<T>(endpoint, { method: "POST", body: data }),
  put: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
  upload: <T>(endpoint: string, formData: FormData) =>
    apiClient<T>(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      body: formData
    })
};
