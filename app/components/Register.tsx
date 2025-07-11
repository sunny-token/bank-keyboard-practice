"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { userInfoModel } from "@/model/userInfo";
import bcrypt from "bcryptjs";
import { http } from "@/lib/request";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await http.post("/api/userInfo", {
        username,
        email,
        password: hashedPassword,
        role: "user",
        visitCount: 0,
      });

      console.log("user:", user);

      // 注册成功，直接跳转到登录页
      router.push("/dashboard/login");
    } catch (err: any) {
      if (err.code === "P2002") {
        if (err.meta?.target?.includes("username")) {
          setError("用户名已存在");
        } else if (err.meta?.target?.includes("email")) {
          setError("邮箱已被注册");
        }
      } else {
        setError("注册失败，请稍后重试");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">注册新账号</CardTitle>
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">
            创建您的账号以开始练习
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleRegister}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="sr-only">
                  用户名
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  邮箱
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="邮箱"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  确认密码
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="确认密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-center text-red-500">{error}</div>
            )}
            <Button type="submit" className="w-full">
              注册
            </Button>
            <div className="text-sm text-center">
              <Link
                href="/dashboard/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                已有账号？立即登录
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
