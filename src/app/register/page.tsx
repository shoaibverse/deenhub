import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "اکاؤنٹ بنائیں",
  robots: { index: false, follow: false },
};

// NoorHub is now fully usable without an account, so registration is no longer
// offered anywhere in the interface.
export default function RegisterPage() {
  redirect("/");
}
