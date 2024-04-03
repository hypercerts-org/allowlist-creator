import {NextResponse} from "next/server";

export async function POST(request: Request) {
    const body = await request.json();

    console.log(body);
    const res = await fetch(body.allowListUrl);

    if (!res.ok) {
        throw new Error(res.statusText);
    }

    return new NextResponse(res.body, {status: res.status, statusText: res.statusText})
}
