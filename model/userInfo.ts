import { BaseModel } from "@/model/baseModel";
import { Prisma } from "@prisma/client";

export class UserInfoModel extends BaseModel<"userInfo"> {
  constructor() {
    super("userInfo");
  }

  // 根据用户ID获取用户信息
  async getUserInfoByUserId(userId: number) {
    return this.findFirst({ id: userId });
  }

  // 创建用户信息
  async createUserInfo(data: Prisma.UserInfoCreateInput) {
    return this.create(data);
  }

  // 更新用户信息
  async updateUserInfo(userId: number, data: Prisma.UserInfoUpdateInput) {
    return this.update({ id: userId }, data);
  }

  // 获取所有用户信息
  async getAllUserInfo() {
    return this.findMany();
  }

  // 删除用户信息
  async deleteUserInfo(userId: number) {
    return this.deleteMany({ id: userId });
  }
}

// 导出单例实例
export const userInfoModel = new UserInfoModel();
