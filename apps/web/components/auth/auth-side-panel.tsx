"use client";

import { motion } from "framer-motion";
import { Wallet, PieChart, TrendingUp, ShieldCheck } from "lucide-react";

interface AuthSidePanelProps {
  title?: string;
  description?: string;
}

const features = [
  {
    icon: Wallet,
    title: "Smart Budgeting",
    description: "Track every penny with automated categorization.",
  },
  {
    icon: PieChart,
    title: "Visual Analytics",
    description: "See where your money goes with beautiful charts.",
  },
  {
    icon: TrendingUp,
    title: "Investment Tracking",
    description: "Monitor your portfolio growth in real-time.",
  },
];

export function AuthSidePanel({
  title = "Welcome to Finora",
  description = "Manage your finances with ease. Track expenses, create budgets, and achieve your financial goals.",
}: AuthSidePanelProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-muted/10 border-r border-border/50">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[100px] animate-[moveVertical_30s_ease_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[100px] animate-[moveInCircle_20s_reverse_infinite]" />
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[80px] animate-[moveInCircle_40s_linear_infinite]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] dark:opacity-[0.05]" />

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-12 xl:p-16">
        {/* Top Section: Brand/Logo Area (Optional, can be empty or decorative) */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Secure & Reliable
          </span>
        </div>

        {/* Middle Section: Main Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl xl:text-5xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              {description}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4 pt-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ 
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2 + index * 0.1 
                }}
                className="group flex items-start gap-4 p-4 rounded-xl bg-white/40 dark:bg-black/20 border border-white/20 dark:border-white/10 backdrop-blur-md hover:bg-white/60 dark:hover:bg-black/30 transition-all duration-300"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Testimonial or Stat */}
        {/* <div className="pt-8 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  U{i}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">
                Trusted by 10,000+ users
              </p>
              <p className="text-muted-foreground">
                Join the community today
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
