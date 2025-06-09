import { BaseModel } from "@/model/baseModel";
import { Prisma } from "@prisma/client";

export class UserInfoModel extends BaseModel<"userInfo"> {
  constructor() {
    super("userInfo");
  }

  // 根据邮箱获取用户信息
  async getUserInfoByEmail(email: string) {
    return this.findFirst({ email });
  }

  // 创建用户信息
  async createUserInfo(data: Prisma.UserInfoCreateInput) {
    return this.create(data);
  }

  // 更新用户信息
  async updateUserInfo(email: string, data: Prisma.UserInfoUpdateInput) {
    return this.update({ email }, data);
  }

  // 获取所有用户信息
  async getAllUserInfo() {
    return this.findMany();
  }

  // 删除用户信息
  async deleteUserInfo(email: string) {
    return this.deleteMany({ email });
  }
}

// 导出单例实例
export const userInfoModel = new UserInfoModel();
