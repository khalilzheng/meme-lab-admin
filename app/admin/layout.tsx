import Link from "next/link";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";

import LogoutButton from "./LogoutButton";


export default async function AdminLayout({
                                              children,
                                          }: Readonly<{
    children:
        React.ReactNode;
}>) {
    const {
        profile,
    } =
        await requireSuperadmin();


    const fullName =
        [
            profile.first_name,
            profile.last_name,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        "Administrator";


    const initial =
        fullName
            .charAt(0)
            .toUpperCase() ||
        "A";


    return (
        <div className="min-h-screen bg-[#f6f6f6] text-black">

            {/* SIDEBAR */}

            <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col bg-black px-5 py-6 text-white">

                {/* BRAND */}

                <Link
                    href="/admin"
                    className="flex items-center gap-3"
                >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-sm font-bold text-black">
                        M
                    </div>

                    <div>
                        <p className="text-base font-semibold leading-none">
                            Meme Lab
                        </p>

                        <p className="mt-1 text-[9px] font-semibold tracking-[0.22em] text-zinc-500">
                            ADMIN
                        </p>
                    </div>
                </Link>


                {/* NAVIGATION */}

                <nav className="mt-14 flex flex-col gap-2">

                    <Link
                        href="/admin"
                        className="rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-900"
                    >
                        Overview
                    </Link>

                    <Link
                        href="/admin/users"
                        className="rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-900"
                    >
                        Users
                    </Link>

                    <Link
                        href="/admin/memes"
                        className="rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-900"
                    >
                        Memes
                    </Link>

                    <Link
                        href="/admin/votes"
                        className="rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-900"
                    >
                        Votes
                    </Link>

                </nav>


                {/* ACCOUNT */}

                <div className="mt-auto border-t border-zinc-800 pt-5">

                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                        Signed in as
                    </p>


                    <div className="mt-3 flex items-center gap-3">

                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-zinc-700 bg-zinc-950 text-xs font-semibold text-white">
                            {initial}
                        </div>


                        <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-white">
                                {fullName}
                            </p>

                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-zinc-600">
                                Superadmin
                            </p>

                        </div>

                    </div>


                    <div className="mt-4">
                        <LogoutButton />
                    </div>

                </div>

            </aside>


            {/* MAIN */}

            <main className="min-h-screen pl-[240px]">
                {children}
            </main>

        </div>
    );
}