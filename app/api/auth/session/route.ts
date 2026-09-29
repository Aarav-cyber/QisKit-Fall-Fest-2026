import { NextRequest, NextResponse } from 'next/server';
import { isEmailWhitelisted } from '@/lib/redis';
import { SUPER_ADMIN_EMAILS } from '@/lib/auth';

const COOKIE_NAME = 'qff_auth_session';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false, session: null });
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(sessionCookie.value));
    const email = parsed.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ authenticated: false, session: null });
    }

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
    const whitelist = await isEmailWhitelisted(email);

    if (!isSuperAdmin && !whitelist.whitelisted) {
      return NextResponse.json({ authenticated: false, session: null });
    }

    const role = isSuperAdmin ? 'admin' : whitelist.role || 'participant';

    return NextResponse.json({
      authenticated: true,
      session: {
        email,
        fullName: parsed.fullName || whitelist.fullName || email.split('@')[0],
        role,
        isAdmin: isSuperAdmin || role === 'admin',
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, session: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const fullName = body.fullName?.trim() || '';

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
    const whitelist = await isEmailWhitelisted(email);

    if (!isSuperAdmin && !whitelist.whitelisted) {
      return NextResponse.json(
        {
          error:
            'This Gmail address is not authorized for the learning phase yet. If you registered via Unstop, your access will be activated once registrations close.',
        },
        { status: 403 }
      );
    }

    const role = isSuperAdmin ? 'admin' : whitelist.role || 'participant';
    const sessionData = {
      email,
      fullName: fullName || whitelist.fullName || email.split('@')[0],
      role,
      isAdmin: isSuperAdmin || role === 'admin',
    };

    const response = NextResponse.json({
      success: true,
      session: sessionData,
    });

    // Set secure cookie for 14 days
    response.cookies.set({
      name: COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(sessionData)),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 14,
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to authenticate session' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
