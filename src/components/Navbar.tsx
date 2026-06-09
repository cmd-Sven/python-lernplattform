import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 lg:px-8">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-bold gap-2">
          <span className="text-primary">🐍</span>
          PCEP Lernplattform
        </Link>
      </div>
      <div className="flex-none gap-2 items-center">
        <ThemeSwitcher />
        <Link href="/" className="btn btn-ghost btn-sm hidden md:inline-flex">
          Lektionen
        </Link>
        <Link href="/admin" className="btn btn-outline btn-primary btn-sm">
          Admin
        </Link>
      </div>
    </div>
  );
}
