// lib/prismaService.ts
// 提供 Prisma 客户端的单例实例，通用的数据库操作方法，以及辅助函数

import { PrismaClient, Prisma } from "@prisma/client";

const isServer = typeof window === "undefined";

class PrismaService {
  private static instance: PrismaService;
  private prisma: PrismaClient;
  private isConnected: boolean = false;

  private constructor() {
    if (!isServer) {
      throw new Error(
        "PrismaClient is unable to run in the browser environment",
      );
    }
    this.prisma = new PrismaClient({
      log: ["query", "info", "warn", "error"],
    });
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }

  // 连接管理
  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.prisma.$connect();
      this.isConnected = true;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.prisma.$disconnect();
      this.isConnected = false;
    }
  }

  // 通用的更新方法
  public async update<T extends object>(
    model: any,
    where: Prisma.Args<T, "update">["where"],
    data: Prisma.Args<T, "update">["data"],
  ) {
    try {
      const updateData = this.getUpdateData(data);
      return await model.update({
        where,
        data: updateData,
      });
    } catch (error) {
      this.handleError("update", error);
      throw error;
    }
  }

  // 通用的 upsert 方法
  public async upsert<T extends object>(
    model: any,
    where: Prisma.Args<T, "upsert">["where"],
    create: Prisma.Args<T, "upsert">["create"],
    update: Prisma.Args<T, "upsert">["update"],
  ) {
    try {
      const createOption = {
        ...create,
        createdAt: new Date(),
      };

      const updateOption = {
        ...update,
        updatedAt: new Date(),
      };

      const result = await model.upsert({
        where,
        create: createOption,
        update: updateOption,
      });

      return result;
    } catch (error) {
      this.handleError("upsert", error);
      throw error;
    }
  }

  // 批量操作方法
  public async createMany<T extends object>(
    model: any,
    data: Prisma.Args<T, "createMany">["data"],
  ) {
    try {
      return await model.createMany({
        data: data.map((item: T) => ({
          ...item,
          createdAt: new Date(),
        })),
      });
    } catch (error) {
      this.handleError("createMany", error);
      throw error;
    }
  }

  public async updateMany<T extends object>(
    model: any,
    where: Prisma.Args<T, "updateMany">["where"],
    data: Prisma.Args<T, "updateMany">["data"],
  ) {
    try {
      return await model.updateMany({
        where,
        data: this.getUpdateData(data),
      });
    } catch (error) {
      this.handleError("updateMany", error);
      throw error;
    }
  }

  public async deleteMany<T extends object>(
    model: any,
    where: Prisma.Args<T, "deleteMany">["where"],
  ) {
    try {
      return await model.deleteMany({ where });
    } catch (error) {
      this.handleError("deleteMany", error);
      throw error;
    }
  }

  // 查询方法增强
  public async findFirst<T extends object>(
    model: any,
    where: Prisma.Args<T, "findFirst">["where"],
    include?: Prisma.Args<T, "findFirst">["include"],
  ) {
    try {
      return await model.findFirst({ where, include });
    } catch (error) {
      this.handleError("findFirst", error);
      throw error;
    }
  }

  public async findMany<T extends object>(
    model: any,
    options?: Prisma.Args<T, "findMany">,
  ) {
    try {
      return await model.findMany(options);
    } catch (error) {
      this.handleError("findMany", error);
      throw error;
    }
  }

  // 辅助方法
  private getUpdateData<T extends object>(data: T): T & { updatedAt: Date } {
    return {
      ...data,
      updatedAt: new Date(),
    };
  }

  private handleError(operation: string, error: any): void {
    console.error(`Error in ${operation} operation:`, {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
  }

  // 事务方法增强
  public async transaction<T>(
    callback: (
      tx: Omit<
        PrismaClient,
        | "$connect"
        | "$disconnect"
        | "$on"
        | "$transaction"
        | "$use"
        | "$extends"
      >,
    ) => Promise<T>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(callback, options);
    } catch (error) {
      this.handleError("transaction", error);
      throw error;
    }
  }

  // 聚合方法
  public async aggregate<T extends object>(
    model: any,
    args: Prisma.Args<T, "aggregate">,
  ) {
    try {
      return await model.aggregate(args);
    } catch (error) {
      this.handleError("aggregate", error);
      throw error;
    }
  }

  public async groupBy<T extends object>(
    model: any,
    args: Prisma.Args<T, "groupBy">,
  ) {
    try {
      return await model.groupBy(args);
    } catch (error) {
      this.handleError("groupBy", error);
      throw error;
    }
  }
}

// 导出单例实例
const prismaService = PrismaService.getInstance();
export default prismaService;
