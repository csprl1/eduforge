// app/(auth)/login/page.tsx
// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Sparkles, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { loginSchema, type LoginInput } from "@/lib/validations";
// import { toast } from "@/components/ui/toaster";

// // Inline zodResolver since @hookform/resolvers may need install
// function zodResolver(schema: { parse: (data: unknown) => unknown; safeParse: (data: unknown) => { success: boolean; error?: { errors: { path: (string | number)[]; message: string }[] } } }) {
//   return async (data: unknown) => {
//     const result = schema.safeParse(data);
//     if (result.success) return { values: data, errors: {} };
//     const errors: Record<string, { type: string; message: string }> = {};
//     result.error?.errors.forEach((err) => {
//       const path = err.path.join(".");
//       if (path) errors[path] = { type: "validation", message: err.message };
//     });
//     return { values: {}, errors };
//   };
// }

// export default function LoginPage() {
//   const router = useRouter();
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<LoginInput>({
//     resolver: zodResolver(loginSchema) as never,
//   });

//   const onSubmit = async (data: LoginInput) => {
//     setLoading(true);
//     setError("");
//     try {
//       const result = await signIn("credentials", {
//         email: data.email,
//         password: data.password,
//         redirect: false,
//       });

//       if (result?.error) {
//         setError("Invalid email or password. Try: student@eduforge.dev / Student@123");
//       } else {
//         toast({ title: "Welcome back!", variant: "success" });
//         router.push("/dashboard");
//         router.refresh();
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center px-4 py-16">
//       {/* Background */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
//       </div>

//       <div className="relative w-full max-w-md animate-slide-up">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <Link href="/" className="inline-flex items-center gap-2.5 group">
//             <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
//               <Sparkles className="h-5 w-5 text-white" />
//             </div>
//             <span className="font-display text-2xl font-bold text-white">
//               Edu<span className="text-indigo-400">Forge</span>
//             </span>
//           </Link>
//           <h1 className="mt-6 text-3xl font-bold text-white">Welcome back</h1>
//           <p className="mt-2 text-slate-400">Sign in to continue learning</p>
//         </div>

//         {/* Card */}
//         <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
//           {error && (
//             <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
//               {error}
//             </div>
//           )}

//           {/* Demo Credentials */}
//           <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
//             <p className="text-xs font-semibold text-amber-400 mb-2">Demo Credentials</p>
//             <div className="space-y-1 text-xs text-amber-300/80 font-mono">
//               <p>student@eduforge.dev / Student@123</p>
//               <p>instructor@eduforge.dev / Instructor@123</p>
//               <p>admin@eduforge.dev / Admin@123</p>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             <div className="space-y-1.5">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="you@example.com"
//                 autoComplete="email"
//                 {...register("email")}
//               />
//               {errors.email && (
//                 <p className="text-xs text-red-400">{errors.email.message}</p>
//               )}
//             </div>

//             <div className="space-y-1.5">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   autoComplete="current-password"
//                   className="pr-10"
//                   {...register("password")}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
//                 >
//                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-xs text-red-400">{errors.password.message}</p>
//               )}
//             </div>

//             <Button
//               type="submit"
//               className="w-full"
//               size="lg"
//               loading={loading}
//             >
//               Sign in <ArrowRight className="h-4 w-4" />
//             </Button>
//           </form>

//           <p className="mt-6 text-center text-sm text-slate-500">
//             Don&apos;t have an account?{" "}
//             <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
//               Create one free
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";
import {
  loginSchema,
  type LoginInput,
} from "@/lib/validations";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Invalid email or password. Try: student@eduforge.dev / Student@123"
        );
        return;
      }

      toast({
        title: "Welcome back!",
        variant: "success",
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <span className="font-display text-2xl font-bold text-white">
              Edu<span className="text-indigo-400">Forge</span>
            </span>
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-white">
            Welcome back
          </h1>

          <p className="mt-2 text-slate-400">
            Sign in to continue learning
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="mb-2 text-xs font-semibold text-amber-400">
              Demo Credentials
            </p>

            <div className="space-y-1 font-mono text-xs text-amber-300/80">
              <p>student@eduforge.dev / Student@123</p>
              <p>instructor@eduforge.dev / Instructor@123</p>
              <p>admin@eduforge.dev / Admin@123</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                  {...register("password")}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}