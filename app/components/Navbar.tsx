"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "../../components/ui/navigation-menu";
import { Button } from "../../components/ui/button";
import { usePracticeSettings } from "@/app/store/practiceSettings";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const { userEmail, logout } = useAuth();
  const {
    minLength,
    maxLength,
    timeLimit,
    questionsPerSession,
    setMinLength,
    setMaxLength,
    setTimeLimit,
    setQuestionsPerSession,
  } = usePracticeSettings();

  return (
    <div className="bg-white shadow dark:bg-gray-900 w-full">
      <div className="flex justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-shrink-0">
          <Link href="/dashboard/home" className="text-xl font-bold">
            银行数字键盘训练系统
          </Link>
        </div>
        <div className="flex items-center gap-4 flex-nowrap overflow-x-auto">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-indigo-700">数字长度</Label>
            <Input
              type="number"
              min="1"
              max={maxLength}
              value={minLength}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value > 0 && value <= maxLength) {
                  setMinLength(value);
                }
              }}
              className="w-10 px-1 py-0.5 text-xs border border-indigo-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <span className="text-xs text-gray-400">-</span>
            <Input
              type="number"
              min={minLength}
              max="20"
              value={maxLength}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= minLength && value <= 20) {
                  setMaxLength(value);
                }
              }}
              className="w-10 px-1 py-0.5 text-xs border border-indigo-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-pink-700">时间(分)</Label>
            <Input
              type="number"
              min="1"
              max="60"
              value={timeLimit / (60 * 1000)}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 60) {
                  setTimeLimit(value * 60 * 1000);
                }
              }}
              className="w-12 px-1 py-0.5 text-xs border border-pink-200 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-green-700">题数</Label>
            <Input
              type="number"
              min="1"
              max="200"
              value={questionsPerSession}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value >= 1 && value <= 200) {
                  setQuestionsPerSession(value);
                }
              }}
              className="w-14 px-1 py-0.5 text-xs border border-green-200 rounded focus:outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>
        </div>
        <div className="flex items-center">
          {userEmail ? (
            <NavigationMenu>
              <NavigationMenuList className="flex items-center space-x-4">
                <NavigationMenuItem>
                  <span className="text-gray-700 dark:text-gray-200">
                    {userEmail}
                  </span>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="secondary" onClick={logout}>
                    登出
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <div className="flex items-center space-x-4"></div>
          )}
        </div>
      </div>
    </div>
  );
}
