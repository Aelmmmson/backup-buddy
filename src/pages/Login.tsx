
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Shield, Clock, Calendar, CheckCircle2, Database, Server, HardDrive, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import api from "@/lib/api";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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
    const [isTermsOpen, setIsTermsOpen] = useState(false);

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
            const res = await api.post<LoginResponse>("/user/login", payload);

            if (res.data.code !== "200") {
                throw new Error(res.data.result || "Login failed");
            }

            const { accessToken, user } = res.data;

            if (!accessToken) {
                throw new Error("No access token received");
            }

            login(accessToken, user && user.length > 0 ? user[0] : {
                user_id: 0,
                first_name: 'User',
                last_name: '',
                employee_id: '',
                email: trimmed,
                role_id: 0,
                role_name: 'User'
            });

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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen h-[100dvh] w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-black/95 p-4 md:p-8 lg:p-12 overflow-hidden selection:bg-blue-200">
            <div className="absolute top-6 right-8 z-50">
                <ThemeToggle />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-[1100px] max-h-[90vh] bg-white dark:bg-zinc-900 rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative ring-1 ring-black/5 dark:ring-white/5"
            >
                {/* Left Section: Form */}
                <div className="w-full lg:w-5/12 p-8 md:p-10 lg:p-12 flex flex-col">
                    <div>
                        <div className="mb-3 flex items-center">
                            <div className="px-6 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center gap-2 group cursor-pointer hover:bg-zinc-50 transition-colors dark:hover:text-zinc-700">
                                <span className="font-bold text-sm tracking-tight">Backup Monitoring</span>
                            </div>
                        </div>

                        <div className="mb-5 text-center lg:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-0 tracking-tight">
                                Welcome Back
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-base font-medium">
                                Please enter your credentials to log in.
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-900 flex items-center gap-2 shadow-sm"
                            >
                                <Shield className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 ml-1">Email</Label>
                                <Input
                                    type="email"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="email@example.com"
                                    className="rounded-full h-14 px-7 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-blue-400/50 focus:border-blue-400 text-sm font-medium transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-[0.1em] text-zinc-400 ml-1">Password</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="rounded-full h-14 px-7 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 focus:ring-blue-400/50 focus:border-blue-400 text-sm font-medium transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-200/30 border-none transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    "Login"
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 flex flex-wrap justify-between items-center text-[10px] md:text-sm font-semibold text-zinc-400 tracking-wide uppercase">
                            <p className="text-[10px]">
                                Forgot account? <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-400 decoration-2 underline-offset-4 cursor-pointer text-[10px]">Recover here</span>
                            </p>
                            <span
                                onClick={() => setIsTermsOpen(true)}
                                className="cursor-pointer text-zinc-400 hover:text-blue-600 transition-colors underline underline-offset-4 text-[10px]"
                            >
                                Terms & Policy
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Section: Image & UI Overlays */}
                <div className="hidden lg:block w-7/12 p-4 md:p-6 lg:p-8 bg-zinc-50 dark:bg-transparent relative">
                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative shadow-2xl ring-1 ring-black/10">
                        <video
                            src="/login.mp4"
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover transition-transform duration-1000"
                        />
                        {/* Dark gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950/40 via-transparent to-transparent" />

                        {/* Simulated UI Cards based on image */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute top-10 left-10 p-5 bg-blue-600 rounded-2xl shadow-xl flex flex-col gap-1 ring-1 ring-black/5"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                                <p className="text-[10px] font-bold uppercase tracking-wider text-white opacity-80">Success Task</p>
                            </div>
                            <p className="text-sm font-bold text-white">10:00 AM - 11:30 AM</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="absolute bottom-12 left-12 p-6 bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl min-w-[320px] ring-1 ring-black/5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <p className="font-bold text-sm tracking-tight dark:text-zinc-100">Monthly Backup Activity</p>
                                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                            </div>

                            <div className="flex gap-2">
                                {[22, 23, 24, 25, 26, 27, 28].map((day, i) => (
                                    <div key={day} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-colors ${i === 3 ? "bg-blue-50 dark:bg-blue-900/30" : "bg-zinc-50 dark:bg-zinc-700/50"}`}>
                                        <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</p>
                                        <p className={`text-sm font-bold ${i === 3 ? "text-blue-600" : "text-zinc-600 dark:text-zinc-300"}`}>{day}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Decorative floaters */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute right-12 top-1/3 -translate-y-1/2 p-6 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl flex flex-col gap-4"
                        >
                            <div className="flex -space-x-3 items-center justify-center">
                                <div className="p-3 bg-blue-500 rounded-full shadow-lg border-2 border-white ring-4 ring-blue-500/20">
                                    <Database className="w-5 h-5 text-white" />
                                </div>
                                <div className="p-3 bg-sky-500 rounded-full shadow-lg border-2 border-white ring-4 ring-sky-500/20">
                                    <Server className="w-5 h-5 text-white" />
                                </div>
                                <div className="p-3 bg-indigo-500 rounded-full shadow-lg border-2 border-white ring-4 ring-indigo-500/20">
                                    <HardDrive className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Terms & Policy</DialogTitle>
                        <DialogDescription className="pt-4 space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>
                                Welcome to Backup Monitoring. By accessing our system, you agree to comply with our security guidelines and data handling policies.
                            </p>
                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>All automated backups are encrypted at rest.</li>
                                <li>Access is monitored and logged for security auditing.</li>
                                <li>Users are responsible for maintaining strong credentials.</li>
                                <li>Data retention follows the organization's compliance standards.</li>
                            </ul>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 flex justify-end">
                        <Button
                            className="rounded-full px-8 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsTermsOpen(false)}
                        >
                            Agree & Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
