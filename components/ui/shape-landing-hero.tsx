"use client";

import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
    scrollYRange = [0, 300],
    scrollXRange = [0, 50],
    scrollRotateDelta = 30,
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
    scrollYRange?: [number, number];
    scrollXRange?: [number, number];
    scrollRotateDelta?: number;
}) {
    const { scrollY } = useScroll();
    
    const y = useTransform(scrollY, [0, 300, 600], [scrollYRange[0], scrollYRange[1], scrollYRange[1] * 1.5], { clamp: true });
    const x = useTransform(scrollY, [0, 300, 600], [scrollXRange[0], scrollXRange[1], scrollXRange[1] * 1.2], { clamp: true });
    const rotation = useTransform(scrollY, [0, 300, 600], [rotate, rotate + scrollRotateDelta, rotate + scrollRotateDelta * 1.3], { clamp: true });
    const opacity = useTransform(scrollY, [0, 200, 400], [1, 1, 0], { clamp: true });

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
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            style={{ 
                x, 
                y, 
                rotate,
                opacity,
                willChange: "transform",
            }}
            className={cn("absolute will-change-transform", className)}
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

function HeroGeometric({
    badge = "AI-Powered Lead Qualification",
    title1 = "Every Lead.",
    title2 = "One Place.",
    title3 = "Instantly Qualified.",
}: {
    badge?: string;
    title1?: string;
    title2?: string;
    title3?: string;
}) {
    const fadeUpVariants: Variants = {
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

    const { scrollY } = useScroll();
    
    const heroY = useTransform(scrollY, [0, 300], [0, 80], { clamp: true });
    const badgeOpacity = useTransform(scrollY, [0, 80, 150], [1, 1, 0], { clamp: true });
    const title1Opacity = useTransform(scrollY, [0, 100, 180], [1, 1, 0], { clamp: true });
    const title2Opacity = useTransform(scrollY, [0, 150, 230], [1, 1, 0], { clamp: true });
    const title3Opacity = useTransform(scrollY, [0, 200, 280], [1, 1, 0], { clamp: true });
    const descOpacity = useTransform(scrollY, [0, 250, 350], [1, 1, 0], { clamp: true });
    const backgroundY = useTransform(scrollY, [0, 500], [0, 100], { clamp: true });

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303]">
            <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.05] via-transparent to-rose-500/[0.05]"
                style={{ y: backgroundY, willChange: "transform" }}
            />

            <motion.div 
                className="absolute inset-0 overflow-hidden will-change-transform"
                style={{ y: heroY }}
            >
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-emerald-500/[0.15]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                    scrollYRange={[0, -200]}
                    scrollXRange={[0, 100]}
                    scrollRotateDelta={45}
                />

                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-rose-500/[0.15]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                    scrollYRange={[0, 250]}
                    scrollXRange={[0, -70]}
                    scrollRotateDelta={-35}
                />

                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-violet-500/[0.15]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%] hidden md:block"
                    scrollYRange={[0, -50]}
                    scrollXRange={[0, 30]}
                    scrollRotateDelta={10}
                />

                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="from-amber-500/[0.15]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                    scrollYRange={[0, -180]}
                    scrollXRange={[0, -60]}
                    scrollRotateDelta={-40}
                />

                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="from-cyan-500/[0.15]"
                    className="left-[20%] md:left-[25%] top-[5%] md:top-[10%] hidden md:block"
                    scrollYRange={[0, -80]}
                    scrollXRange={[0, 40]}
                    scrollRotateDelta={30}
                />

                <ElegantShape
                    delay={0.8}
                    width={100}
                    height={30}
                    rotate={45}
                    gradient="from-blue-500/[0.15]"
                    className="right-[30%] md:right-[35%] bottom-[20%] md:bottom-[25%] hidden md:block"
                    scrollYRange={[0, 140]}
                    scrollXRange={[0, -50]}
                    scrollRotateDelta={-25}
                />
            </motion.div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ opacity: badgeOpacity }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12"
                    >
                        <Circle className="h-2 w-2 fill-emerald-500/80" />
                        <span className="text-sm text-white/60 tracking-wide">
                            {badge}
                        </span>
                    </motion.div>

                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ opacity: title1Opacity }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-2 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                                {title1}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ opacity: title2Opacity }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-2 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={3}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ opacity: title3Opacity }}
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-white/90 to-rose-300 "
                                )}
                            >
                                {title3}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={4}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ opacity: descOpacity }}
                    >
                        <p className="text-base sm:text-lg md:text-xl text-white/40 mb-8 leading-relaxed font-light tracking-wide max-w-xl mx-auto px-4">
                            Stop spending hours evaluating leads. Our AI automatically
                            qualifies every lead in real-time, so you can focus on
                            closing deals.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
        </div>
    );
}

export { HeroGeometric }
