import { NextResponse } from "next/server";
import { userInfoModel } from "@/model/userInfo";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET 请求处理 - 获取用户信息
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      // 获取特定用户信息
      const userInfo = await userInfoModel.getUserInfoByEmail(email);
      return NextResponse.json(userInfo);
    } else {
      // 获取所有用户信息
      const allUsers = await userInfoModel.getAllUserInfo();
      return NextResponse.json(allUsers);
    }
  } catch (error) {
    return NextResponse.json({ error: "获取用户信息失败" }, { status: 500 });
  }
}

// POST 请求处理 - 创建用户信息
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 验证必要字段
    if (!data.username || !data.email) {
      return NextResponse.json(
        { error: "缺少必要字段：姓名和邮箱" },
        { status: 400 },
      );
    }

    const newUserInfo = await userInfoModel.createUserInfo(data);
    return NextResponse.json(newUserInfo);
  } catch (error) {
    // 处理唯一约束冲突
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }
    return NextResponse.json({ error: "创建用户信息失败" }, { status: 500 });
  }
}

// PUT 请求处理 - 更新用户信息
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const data = await request.json();

    if (!email) {
      return NextResponse.json({ error: "缺少邮箱" }, { status: 400 });
    }

    // 检查用户是否存在
    const existingUser = await userInfoModel.getUserInfoByEmail(email);
    if (!existingUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const updatedUserInfo = await userInfoModel.updateUserInfo(email, data);
    return NextResponse.json(updatedUserInfo);
  } catch (error) {
    return NextResponse.json({ error: "更新用户信息失败" }, { status: 500 });
  }
}

// DELETE 请求处理 - 删除用户信息
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "缺少邮箱" }, { status: 400 });
    }

    // 检查用户是否存在
    const existingUser = await userInfoModel.getUserInfoByEmail(email);
    if (!existingUser) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    await userInfoModel.deleteUserInfo(email);
    return NextResponse.json({ message: "用户信息删除成功" });
  } catch (error) {
    return NextResponse.json({ error: "删除用户信息失败" }, { status: 500 });
  }
}
