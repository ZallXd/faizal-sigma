"use client";

import { motion } from "framer-motion";
import { Circle, ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ElegantShapeProps {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
}: ElegantShapeProps) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute pointer-events-none", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-white/[0.15]",
                        "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

interface HeroGeometricProps {
    badge?: string;
    title1?: string;
    title2?: string;
    description?: string;
    onOpenLogin?: () => void;
}

function HeroGeometric({
    badge = "PROGRAM STUDI SISTEM KOMPUTER — LAB IoT",
    title1 = "Building Smart",
    title2 = "Technology Ecosystems",
    description = "Pusat kendali, monitoring telemetri real-time, dan showcase hasil riset inovasi hardware, embedded siber-fisik, otomasi industri, dan kecerdasan siber mahasiswa teknik Sistem Komputer.",
    onOpenLogin
}: HeroGeometricProps) {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <div className="relative min-h-[95vh] w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-violet-500/[0.05] blur-3xl pointer-events-none" />

            {/* Ambient geometric shapes floating */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-indigo-500/[0.12]"
                    className="left-[-20%] md:left-[-5%] top-[10%] md:top-[20%] opacity-40 sm:opacity-75 md:opacity-100"
                />

                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-violet-500/[0.12]"
                    className="right-[-15%] md:right-[0%] top-[75%] md:top-[70%] opacity-40 sm:opacity-75 md:opacity-100"
                />

                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-sky-500/[0.08]"
                    className="left-[-5%] md:left-[10%] bottom-[5%] md:bottom-[12%] opacity-40 sm:opacity-75 md:opacity-100"
                />

                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={18}
                    gradient="from-indigo-500/[0.10]"
                    className="right-[5%] md:right-[20%] top-[5%] md:top-[15%] opacity-40 sm:opacity-75 md:opacity-100"
                />

                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="from-fuchsia-500/[0.08]"
                    className="hidden sm:block left-[20%] md:left-[25%] top-[5%] md:top-[12%] opacity-60 md:opacity-100"
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6 md:mb-12"
                    >
                        <Circle className="h-2 w-2 fill-indigo-400/80 animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-mono text-indigo-200/80 tracking-widest font-medium uppercase">
                            {badge}
                        </span>
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-5 md:mb-8 tracking-tight leading-tight text-white font-display">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                                {title1}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-slate-100 to-sky-200"
                                )}
                            >
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-xs sm:text-sm md:text-lg text-slate-300/90 mb-8 sm:mb-10 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-2 sm:px-4">
                            {description}
                        </p>
                    </motion.div>

                    <motion.div
                        custom={3}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 relative z-20 w-fit mx-auto sm:w-auto"
                    >
                        {onOpenLogin && (
                            <button
                                onClick={onOpenLogin}
                                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-indigo-100 backdrop-blur-md shadow-[0_0_25px_rgba(99,102,241,0.12)] hover:border-indigo-400/40 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
                            >
                                <span>Akses Dasbor Kelompok</span>
                                <ArrowRight className="h-4 w-4 text-indigo-300" />
                            </button>
                        )}
                        <a
                            href="#showcase-projects"
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-200 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            <span>Lihat Produk Riset</span>
                        </a>
                    </motion.div>
                </div>
            </div>

            {/* Seamless fading on bottom edge */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030303] to-transparent pointer-events-none" />
        </div>
    );
}

export { HeroGeometric }
