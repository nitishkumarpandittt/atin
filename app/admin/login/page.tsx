import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import logo from "@/public/brand/atin-logo.png";
import { LoginForm } from "@/components/admin/LoginForm";
import { getStaffSession } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getStaffSession()) redirect("/admin");
  return (
    <main className="admin-theme grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image src={logo} alt="Atin HealthCare" className="mx-auto h-14 w-auto" sizes="120px" loading="eager" />
          <h1 className="mt-5 text-xl font-bold text-ink">Staff sign in</h1>
          <p className="mt-1 text-sm text-muted">Manage the website catalogue, content and enquiries.</p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-line sm:p-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-muted">Accounts are created by an administrator. There is no public sign-up.</p>
      </div>
    </main>
  );
}
