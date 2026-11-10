'use client'

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { signIn } from "next-auth/react";

const LoginFormCLient = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        console.log("problem in login");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <form className="space-y-4" onSubmit={handleSignIn}>
      <div className="space-y-1.5 tracking-tighter">
        <label htmlFor="Email" className="text-sm font-medium text-[#0A1C0B]">
          Email <span className="text-red-500">*</span>
        </label>
        <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter your mail address"
          className="w-full"
        />
      </div>

      <div className="space-y-1.5 tracking-tight">
        <label
          htmlFor="Password"
          className="text-sm font-medium text-[#0A1C0B]"
        >
          Password <span className="text-red-500">*</span>
        </label>
        <Input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Enter password"
          className="w-full"
        />
      </div>

      {/* Remember me & Forgot Password */}
      {/* <div className="flex items-center justify-between text-sm py-1">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-700">
                  <input type="checkbox" className="rounded border-neutral-300 text-[#0A1C0B] focus:ring-[#0A1C0B]" />
                  Remember me
                </label>
                <Link href="/forgot-password" className="text-[#0A1C0B] font-medium hover:underline">
                  Forgot your password?
                </Link>
              </div> */}

      {/* Primary Action Button */}
      <Button
        type="submit"
        className="w-full bg-[#0A1C0B] hover:bg-[#163018] text-white py-6 rounded-md text-[1rem] tracking-tight transition-colors"
      >
        Log In
      </Button>
    </form>
  );
};

export default LoginFormCLient;
