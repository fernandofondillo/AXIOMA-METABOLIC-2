import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
    // Pass-through proxy for testing
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
