import { NextResponse } from 'next/server';
import { getRequestBaseUrl } from '@/lib/url';

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl = getRequestBaseUrl(req);
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: Buffer.from(JSON.stringify({ baseUrl })).toString('base64'),
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
