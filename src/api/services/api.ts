import axios, { AxiosError } from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://zainmustafa-api-ai.hf.space";

// ✅ Retry helper with exponential backoff
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 3000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      const axiosError = error as AxiosError;

      // آخر محاولة؟ ارمي الـ error
      if (i === maxRetries - 1) {
        throw new Error(
          axiosError.response?.data?.detail ||
            axiosError.message ||
            "Request failed after retries"
        );
      }

      // لو timeout أو connection error، جرب تاني
      if (
        axiosError.code === "ECONNABORTED" ||
        axiosError.code === "ETIMEDOUT" ||
        axiosError.message?.includes("timeout") ||
        axiosError.response?.status === 503 ||
        axiosError.response?.status === 502
      ) {
        const waitTime = retryDelay * Math.pow(2, i); // Exponential backoff
        console.log(`⏳ Retry ${i + 1}/${maxRetries} after ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      // لو 404 أو 400، متحاولش تاني
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function extractText(file: File): Promise<string> {
  return retryRequest(async () => {
    const formData = new FormData();
    formData.append("file", file);

    console.log("📤 Sending file to extract-preview endpoint...");

    const response = await axios.post(
      `${API_BASE_URL}/extract-preview`,
      formData,
      {
        timeout: 180000, // 3 minutes for cold start
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          console.log(`📊 Upload progress: ${percentCompleted}%`);
        },
      }
    );

    console.log("✅ Extract response:", response.data);
    return response.data.text;
  }, 2); // 2 retries
}

export async function compareContracts(
  standard: File,
  contract: File
): Promise<any> {
  return retryRequest(async () => {
    const formData = new FormData();
    formData.append("standard", standard);
    formData.append("other", contract);

    console.log("📤 Sending comparison request...");

    const response = await axios.post(`${API_BASE_URL}/compare`, formData, {
      timeout: 300000, // 5 minutes for comparison
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Comparison response:", response.data);
    return response.data;
  }, 2);
}

export async function translateReport(text: string): Promise<string> {
  return retryRequest(async () => {
    console.log("🌍 Sending translation request...");

    const response = await axios.post(
      `${API_BASE_URL}/translate-report`,
      { text },
      {
        timeout: 120000, // 2 minutes for translation
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Translation complete");
    return response.data.translated_text;
  }, 2);
}

// ✅ Test API health
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${API_BASE_URL}/`, {
      timeout: 10000,
    });
    console.log("✅ API Health:", response.data);
    return response.data.status === "healthy";
  } catch (error) {
    console.error("❌ API Health check failed:", error);
    return false;
  }
}
