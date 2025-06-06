"use client";

import { useState, useEffect } from "react";

interface VisitRecord {
  ip: string;
  timestamp: string;
  count: number;
}

export default function VisitCounter() {
  const [visitInfo, setVisitInfo] = useState<VisitRecord | null>(null);

  useEffect(() => {
    // 从localStorage获取访问记录
    const storedInfo = localStorage.getItem("visitInfo");
    if (storedInfo) {
      setVisitInfo(JSON.parse(storedInfo));
    }

    // 获取IP地址
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        const now = new Date().toISOString();
        const newInfo: VisitRecord = {
          ip: data.ip,
          timestamp: now,
          count: storedInfo ? JSON.parse(storedInfo).count + 1 : 1,
        };
        localStorage.setItem("visitInfo", JSON.stringify(newInfo));
        setVisitInfo(newInfo);
      })
      .catch((error) => {
        console.error("获取IP地址失败:", error);
      });
  }, []);

  if (!visitInfo) {
    return null;
  }

  return (
    <div className="p-4 mt-8 text-sm text-center text-gray-500 border-t border-gray-200">
      <p>
        访问IP: {visitInfo.ip} | 访问时间:{" "}
        {new Date(visitInfo.timestamp).toLocaleString()} | 访问次数:{" "}
        {visitInfo.count}
      </p>
    </div>
  );
}
