"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { useSearchParams, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { toast } from "sonner" 
import { Eye, EyeOff } from "lucide-react"

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  mode?: "login" | "register"
}

export function UserAuthForm({ className, mode = "login", ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false)
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)

    const target = event.target as typeof event.target & {
      email: { value: string }
      password: { value: string }
      firstName?: { value: string }
      lastName?: { value: string }
    }

    const email = target.email.value
    const password = target.password.value
    
    // VALIDATION
    if (!email || !password) {
      setIsLoading(false)
      return toast.error("Please fill in all fields")
    }

    if (password.length < 6) {
      setIsLoading(false)
      return toast.error("Password must be at least 6 characters")
    }

    try {
      if (mode === "register") {
        const firstName = target.firstName?.value
        const lastName = target.lastName?.value

        if (!firstName) {
            setIsLoading(false)
            return toast.error("First Name is required")
        }

        // Call Backend Register Endpoint directly
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName, lastName })
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.message || "Registration failed")
        }

        toast.success("Account created! Logging in...")
        
        // Auto login after register
        const result = await signIn("credentials", {
            email,
            password,
            callbackUrl: searchParams?.get("from") || "/dashboard",
            redirect: false,
        })

        if (result?.error) {
            toast.error("Login failed. Please try again.")
        } else {
             router.push("/dashboard")
        }

      } else {
        // LOGIN MODE
        const result = await signIn("credentials", {
            email,
            password,
            callbackUrl: searchParams?.get("from") || "/dashboard",
            redirect: false,
        })

        if (result?.error) {
            toast.error("Invalid credentials")
        } else {
            router.push("/dashboard")
        }
      }
    } catch (error: any) {
        toast.error(error.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setIsGoogleLoading(true)
    try {
      await signIn("google", {
        callbackUrl: searchParams?.get("from") || "/dashboard",
      })
    } catch (error) {
      toast.error("Google sign in failed")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          
          {mode === "register" && (
             <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name*</Label>
                    <Input id="firstName" name="firstName" placeholder="John" required disabled={isLoading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Doe" disabled={isLoading} />
                </div>
             </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              name="email" 
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading || isGoogleLoading}
              required
            />
          </div>

          <div className="grid gap-2">
             <Label htmlFor="password">Password*</Label>
             <div className="relative">
                <Input
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoCorrect="off"
                    disabled={isLoading || isGoogleLoading}
                    required
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                </Button>
             </div>
          </div>
          
          <Button disabled={isLoading || isGoogleLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === "register" ? "Create Account" : "Sign In"}
          </Button>
        </div>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
            Or continue with
            </span>
        </div>
        </div>
        <Button
        variant="outline"
        type="button"
        disabled={isLoading || isGoogleLoading}
        onClick={loginWithGoogle}
        >
        {isGoogleLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
            <Icons.google className="mr-2 h-4 w-4" />
        )}
        Google
        </Button>
    </div>
  )
}