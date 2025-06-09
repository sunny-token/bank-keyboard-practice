import { NextResponse } from "next/server";

interface RequestOptions extends RequestInit {
  token?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function request<T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, ...restOptions } = options;

  // 构建请求头
  const headers = new Headers(options.headers);
  // 自动从 localStorage 获取 token
  const authToken =
    token ||
    (typeof window !== "undefined" ? localStorage.getItem("token") : undefined);
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  headers.set("Content-Type", "application/json");

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...restOptions,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "请求失败");
    }

    return response.json();
  } catch (error) {
    console.error("请求错误:", error);
    throw error;
  }
}

// 封装常用的请求方法
export const http = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(url: string, data?: any, options?: RequestOptions) =>
    request<T>(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "DELETE" }),
};
