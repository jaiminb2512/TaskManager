import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { authService, signInSchema, type SignInFormValues } from "../../services/authService";
import { Eye, EyeOff } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card";

// The signInSchema and SignInFormValues are now imported from authService.ts
// const signInSchema = z.object({
//     email: z.string().email({ message: "Please enter a valid email address." }),
//     password: z
//         .string()
//         .min(6, { message: "Password must be at least 6 characters long." }),
// });

// type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const navigate = useNavigate();

    async function onSubmit(data: SignInFormValues) {
        setIsLoading(true);
        try {
            const response = await authService.signIn(data);
            if (response.success) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.user));
                // Using a simple alert for now as no toast library was requested yet, 
                // but normally would use toast here.
                console.log("Login successful", response.data);
                navigate("/"); // Navigate to dashboard/home
            }
        } catch (error: any) {
            console.error("Login failed", error);
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            setError("root", { message: errorMessage });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 py-12 dark:from-slate-900 dark:to-slate-900 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">
                        Sign in
                    </CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {errors.root && (
                            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm border border-red-200">
                                {errors.root.message}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-600">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-blue-600 hover:text-blue-500 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>
                        <Button className="w-full" type="submit" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </form>
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="h-px w-full bg-slate-200"></div>
                        <span className="text-xs text-slate-500 uppercase">Or</span>
                        <div className="h-px w-full bg-slate-200"></div>
                    </div>
                    <div className="mt-4 text-center text-sm text-slate-600">
                        Don't have an account?{" "}
                        <Link
                            to="/signup"
                            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                        >
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
