"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

// 10 Distinct Notion-style Avatars
const AVATARS = [
  "https://api.dicebear.com/7.x/thumbs/svg?seed=owl&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=fox&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=panda&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=cat&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=dog&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=bear&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=koala&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=lion&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=monkey&backgroundColor=000000&shapeColor=ffffff",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=penguin&backgroundColor=000000&shapeColor=ffffff"
];


interface UserNavProps {
  email: string | null | undefined;
}

export function UserNav({ email }: UserNavProps) {
  const safeEmail = email || "user@example.com";
  
  // Deterministically pick 1 of 10 images based on email characters
  const getAvatarIndex = (email: string) => {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % AVATARS.length;
  };

  const avatarUrl = AVATARS[getAvatarIndex(safeEmail)];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border p-0 hover:bg-muted overflow-hidden">
          <img
            src={avatarUrl}
            alt={safeEmail}
            className="h-full w-full object-cover bg-muted"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground">
              {safeEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="w-full cursor-pointer flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="w-full cursor-pointer flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}