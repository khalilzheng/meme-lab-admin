"use client";

import {
    useMemo,
    useState,
} from "react";

import {
    createClient,
} from "@/utils/supabase/client";


export default function LoginPage() {
    const supabase =
        useMemo(
            () =>
                createClient(),
            []
        );


    const [
        loading,
        setLoading,
    ] =
        useState(false);


    const [
        error,
        setError,
    ] =
        useState("");


    async function loginWithGoogle() {
        setLoading(
            true
        );

        setError("");


        const redirectTo =
            `${window.location.origin}/auth/callback`;


        const {
            error:
                oauthError,
        } =
            await supabase.auth.signInWithOAuth({
                provider:
                    "google",

                options: {
                    redirectTo,

                    queryParams: {
                        prompt:
                            "select_account",
                    },
                },
            });


        if (
            oauthError
        ) {
            setError(
                oauthError.message
            );

            setLoading(
                false
            );
        }
    }


    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

            <section className="w-full max-w-md border border-white/10 rounded-3xl bg-zinc-950 p-10 shadow-2xl">

                <div className="mb-10">

                    <div className="flex items-center gap-3 mb-10">

                        <div className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center font-bold">
                            M
                        </div>

                        <div>
                            <p className="font-semibold">
                                Meme Lab
                            </p>

                            <p className="text-xs text-zinc-500 uppercase tracking-[0.2em]">
                                Admin
                            </p>
                        </div>

                    </div>


                    <p className="text-xs text-blue-400 font-semibold tracking-[0.2em] mb-4">
                        ADMIN ACCESS
                    </p>

                    <h1 className="text-4xl font-semibold tracking-tight">
                        Welcome back.
                    </h1>

                    <p className="text-zinc-400 mt-4 leading-6">
                        Sign in with an authorized Google account to manage Meme Lab.
                    </p>

                </div>


                <button
                    type="button"
                    disabled={
                        loading
                    }
                    onClick={() =>
                        void loginWithGoogle()
                    }
                    className="w-full h-14 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition disabled:opacity-50"
                >
                    {loading
                        ? "Opening Google..."
                        : "Continue with Google"}
                </button>


                {error && (
                    <p className="mt-5 text-sm text-red-400">
                        {error}
                    </p>
                )}


                <p className="mt-7 text-center text-xs text-zinc-600">
                    Authorized administrators only.
                </p>

            </section>

        </main>
    );
}