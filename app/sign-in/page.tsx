import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AuthButtons from "@/components/AuthButtons";
import LoginFormCLient from "@/components/LoginFormCLient";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    console.log((session as any).accessToken);
    redirect("/dashboard");
  }

  return (
    <main className="w-full min-h-screen bg-[#E6E5E4] p-4 md:p-8 flex items-center justify-center">
      {/* Main Container Card */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
        
        {/* Left Side: Form Section */}
        <div className="p-8 md:p-12 flex flex-col justify-center text-[#0A1C0B]">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Logo / Brand Header */}
            <div className="tracking-tight">
              <div className="w-10 h-10 bg-[#0A1C0B] rounded-lg flex items-center justify-center text-white font-bold mb-6 text-xl">
                C
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0A1C0B]">
                Welcome back!
              </h1>
              <p className="text-sm text-neutral-600 mt-1">
                Enter to get unlimited access to data & information.
              </p>
            </div>

            {/* Form Fields */}
            <LoginFormCLient />

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-4 text-xs text-neutral-400 uppercase tracking-wider">Or, Login with</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            {/* Github / OAuth Button */}
            <div className="w-full  border-[1px] tracking-tight cursor-pointer border-neutral-300 text-[#0A1C0B] hover:bg-neutral-50 py-2.5 rounded-lg flex items-center justify-center gap-2">
              <AuthButtons />
            </div>

            {/* Footer Sign Up prompt */}
            <p className="text-center tracking-tight text-sm text-neutral-600 pt-2">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#0A1C0B] font-semibold hover:underline">
                Register here
              </Link>
            </p>

          </div>
        </div>

        {/* Right Side: Graphic Illustration */}
        <div className="hidden lg:block relative bg-[#070b19] min-h-[600px]">
          <Image 
            src="/images/signin.jpg" 
            alt="Sign in illustration" 
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </main>
  );
}