interface AuthSidePanelProps {
  title?: string;
  description?: string;
}

export function AuthSidePanel({
  title = "Welcome to Finora",
  description = "Manage your finances with ease. Track expenses, create budgets, and achieve your financial goals.",
}: AuthSidePanelProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-l-2xl">
      {/* Light mode gradient - using brand colors */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-50 via-amber-50 to-teal-50 dark:hidden" />

      {/* Dark mode gradient - using brand colors */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-900 via-orange-950/40 to-teal-950/40 hidden dark:block" />

      {/* Decorative animated blobs - using brand primary and secondary colors */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400 dark:bg-orange-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob" />
        <div className="absolute top-40 right-20 w-72 h-72 bg-teal-400 dark:bg-teal-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-40 w-72 h-72 bg-amber-400 dark:bg-amber-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground max-w-md">{description}</p>
      </div>
    </div>
  );
}
