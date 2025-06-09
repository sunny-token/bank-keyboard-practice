"use client";

import { useState, useEffect } from "react";
import { http } from "@/lib/request";
import { useAuth } from "@/app/hooks/useAuth";

interface VisitRecord {
  ip: string;
  timestamp: string;
  count: number;
  location?: string;
}

interface UserInfo {
  id: number;
  ip: string;
  visitCount: number;
}

export default function VisitCounter() {
  const [visitInfo, setVisitInfo] = useState<VisitRecord | null>(null);
  const { userEmail } = useAuth();

  useEffect(() => {
    const fetchAndUpdateVisitInfo = async () => {
      try {
        // 获取IP地址
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        const now = new Date().toISOString();

        // 获取IP地理位置信息
        const locationResponse = await fetch(
          `https://ipapi.co/${ipData.ip}/json/`,
        );
        const locationData = await locationResponse.json();
        const location = `${locationData.country_name} ${locationData.city}`;

        if (userEmail === null) {
          return;
        }

        // 先获取数据库中的用户信息
        const userInfoResponse = await http.get<UserInfo>(
          `/api/userInfo?email=${userEmail}`,
        );

        console.log("userInfoResponse:", userInfoResponse);

        // 更新用户访问信息
        const response = await http.put<UserInfo>(
          `/api/userInfo?email=${userEmail}`,
          {
            ip: ipData.ip,
            visitCount: { increment: 1 },
          },
        );

        const newInfo: VisitRecord = {
          ip: ipData.ip,
          timestamp: now,
          count: response.visitCount,
          location: location,
        };
        setVisitInfo(newInfo);
      } catch (error) {
        console.error("获取或更新访问信息失败:", error);
      }
    };

    fetchAndUpdateVisitInfo();
  }, [userEmail]);

  if (!visitInfo) {
    return null;
  }

  return (
    <div className="p-4 mt-8 text-sm text-center text-gray-500 border-t border-gray-200">
      <p>
        访问IP: {visitInfo.ip} | 访问地区: {visitInfo.location} | 访问时间:{" "}
        {new Date(visitInfo.timestamp).toLocaleString()} | 访问次数:{" "}
        {visitInfo.count}
      </p>
    </div>
  );
}
