import { Redis } from '@upstash/redis';
import { supabase } from './supabase';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

const CACHE_TTL_SECONDS = 3600; // 1 hour TTL for active user caches

/**
 * Checks whether an email address is whitelisted in Redis or Supabase.
 */
export async function isEmailWhitelisted(
  email: string
): Promise<{ whitelisted: boolean; role?: string; fullName?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const cacheKey = `whitelist:${normalizedEmail}`;

  // 1. Try Upstash Redis cache first
  if (redis) {
    try {
      const cached = await redis.get<{ role: string; fullName: string }>(cacheKey);
      if (cached) {
        return {
          whitelisted: true,
          role: cached.role,
          fullName: cached.fullName,
        };
      }
    } catch (e) {
      console.warn('Redis cache lookup failed, falling back to Supabase:', e);
    }
  }

  // 2. Query Supabase directly
  try {
    const { data, error } = await supabase
      .from('allowed_emails')
      .select('email, role, full_name, is_active')
      .ilike('email', normalizedEmail)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      return { whitelisted: false };
    }

    // 3. Populate Redis cache
    if (redis) {
      try {
        await redis.set(
          cacheKey,
          { role: data.role, fullName: data.full_name || '' },
          { ex: CACHE_TTL_SECONDS }
        );
      } catch (cacheErr) {
        console.warn('Failed to populate Redis cache:', cacheErr);
      }
    }

    return {
      whitelisted: true,
      role: data.role,
      fullName: data.full_name || '',
    };
  } catch (err) {
    console.error('Database whitelist check error:', err);
    return { whitelisted: false };
  }
}

/**
 * Checks if a member is already in a team (by email).
 */
export async function getMemberTeam(
  email: string
): Promise<{ inTeam: boolean; teamId?: string; teamName?: string; status?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const cacheKey = `member_team:${normalizedEmail}`;

  if (redis) {
    try {
      const cached = await redis.get<{ teamId: string; teamName: string; status: string }>(
        cacheKey
      );
      if (cached) {
        return {
          inTeam: true,
          teamId: cached.teamId,
          teamName: cached.teamName,
          status: cached.status,
        };
      }
    } catch (e) {
      console.warn('Redis member team lookup failed, falling back to Supabase:', e);
    }
  }

  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, status, hackathon_teams(name)')
      .ilike('email', normalizedEmail)
      .neq('status', 'declined')
      .maybeSingle();

    if (error || !data) {
      return { inTeam: false };
    }

    // @ts-expect-error Supabase join syntax
    const teamName = data.hackathon_teams?.name || 'Unknown Team';
    const result = {
      inTeam: true,
      teamId: data.team_id,
      teamName,
      status: data.status,
    };

    if (redis) {
      try {
        await redis.set(cacheKey, result, { ex: 600 }); // 10 min cache
      } catch {}
    }

    return result;
  } catch (err) {
    console.error('Error checking member team status:', err);
    return { inTeam: false };
  }
}

/**
 * Invalidate Redis caches on mutation.
 */
export async function invalidateEmailCache(email: string) {
  if (!redis) return;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    await redis.del(`whitelist:${normalizedEmail}`);
    await redis.del(`member_team:${normalizedEmail}`);
  } catch (err) {
    console.warn('Error invalidating email cache:', err);
  }
}
