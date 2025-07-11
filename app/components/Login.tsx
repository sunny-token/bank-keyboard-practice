"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || "登录失败，请稍后重试");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">登录账号</CardTitle>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">
            登录您的账号以继续练习
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="identifier" className="sr-only">
                  用户名/邮箱
                </label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  required
                  placeholder="用户名/邮箱"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  密码
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-center text-red-500">{error}</div>
            )}
            <Button type="submit" className="w-full">
              登录
            </Button>
            <div className="text-sm text-center">
              <Link
                href="/dashboard/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                没有账号？立即注册
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
