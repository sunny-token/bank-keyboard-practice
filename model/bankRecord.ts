import { BaseModel } from "./baseModel";
import { Prisma, BankRecord } from "@prisma/client";

export class BankRecordModel extends BaseModel<"bankRecord"> {
  constructor() {
    super("bankRecord");
  }

  // 创建新的练习记录
  async createRecord(data: {
    userId: number;
    correctCount: number;
    accuracy: number;
    duration: number;
    wpm: number;
  }) {
    return await this.create({
      ...data,
      completedAt: new Date(),
    });
  }

  // 获取用户的练习记录
  async getUserRecords(
    userId: number,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.BankRecordOrderByWithRelationInput;
    },
  ) {
    return await this.findMany({
      where: { userId },
      ...options,
    });
  }

  // 获取用户的练习统计信息
  async getUserStats(userId: number) {
    const records = await this.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });

    if (records.length === 0) {
      return {
        totalSessions: 0,
        averageAccuracy: 0,
        averageWpm: 0,
        bestWpm: 0,
        totalDuration: 0,
      };
    }

    const totalSessions = records.length;
    const averageAccuracy =
      records.reduce(
        (acc: number, record: BankRecord) => acc + record.accuracy,
        0,
      ) / totalSessions;
    const averageWpm =
      records.reduce((acc: number, record: BankRecord) => acc + record.wpm, 0) /
      totalSessions;
    const bestWpm = Math.max(
      ...records.map((record: BankRecord) => record.wpm),
    );
    const totalDuration = records.reduce(
      (acc: number, record: BankRecord) => acc + record.duration,
      0,
    );

    return {
      totalSessions,
      averageAccuracy,
      averageWpm,
      bestWpm,
      totalDuration,
    };
  }

  // 删除用户的练习记录
  async deleteUserRecords(userId: number) {
    return await this.deleteMany({ userId });
  }
}
export const bankRecordModel = new BankRecordModel();
