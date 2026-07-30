import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          className="mb-6 block text-center text-sm font-bold tracking-[0.16em] text-teal-800 uppercase"
          href="/"
        >
          AI Fitness Trainer
        </Link>
        <div className="surface-card">{children}</div>
      </div>
    </main>
  );
}
