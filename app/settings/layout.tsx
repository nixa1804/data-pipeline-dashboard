import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Configure dashboard display preferences and alert thresholds.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
