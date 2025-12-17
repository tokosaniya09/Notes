
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { Globe, Copy, Check, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/features/notes/api";

interface ShareDialogProps {
  noteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isShared: boolean;
  onTogglePublicShare: (shared: boolean) => void;
  isUpdatingPublic: boolean;
  currentUserEmail?: string;
}

export function ShareDialog({
  noteId,
  open,
  onOpenChange,
  isShared,
  onTogglePublicShare,
  isUpdatingPublic,
  currentUserEmail,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  // Fetch Collaborators
  const { data: collaborators, isLoading: isLoadingCollabs } = useQuery({
    queryKey: ['collaborators', noteId],
    queryFn: () => notesApi.getCollaborators(noteId),
    enabled: open,
  });

  // Share Mutation
  const { mutate: inviteUser, isPending: isInviting } = useMutation({
    mutationFn: (email: string) => notesApi.share(noteId, email, 'EDIT'),
    onSuccess: () => {
        toast.success("Invitation sent");
        setEmail("");
        queryClient.invalidateQueries({ queryKey: ['collaborators', noteId] });
    },
    onError: (err) => toast.error(err.message || "Failed to invite user"),
  });

  // Revoke Mutation
  const { mutate: revokeUser, isPending: isRevoking } = useMutation({
    mutationFn: (userId: string) => notesApi.revoke(noteId, userId),
    onSuccess: () => {
        toast.success("Access revoked");
        queryClient.invalidateQueries({ queryKey: ['collaborators', noteId] });
    },
    onError: (err) => toast.error("Failed to revoke access"),
  });

  if (!open) return null;

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (email === currentUserEmail) {
        toast.error("You cannot invite yourself");
        return;
    }
    inviteUser(email);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
      <div 
        className="relative  z-50 grid mx-4 gap-4 border bg-card p-6 shadow-lg sm:rounded-lg animate-in zoom-in-95 fade-in duration-200"
      >
        <h3 className="text-lg font-semibold leading-none tracking-tight">
            Share Note
        </h3>

        {/* 1. Public Link Section */}
        <div className="border rounded-md p-4 space-y-3 bg-muted/20">
          {/* TOP ROW */}
          <div className="flex items-center justify-between gap-3">
            {/* LEFT CONTENT */}
            <div className="flex items-start gap-2 min-w-0">
              {isShared ? (
                <Globe className="h-5 w-5 text-blue-500 shrink-0" />
              ) : (
                <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
              )}

              <div className="min-w-0">
                <p className="text-sm font-medium">Public Access</p>
                <p className="text-xs text-muted-foreground truncate">
                  {isShared
                    ? "Anyone with link can view."
                    : "Only invited people can access."}
                </p>
              </div>
            </div>

            {/* BUTTON */}
            <Button
              variant={isShared ? "outline" : "default"}
              size="sm"
              onClick={() => onTogglePublicShare(!isShared)}
              disabled={isUpdatingPublic}
              className="shrink-0"
            >
              {isUpdatingPublic && (
                <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
              )}
              {isShared ? "Disable Link" : "Enable Link"}
            </Button>
          </div>

          {/* SHARE LINK */}
          {isShared && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex-1 h-8 rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground overflow-x-auto overflow-y-hidden whitespace-nowrap w-[10px]">
                {window.location.href}
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}
        </div>


        <div className="border-t my-1" />

        {/* 2. Invite People Section */}
        <div className="space-y-3">
            <p className="text-sm font-medium">People with access</p>
            
            <form onSubmit={handleInvite} className="flex gap-2">
                <Input 
                    placeholder="Add people by email..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9"
                />
                <Button type="submit" size="sm" disabled={!email || isInviting}>
                    {isInviting ? <Icons.spinner className="h-4 w-4 animate-spin" /> : "Invite"}
                </Button>
            </form>

            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {isLoadingCollabs ? (
                    <div className="flex justify-center p-4"><Icons.spinner className="h-4 w-4 animate-spin text-muted-foreground" /></div>
                ) : collaborators && collaborators.length > 0 ? (
                    collaborators.map((c) => (
                        <div key={c.userId} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {c.user.firstName[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{c.user.firstName}</p>
                                    <p className="text-xs text-muted-foreground">{c.user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                    {c.permission}
                                </span>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive transition-opacity"
                                    onClick={() => revokeUser(c.userId)}
                                    disabled={isRevoking}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No one else has access yet.</p>
                )}
            </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
