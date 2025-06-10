import { NextResponse } from "next/server";
import { userInfoModel } from "@/model/userInfo";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "用户名/邮箱和密码不能为空" },
        { status: 400 },
      );
    }

    // 查找用户（通过用户名或邮箱）
    const user = await userInfoModel.findFirst({
      OR: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    // 生成 JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    // 返回用户信息和 token（不包含密码）
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({
      ...userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 },
    );
  }
}
