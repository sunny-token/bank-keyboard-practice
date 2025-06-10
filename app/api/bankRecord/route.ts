import { bankRecordModel } from "@/model/bankRecord";
import { NextRequest, NextResponse } from "next/server";

// 创建新的练习记录
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { correctCount, accuracy, duration, wpm, userId } = body;

    if (
      correctCount === null ||
      accuracy === null ||
      duration === null ||
      wpm === null ||
      userId === null
    ) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
    }

    const record = await bankRecordModel.createRecord({
      userId,
      correctCount,
      accuracy,
      duration,
      wpm,
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("创建记录失败:", error);
    return NextResponse.json({ error: "创建记录失败" }, { status: 500 });
  }
}

// 获取用户的练习记录
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const userId = parseInt(searchParams.get("userId") || "0");
    const skip = (page - 1) * pageSize;

    if (userId === null) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
    }

    const records = await bankRecordModel.getUserRecords(userId, {
      skip,
      take: pageSize,
      orderBy: { completedAt: "desc" },
    });

    const total = await bankRecordModel.count({
      where: { userId },
    });

    return NextResponse.json({
      records,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("获取记录失败:", error);
    return NextResponse.json({ error: "获取记录失败" }, { status: 500 });
  }
}
