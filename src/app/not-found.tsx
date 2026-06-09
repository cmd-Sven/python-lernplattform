import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p>Diese Lektion wurde nicht gefunden oder ist noch nicht freigegeben.</p>
      <Link href="/" className="btn btn-primary">
        Zur Startseite
      </Link>
    </div>
  );
}
