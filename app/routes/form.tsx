import { Outlet } from "@remix-run/react";

export default function FormRoot() {
  return (
    <main className="mx-auto h-full w-full max-w-2xl py-4">
      <header>
        <h1 className="text-3xl font-bold">Remix Redis Form</h1>
      </header>
      <Outlet />
    </main>
  );
}
