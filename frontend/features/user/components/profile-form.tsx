"use client";

import React, { useEffect, useState } from "react";
import { useCurrentUser, useUpdateProfile } from "../hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

export function ProfileForm() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="space-y-2">
          <div className="h-4 w-[250px] animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-[200px] animate-pulse rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input 
            id="firstName" 
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            disabled={isPending}
            placeholder="John"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input 
            id="lastName" 
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            disabled={isPending}
            placeholder="Doe"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          value={user?.email || ''} 
          disabled 
          readOnly 
          className="bg-muted text-muted-foreground cursor-not-allowed" 
        />
        <p className="text-[0.8rem] text-muted-foreground">
          Email cannot be changed.
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
        Save Profile
      </Button>
    </form>
  );
}