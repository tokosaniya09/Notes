"use client";

import { useCollaborationStore } from "../store";
import { useCurrentUser } from "@/features/user/hooks";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Deterministic avatar based on name/id
const getAvatarUrl = (seed: string) => `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;

export function PresenceAvatars() {
  const { users, cursors, selfId } = useCollaborationStore();
  const { data: currentUser } = useCurrentUser();
  const [now, setNow] = useState(Date.now());

  // Update time every second to expire "typing" status visual
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter self out
  const otherUsers = users.filter(u => u.userId !== selfId);

  if (otherUsers.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden py-1 px-1">
      <TooltipProvider>
        {otherUsers.map((user) => {
          const cursor = cursors[user.userId];
          // User is "typing" if their cursor updated in the last 2 seconds
          const isTyping = cursor && (now - cursor.lastUpdated < 2000);

          return (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                      "relative inline-block h-8 w-8 rounded-full border-2 border-background transition-all hover:z-10 hover:scale-110 cursor-default",
                      isTyping && "ring-2 ring-offset-1 ring-offset-background",
                  )}
                  style={{ 
                    backgroundColor: user.color || '#ccc',
                    // Dynamic ring color matching user color
                    ['--tw-ring-color' as any]: isTyping ? user.color : 'transparent' 
                  }} 
                >
                   <img
                      src={getAvatarUrl(user.userName)}
                      alt={user.userName}
                      className="h-full w-full rounded-full object-cover bg-background"
                   />
                   {/* Online status indicator */}
                   <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-background bg-green-500" />
                   
                   {/* Typing Pulse */}
                   {isTyping && (
                     <span className="absolute -top-1 -right-1 flex h-3 w-3">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                     </span>
                   )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {user.userName}
                  {isTyping && <span className="text-muted-foreground ml-1">(typing...)</span>}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
      {otherUsers.length > 3 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-2 ring-background text-xs font-medium z-0">
          +{otherUsers.length - 3}
        </div>
      )}
    </div>
  );
}