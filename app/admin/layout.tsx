import {
    ReactNode,
} from "react";

import Link from "next/link";

import {
    connection,
} from "next/server";

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";


type AdminLayoutProps = {
    children:
        ReactNode;
};


export default async function AdminLayout({
                                              children,
                                          }: AdminLayoutProps) {
    /*
     * Next.js 16 + Cache Components:
     *
     * Admin authentication depends on the
     * current request, cookies, session,
     * and Supabase token timing.
     *
     * connection() tells Next.js that this
     * route must wait for a real request
     * instead of being prerendered.
     */
    await connection();


    const {
        profile,
    } =
        await requireSuperadmin();


    const adminName =
        [
            profile.first_name,
            profile.last_name,
        ]
            .filter(
                Boolean
            )
            .join(" ")
            .trim() ||
        "Admin";


    return (
        <div className="min-h-screen bg-[#f4f4f4] text-black flex">

            <aside className="w-64 bg-black text-white min-h-screen p-6 flex flex-col">

                <div className="flex items-center gap-3 mb-12">

                    <div className="w-9 h-9 rounded-lg bg-white text-black grid place-items-center font-bold">
                        M
                    </div>

                    <div>
                        <p className="font-semibold">
                            Meme Lab
                        </p>

                        <p className="text-[10px] text-zinc-500 tracking-[0.18em]">
                            ADMIN
                        </p>
                    </div>

                </div>


                <nav className="space-y-2">

                    <Link
                        href="/admin"
                        className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
                    >
                        Overview
                    </Link>


                    <Link
                        href="/admin/users"
                        className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
                    >
                        Users
                    </Link>


                    <Link
                        href="/admin/memes"
                        className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
                    >
                        Memes
                    </Link>


                    <Link
                        href="/admin/votes"
                        className="block px-4 py-3 rounded-xl hover:bg-white/10 transition"
                    >
                        Votes
                    </Link>

                </nav>


                <div className="mt-auto pt-8 border-t border-white/10">

                    <p className="text-xs text-zinc-500">
                        Signed in as
                    </p>

                    <p className="mt-1 text-sm font-medium">
                        {adminName}
                    </p>

                </div>

            </aside>


            <main className="flex-1 min-w-0">

                {children}

            </main>

        </div>
    );
}