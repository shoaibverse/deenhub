import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "داخل ہوں",
  robots: { index: false, follow: false },
};

// NoorHub is now fully usable without an account, so the sign-in screen is no
// longer offered anywhere in the interface.
export default function LoginPage() {
  redirect("/");
}
