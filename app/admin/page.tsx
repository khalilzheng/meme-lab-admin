/* eslint-disable @next/next/no-img-element */

import {
    requireSuperadmin,
} from "@/lib/requireSuperadmin";


type ProfileRow = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
};


type GenerationRow = {
    id: string;
    created_at: string;
    user_id: string;
    image_url: string;
    caption: string | null;
};


type VoteRow = {
    generation_id: string;
    vote: number;
};


function formatDate(
    dateString: string
) {
    return new Intl.DateTimeFormat(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        }
    ).format(
        new Date(
            dateString
        )
    );
}


export default async function AdminPage() {
    const {
        profile:
            adminProfile,

        supabase,
    } =
        await requireSuperadmin();


    /*
     * =====================================================
     * LOAD ADMIN DATA
     * =====================================================
     */

    const [
        profilesResult,
        generationsResult,
        votesResult,
    ] =
        await Promise.all([
            supabase
                .from(
                    "profiles"
                )
                .select(
                    "id, first_name, last_name, avatar_url"
                ),

            supabase
                .from(
                    "generations"
                )
                .select(
                    "id, created_at, user_id, image_url, caption"
                )
                .order(
                    "created_at",
                    {
                        ascending:
                            false,
                    }
                ),

            supabase
                .from(
                    "votes"
                )
                .select(
                    "generation_id, vote"
                ),
        ]);


    if (
        profilesResult.error
    ) {
        console.error(
            "Could not load profiles:",
            profilesResult.error
        );
    }


    if (
        generationsResult.error
    ) {
        console.error(
            "Could not load generations:",
            generationsResult.error
        );
    }


    if (
        votesResult.error
    ) {
        console.error(
            "Could not load votes:",
            votesResult.error
        );
    }


    const profiles =
        (
            profilesResult.data ??
            []
        ) as ProfileRow[];


    const generations =
        (
            generationsResult.data ??
            []
        ) as GenerationRow[];


    const votes =
        (
            votesResult.data ??
            []
        ) as VoteRow[];


    /*
     * =====================================================
     * BASIC STATISTICS
     * =====================================================
     */

    const totalUsers =
        profiles.length;


    const totalMemes =
        generations.length;


    const totalVotes =
        votes.length;


    const funnyVotes =
        votes.filter(
            (vote) =>
                vote.vote ===
                1
        ).length;


    const notFunnyVotes =
        votes.filter(
            (vote) =>
                vote.vote ===
                -1
        ).length;


    const funnyPercentage =
        totalVotes > 0
            ? Math.round(
                (
                    funnyVotes /
                    totalVotes
                ) *
                100
            )
            : 0;


    const communityScore =
        funnyVotes -
        notFunnyVotes;


    /*
     * =====================================================
     * PROFILE LOOKUP
     * =====================================================
     */

    const profileMap =
        new Map(
            profiles.map(
                (
                    profile
                ) => [
                    profile.id,
                    profile,
                ]
            )
        );


    function getCreatorName(
        userId: string
    ) {
        const creator =
            profileMap.get(
                userId
            );


        if (
            !creator
        ) {
            return "Unknown creator";
        }


        const fullName =
            [
                creator.first_name,
                creator.last_name,
            ]
                .filter(
                    Boolean
                )
                .join(" ")
                .trim();


        return (
            fullName ||
            "Campus creator"
        );
    }


    /*
     * =====================================================
     * VOTES PER MEME
     * =====================================================
     */

    const voteStats =
        new Map<
            string,
            {
                funny: number;
                notFunny: number;
                score: number;
            }
        >();


    for (
        const vote of votes
        ) {
        const current =
            voteStats.get(
                vote.generation_id
            ) ?? {
                funny: 0,
                notFunny: 0,
                score: 0,
            };


        if (
            vote.vote === 1
        ) {
            current.funny +=
                1;
        }


        if (
            vote.vote ===
            -1
        ) {
            current.notFunny +=
                1;
        }


        current.score =
            current.funny -
            current.notFunny;


        voteStats.set(
            vote.generation_id,
            current
        );
    }


    /*
     * =====================================================
     * TOP MEMES
     * =====================================================
     */

    const topMemes =
        [...generations]
            .map(
                (
                    generation
                ) => ({
                    ...generation,

                    stats:
                        voteStats.get(
                            generation.id
                        ) ?? {
                            funny: 0,
                            notFunny: 0,
                            score: 0,
                        },
                })
            )
            .sort(
                (
                    a,
                    b
                ) => {
                    if (
                        b.stats.score !==
                        a.stats.score
                    ) {
                        return (
                            b.stats.score -
                            a.stats.score
                        );
                    }


                    return (
                        b.stats.funny -
                        a.stats.funny
                    );
                }
            )
            .slice(
                0,
                3
            );


    /*
     * =====================================================
     * MOST ACTIVE CREATOR
     * =====================================================
     */

    const creatorPostCounts =
        new Map<
            string,
            number
        >();


    for (
        const generation of generations
        ) {
        creatorPostCounts.set(
            generation.user_id,

            (
                creatorPostCounts.get(
                    generation.user_id
                ) ??
                0
            ) + 1
        );
    }


    const mostActiveEntry =
        [
            ...creatorPostCounts.entries(),
        ].sort(
            (
                a,
                b
            ) =>
                b[1] -
                a[1]
        )[0];


    const mostActiveCreator =
        mostActiveEntry
            ? {
                name:
                    getCreatorName(
                        mostActiveEntry[0]
                    ),

                posts:
                    mostActiveEntry[1],
            }
            : null;


    /*
     * =====================================================
     * RECENT MEMES
     * =====================================================
     */

    const recentMemes =
        generations.slice(
            0,
            5
        );


    const adminName =
        adminProfile.first_name ||
        "Admin";


    return (
        <div className="p-8 lg:p-10 xl:p-12">

            {/* HEADER */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.24em] text-zinc-500">
                        MEME LAB ADMIN
                    </p>


                    <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] lg:text-5xl">
                        Good morning,{" "}
                        {adminName}.
                    </h1>


                    <p className="mt-3 text-sm text-zinc-500">
                        Here&apos;s what&apos;s happening across Meme Lab.
                    </p>

                </div>


                <div className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-xs font-medium text-zinc-500">
                    Live database overview
                </div>

            </div>


            {/* PRIMARY STATS */}

            <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        USERS
                    </p>

                    <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                        {totalUsers}
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">
                        Registered profiles
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        MEMES
                    </p>

                    <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                        {totalMemes}
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">
                        AI-generated posts
                    </p>

                </div>


                <div className="rounded-3xl border border-zinc-200 bg-white p-6">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        VOTES
                    </p>

                    <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                        {totalVotes}
                    </p>

                    <p className="mt-3 text-sm text-zinc-400">
                        Community reactions
                    </p>

                </div>


                <div className="rounded-3xl bg-black p-6 text-white">

                    <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500">
                        COMMUNITY SCORE
                    </p>

                    <p className="mt-6 text-5xl font-semibold tracking-[-0.05em]">
                        {communityScore >
                        0
                            ? "+"
                            : ""}
                        {
                            communityScore
                        }
                    </p>

                    <p className="mt-3 text-sm text-zinc-500">
                        Funny minus Not Funny
                    </p>

                </div>

            </section>


            {/* SECONDARY STATISTICS */}

            <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">

                {/* SENTIMENT */}

                <div className="rounded-3xl border border-zinc-200 bg-white p-7">

                    <div className="flex items-start justify-between">

                        <div>

                            <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                                COMMUNITY SENTIMENT
                            </p>

                            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                {
                                    funnyPercentage
                                }
                                % Funny
                            </h2>

                        </div>


                        <div className="rounded-full bg-zinc-100 px-4 py-2 text-xs font-medium">
                            {
                                totalVotes
                            }{" "}
                            total votes
                        </div>

                    </div>


                    <div className="mt-8">

                        <div className="h-4 overflow-hidden rounded-full bg-zinc-100">

                            <div
                                className="h-full rounded-full bg-black transition-all"
                                style={{
                                    width:
                                        `${funnyPercentage}%`,
                                }}
                            />

                        </div>


                        <div className="mt-5 flex justify-between">

                            <div>

                                <p className="text-xs text-zinc-400">
                                    FUNNY
                                </p>

                                <p className="mt-1 text-2xl font-semibold">
                                    {
                                        funnyVotes
                                    }
                                </p>

                            </div>


                            <div className="text-right">

                                <p className="text-xs text-zinc-400">
                                    NOT FUNNY
                                </p>

                                <p className="mt-1 text-2xl font-semibold">
                                    {
                                        notFunnyVotes
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ACTIVE CREATOR */}

                <div className="rounded-3xl border border-zinc-200 bg-white p-7">

                    <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                        MOST ACTIVE CREATOR
                    </p>


                    {mostActiveCreator ? (
                        <>

                            <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-black text-xl font-semibold text-white">
                                {mostActiveCreator.name
                                    .charAt(
                                        0
                                    )
                                    .toUpperCase()}
                            </div>


                            <p className="mt-5 text-2xl font-semibold tracking-tight">
                                {
                                    mostActiveCreator.name
                                }
                            </p>


                            <p className="mt-2 text-sm text-zinc-500">
                                {
                                    mostActiveCreator.posts
                                }{" "}
                                meme
                                {mostActiveCreator.posts ===
                                1
                                    ? ""
                                    : "s"}{" "}
                                published
                            </p>

                        </>
                    ) : (
                        <p className="mt-8 text-sm text-zinc-400">
                            No creator activity yet.
                        </p>
                    )}

                </div>

            </section>


            {/* TOP MEMES */}

            <section className="mt-5 rounded-3xl border border-zinc-200 bg-white p-7">

                <div>

                    <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                        TOP CONTENT
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        Best performing memes
                    </h2>

                </div>


                {topMemes.length >
                0 ? (
                    <div className="mt-7 grid gap-5 md:grid-cols-3">

                        {topMemes.map(
                            (
                                meme,
                                index
                            ) => (
                                <article
                                    key={
                                        meme.id
                                    }
                                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50"
                                >

                                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200">

                                        <img
                                            src={
                                                meme.image_url
                                            }
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />


                                        <div className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                                            #
                                            {index +
                                                1}
                                        </div>

                                    </div>


                                    <div className="p-5">

                                        <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-5">
                                            {meme.caption ||
                                                "Untitled meme"}
                                        </p>


                                        <p className="mt-3 text-xs text-zinc-400">
                                            {getCreatorName(
                                                meme.user_id
                                            )}
                                        </p>


                                        <div className="mt-5 flex items-center gap-4 border-t border-zinc-200 pt-4 text-xs">

                                            <span>
                                                ↑{" "}
                                                {
                                                    meme
                                                        .stats
                                                        .funny
                                                }
                                            </span>

                                            <span>
                                                ↓{" "}
                                                {
                                                    meme
                                                        .stats
                                                        .notFunny
                                                }
                                            </span>

                                            <span className="ml-auto font-semibold">
                                                Score{" "}
                                                {
                                                    meme
                                                        .stats
                                                        .score
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </article>
                            )
                        )}

                    </div>
                ) : (
                    <p className="mt-7 text-sm text-zinc-400">
                        No memes yet.
                    </p>
                )}

            </section>


            {/* RECENT ACTIVITY */}

            <section className="mt-5 rounded-3xl border border-zinc-200 bg-white p-7">

                <p className="text-[11px] font-semibold tracking-[0.18em] text-zinc-500">
                    RECENT ACTIVITY
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Latest generations
                </h2>


                <div className="mt-6 divide-y divide-zinc-100">

                    {recentMemes.length >
                    0 ? (
                        recentMemes.map(
                            (
                                meme
                            ) => (
                                <div
                                    key={
                                        meme.id
                                    }
                                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                                >

                                    <img
                                        src={
                                            meme.image_url
                                        }
                                        alt=""
                                        className="h-14 w-14 rounded-xl bg-zinc-100 object-cover"
                                    />


                                    <div className="min-w-0 flex-1">

                                        <p className="truncate text-sm font-semibold">
                                            {meme.caption ||
                                                "Untitled meme"}
                                        </p>

                                        <p className="mt-1 text-xs text-zinc-400">
                                            {getCreatorName(
                                                meme.user_id
                                            )}
                                        </p>

                                    </div>


                                    <p className="shrink-0 text-xs text-zinc-400">
                                        {formatDate(
                                            meme.created_at
                                        )}
                                    </p>

                                </div>
                            )
                        )
                    ) : (
                        <p className="py-5 text-sm text-zinc-400">
                            No recent activity.
                        </p>
                    )}

                </div>

            </section>

        </div>
    );
}