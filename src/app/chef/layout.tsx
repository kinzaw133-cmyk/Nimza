import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side check for Chef page: only 'chef' (or 'admin') allowed
  const cookieStore = cookies();
  const role = cookieStore.get("sb-user-role")?.value;

  if (role !== "chef" && role !== "admin") {
    redirect("/login?role=chef");
  }

  return <>{children}</>;
}
