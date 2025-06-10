"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";

export default function Navbar() {
  const { userEmail, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex items-center flex-shrink-0">
              <Link
                href="/dashboard/home"
                className="text-xl font-bold text-indigo-600"
              >
                银行键盘练习
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {userEmail ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{userEmail}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4"></div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
