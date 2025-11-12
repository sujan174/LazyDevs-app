"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update Firebase auth profile with display name
      await updateProfile(user, {
        displayName: name,
      });

      // Create user document in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        name: name,
        email: email,
        displayName: name,
        createdAt: new Date(),
      });

      console.log("Account created successfully!");
      router.push("/");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError("Failed to create an account. Please try again.");
        console.error("Firebase SignUp Error:", error);
      }
    }
  };

  return (
    <main className="auth-container">
      <Card className="auth-card fade-in-scale">
        <CardHeader className="auth-card-header">
          {/* Aerius Logo */}
          <div className="mb-8 flex justify-center slide-in-down">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105">
                <span className="text-white font-bold text-2xl">A</span>
              </div>
              <span className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                Aerius
              </span>
            </div>
          </div>
          <CardTitle className="auth-card-title slide-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}>Create an Account</CardTitle>
          <CardDescription className="auth-card-description slide-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}>
            Join Aerius to transform your meeting workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="auth-card-content">
          <form onSubmit={handleSignUp} className="grid gap-5">
            <div className="grid gap-2 slide-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field h-12 text-base"
              />
            </div>
            <div className="grid gap-2 slide-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}>
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field h-12 text-base"
              />
            </div>
            <div className="grid gap-2 slide-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}>
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field h-12 text-base"
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg slide-in-up">
                <p className="text-destructive text-sm font-medium">{error}</p>
              </div>
            )}
            <Button type="submit" className="w-full btn-primary h-12 text-base font-semibold slide-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}>
              Create Account
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground slide-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}>
            Already have an account?{" "}
            <Link href="/login" className="link font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

