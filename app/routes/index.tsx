import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <main className="w-full py-4 text-center">
      <Link
        to="/form"
        className="rounded bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-800"
      >
        Go to Form
      </Link>
    </main>
  );
}
