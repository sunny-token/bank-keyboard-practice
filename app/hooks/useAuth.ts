import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { http } from "@/lib/request";

interface UserData {
  id: number;
  email: string;
  role: string;
  token: string;
}

interface UseAuthReturn {
  userEmail: string | null;
  userId: number | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserData: (data: Partial<UserData>) => void;
}

export function useAuth(): UseAuthReturn {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // 初始化时从 localStorage 加载用户数据
  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");

    if (storedData && token) {
      try {
        const parsedData = JSON.parse(storedData);
        console.log("parsedData:", parsedData);

        setUserData(parsedData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("解析用户数据失败:", error);
        logout();
      }
    }
  }, []);

  // 登录方法
  const login = useCallback(
    async (identifier: string, password: string) => {
      try {
        const response = await http.post<UserData>("/api/login", {
          identifier,
          password,
        });

        localStorage.setItem("token", response.token);
        localStorage.setItem("userData", JSON.stringify(response));

        setUserData(response);
        setIsAuthenticated(true);

        // 使用 window.location.href 强制页面刷新
        window.location.href = "/dashboard/home";
      } catch (error) {
        console.error("登录失败:", error);
        throw error;
      }
    },
    [router],
  );

  // 登出方法
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUserData(null);
    setIsAuthenticated(false);

    // 使用 window.location.href 强制页面刷新
    window.location.href = "/dashboard/login";
  }, [router]);

  // 更新用户数据方法
  const updateUserData = useCallback(
    (data: Partial<UserData>) => {
      if (userData) {
        const updatedData = { ...userData, ...data };
        localStorage.setItem("userData", JSON.stringify(updatedData));
        setUserData(updatedData);
      }
    },
    [userData],
  );

  return {
    userEmail: userData?.email ?? null,
    userId: userData?.id ?? null,
    userData,
    isAuthenticated,
    login,
    logout,
    updateUserData,
  };
}
