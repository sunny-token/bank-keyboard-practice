"use client";

import { useAuth } from "@/app/hooks/useAuth";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "../../components/ui/navigation-menu";
import { Button } from "../../components/ui/button";

export default function Navbar() {
  const { userEmail, logout } = useAuth();

  return (
    <div className="bg-white shadow dark:bg-gray-900 w-full">
      <div className="flex justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center flex-shrink-0">
          <Link href="/dashboard/home" className="text-xl font-bold">
            银行数字键盘训练系统
          </Link>
        </div>
        <div className="flex items-center">
          {userEmail ? (
            <NavigationMenu>
              <NavigationMenuList className="flex items-center space-x-4">
                <NavigationMenuItem>
                  <span className="text-gray-700 dark:text-gray-200">
                    {userEmail}
                  </span>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Button variant="secondary" onClick={logout}>
                    登出
                  </Button>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <div className="flex items-center space-x-4"></div>
          )}
        </div>
      </div>
    </div>
  );
}
