import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Fitness Trainer",
    template: "%s · AI Fitness Trainer",
  },
  description:
    "Персональный контур профиля, целей и ограничений для AI Fitness Trainer MVP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
