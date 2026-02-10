
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Key, Eye, EyeOff, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import axios from "axios";
import api from "@/lib/api"; // Added shared API import
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Local API configuration removed in favor of shared @/lib/api

type LoginResponse = {
    result: string;
    user?: Array<{
        user_id: number;
        first_name: string;
        last_name: string;
        employee_id: string;
        email: string;
        role_id: number;
        role_name: string;
    }>;
    accessToken?: string;
    code: string;
};

export default function Login() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const trimmed = identifier.trim();

        if (!trimmed) {
            setError("Please enter your email");
            setLoading(false);
            return;
        }

        const payload = {
            email: trimmed,
            password,
        };

        try {
            console.log("[LOGIN] Sending request →", payload);

            const res = await api.post<LoginResponse>("/user/login", payload);

            console.log("[LOGIN] Response status:", res.status);
            console.log("[LOGIN] Response data:", res.data);

            if (res.data.code !== "200") {
                throw new Error(res.data.result || "Login failed");
            }

            const { accessToken, user } = res.data;

            if (!accessToken) {
                throw new Error("No access token received");
            }

            if (!user || user.length === 0) {
                console.warn("[LOGIN] No user data in response");
            }

            // Save real token + user data using the updated auth helper
            login(accessToken, user && user.length > 0 ? user[0] : {
                user_id: 0,
                first_name: 'User',
                last_name: '',
                employee_id: '',
                email: trimmed,
                role_id: 0,
                role_name: 'User'
            });

            console.log("[LOGIN] Auth state saved successfully");
            console.log("[LOGIN] Navigating to:", from);

            navigate(from, { replace: true });
        } catch (err: unknown) {
            let message = "Something went wrong. Please try again.";

            if (err instanceof Error) {
                message = err.message;
            }

            if (axios.isAxiosError(err)) {
                const axiosErr = err as import("axios").AxiosError;
                const status = axiosErr.response?.status;
                const data = axiosErr.response?.data as { result?: string } | undefined;

                if (status === 401) {
                    message = "Incorrect email or password";
                } else if (status === 400 || status === 500) {
                    message = data?.result || "Server error – please try later";
                } else if (data?.result) {
                    message = data.result;
                }
            }

            setError(message);
            console.error("[LOGIN] Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex relative bg-background overflow-hidden">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Left Column - Decorative */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 relative bg-primary/5 flex-col justify-center items-center p-12 overflow-hidden"
            >
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
                    <div className="absolute top-1/2 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-60" />
                    <div className="absolute bottom-0 left-1/4 w-full h-64 bg-primary/10 rounded-full blur-3xl opacity-40 transform translate-y-1/2" />
                </div>

                <div className="relative z-10 max-w-lg text-center lg:text-left space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl backdrop-blur-sm">
                                <Shield className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-foreground">Backup Buddy</h1>
                        </div>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Monitor your backups with confidence. Secure, reliable, and real-time dashboard for your critical data infrastructure.
                        </p>
                    </motion.div>

                    <div className="space-y-4 pt-4">
                        {[
                            "Real-time backup monitoring",
                            "Secure role-based access",
                            "Comprehensive audit logs"
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex items-center gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="text-muted-foreground font-medium">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Right Column - Login Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
                        <CardHeader className="space-y-1 text-center pb-8">
                            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your dashboard
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20 flex items-center gap-2"
                                >
                                    <Shield className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            autoComplete="email"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="pl-9 h-11"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            placeholder="••••••••"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9 pr-9 h-11"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing in...
                                        </span>
                                    ) : "Sign In"}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground mt-4">
                            <Separator className="w-full opacity-50" />
                            <p>
                                Protected by enterprise grade security. <br />
                                Please contact IT support if you have trouble logging in.
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
