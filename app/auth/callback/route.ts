import {
    NextRequest,
    NextResponse,
} from "next/server";

import {
    createClient,
} from "@/utils/supabase/server";


export async function GET(
    request: NextRequest
) {
    const requestUrl =
        new URL(
            request.url
        );


    const code =
        requestUrl.searchParams.get(
            "code"
        );


    if (
        !code
    ) {
        return NextResponse.redirect(
            new URL(
                "/login?error=missing_code",
                requestUrl.origin
            )
        );
    }


    const supabase =
        await createClient();


    const {
        error,
    } =
        await supabase.auth
            .exchangeCodeForSession(
                code
            );


    if (
        error
    ) {
        console.error(
            "Admin OAuth exchange failed:",
            error
        );


        return NextResponse.redirect(
            new URL(
                "/login?error=oauth",
                requestUrl.origin
            )
        );
    }


    return NextResponse.redirect(
        new URL(
            "/admin",
            requestUrl.origin
        )
    );
}