"use client";

import { useEffect, useState } from "react";
import { useCurrentUser, useUpdatePreferences } from "../hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Moon, Sun, Laptop } from "lucide-react";

export function PreferencesForm() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: updatePreferences, isPending } = useUpdatePreferences();
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    if (user?.preferences?.theme) {
      setTheme(user.preferences.theme as any);
    }
  }, [user]);

  const handleSave = () => {
    updatePreferences({
      preferences: {
        ...user?.preferences,
        theme,
      }
    });
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label>Interface Theme</Label>
        <div className="grid grid-cols-3 gap-3">
          <ThemeCard 
            label="Light" 
            icon={<Sun className="h-6 w-6" />} 
            active={theme === 'light'} 
            onClick={() => setTheme('light')}
          />
          <ThemeCard 
            label="Dark" 
            icon={<Moon className="h-6 w-6" />} 
            active={theme === 'dark'} 
            onClick={() => setTheme('dark')}
          />
          <ThemeCard 
            label="System" 
            icon={<Laptop className="h-6 w-6" />} 
            active={theme === 'system'} 
            onClick={() => setTheme('system')}
          />
        </div>
        <p className="text-[0.8rem] text-muted-foreground">
          Select your preferred appearance for the application.
        </p>
      </div>

      <Button onClick={handleSave} disabled={isPending || theme === user?.preferences?.theme}>
        {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Update Preferences
      </Button>
    </div>
  );
}

function ThemeCard({ label, icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground transition-all flex flex-col items-center gap-2",
        active && "border-primary bg-accent"
      )}
    >
      <div className={cn("text-muted-foreground", active && "text-foreground")}>
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
