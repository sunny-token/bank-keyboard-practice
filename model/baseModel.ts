import { Prisma, PrismaClient } from "@prisma/client";

// app/models/baseModel.ts
// 基础model类，提供通用的CRUD操作

import prismaService from "@/lib/prismaService";

type PrismaModels = keyof Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class BaseModel<T extends PrismaModels> {
  protected prisma: PrismaClient;
  protected model: any;

  constructor(protected modelName: T) {
    this.prisma = prismaService.getPrismaClient();
    this.model = this.prisma[this.modelName];
  }

  private handleError(operation: string, error: any): never {
    console.error(`Error in ${operation} for ${String(this.modelName)}:`, {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    throw error;
  }

  async create<D>(data: D) {
    try {
      return await this.model.create({ data });
    } catch (error) {
      this.handleError("create", error);
    }
  }

  async update<W, D>(where: W, data: D) {
    try {
      return await prismaService.update(this.model, where, data);
    } catch (error) {
      this.handleError("update", error);
    }
  }

  async upsert<W, C, U>(where: W, create: C, update: U) {
    try {
      return await prismaService.upsert(this.model, where, create, update);
    } catch (error) {
      this.handleError("upsert", error);
    }
  }

  async findFirst<W, I = undefined>(where: W, include?: I) {
    try {
      return await prismaService.findFirst(this.model, where, include);
    } catch (error) {
      this.handleError("findFirst", error);
    }
  }

  async findMany<O = undefined>(options?: O) {
    try {
      return await prismaService.findMany(this.model, options);
    } catch (error) {
      this.handleError("findMany", error);
    }
  }

  async findUnique<W, I = undefined>(where: W, include?: I) {
    try {
      return await this.model.findUnique({
        where,
        include,
      });
    } catch (error) {
      this.handleError("findUnique", error);
    }
  }

  async getById(id: string) {
    try {
      const item = await this.findUnique({ id });
      if (!item) {
        throw new Error(`${String(this.modelName)} with id ${id} not found`);
      }
      return item;
    } catch (error) {
      this.handleError("getById", error);
    }
  }

  async updateById(id: string, data: any) {
    try {
      return await this.update({ id }, data);
    } catch (error) {
      this.handleError("updateById", error);
    }
  }

  async deleteById(id: string) {
    try {
      return await this.model.delete({ where: { id } });
    } catch (error) {
      this.handleError("deleteById", error);
    }
  }

  async deleteMany<W>(where: W) {
    try {
      return await prismaService.deleteMany(this.model, where);
    } catch (error) {
      this.handleError("deleteMany", error);
    }
  }

  async count<O = undefined>(options?: O): Promise<number> {
    try {
      return await this.model.count(options);
    } catch (error) {
      this.handleError("count", error);
    }
  }

  async transaction<R>(
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
    ) => Promise<R>,
  ): Promise<R> {
    try {
      return await prismaService.transaction(callback);
    } catch (error) {
      this.handleError("transaction", error);
    }
  }

  async aggregate<A>(args: A) {
    try {
      return await prismaService.aggregate(this.model, args);
    } catch (error) {
      this.handleError("aggregate", error);
    }
  }

  async groupBy<G>(args: G) {
    try {
      return await prismaService.groupBy(this.model, args);
    } catch (error) {
      this.handleError("groupBy", error);
    }
  }
}
