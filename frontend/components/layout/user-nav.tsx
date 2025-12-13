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

// 10 Distinct Notion-style Avatars
const AVATARS = [
  "https://api.dicebear.com/7.x/notionists/svg?seed=Felix",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Milo",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Bella",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Lilly",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Leo",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Sam",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Max",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Chloe"
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
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}