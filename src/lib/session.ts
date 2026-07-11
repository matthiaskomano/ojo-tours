import { cookies } from 'next/headers';
import { prisma } from './prisma';

/**
 * Session management utilities
 * Handles session creation, validation, and cleanup
 */

const SESSION_COOKIE_NAME = 'ojo_admin_session';
const SESSION_DURATION = 60 * 60 * 24; // 1 day in seconds

/**
 * Create a session record in the database
 */
export async function createSession(userId: string, token: string) {
  try {
    const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);
    
    const session = await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

/**
 * Validate a session token
 */
export async function validateSession(token: string) {
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await deleteSession(token);
      return null;
    }

    // Check if user is active
    if (!session.user.isActive) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
}

/**
 * Delete a session
 */
export async function deleteSession(token: string) {
  try {
    await prisma.session.delete({
      where: { token },
    });
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string) {
  try {
    await prisma.session.deleteMany({
      where: { userId },
    });
  } catch (error) {
    console.error('Error deleting user sessions:', error);
  }
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  try {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token?: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, token || 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DURATION,
      path: '/',
      sameSite: 'lax',
    });
  } catch (error) {
    console.error('Error setting session cookie:', error);
  }
}

/**
 * Get session cookie value
 */
export async function getSessionCookie() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get(SESSION_COOKIE_NAME);
    return session?.value || null;
  } catch (error) {
    console.error('Error getting session cookie:', error);
    return null;
  }
}

/**
 * Delete session cookie
 */
export async function deleteSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (error) {
    console.error('Error deleting session cookie:', error);
  }
}

/**
 * Refresh session expiration
 */
export async function refreshSession(token: string) {
  try {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION * 1000);
    
    const session = await prisma.session.update({
      where: { token },
      data: {
        expiresAt: newExpiresAt,
      },
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });

    // Update cookie expiration
    await setSessionCookie(token);

    return session;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}
