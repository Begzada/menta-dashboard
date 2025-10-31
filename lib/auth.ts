import { cookies } from 'next/headers';
import { axiosClient } from './axios-client';
import { Session } from './types';

const SESSION_COOKIE_NAME = 'menta_session';

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  try {
    // Validate session by fetching account stats (any authenticated endpoint)
    await axiosClient.get('/accounts/stats', {
      headers: {
        Authorization: `Bearer ${sessionId}`,
      },
    });
    return {
      session_id: sessionId,
      account: {
        id: '',
        email: '',
        role: 'admin',
        is_active: true,
        email_verified: true,
        auth_provider: 'email',
        last_login_at: null,
        created_at: '',
        updated_at: '',
      },
    };
  } catch {
    return null;
  }
}

export async function setSession(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
  return sessionCookie ? sessionCookie.split('=')[1] : null;
}
