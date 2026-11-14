import { SignJWT, jwtVerify } from 'jose';

const VIEWER_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'whizpoint_flipbook_super_secret_jwt_key_2026_xyuytfz'
);

/**
 * Creates an ephemeral cryptographically signed viewer token.
 * Valid for 2 hours for reading sessions.
 */
export async function createViewerToken(docId: string, slug: string): Promise<string> {
  return await new SignJWT({ docId, slug, role: 'viewer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(VIEWER_SECRET);
}

/**
 * Validates a viewer session token for the render API.
 */
export async function verifyViewerToken(token: string): Promise<{ docId: string; slug: string } | null> {
  try {
    const { payload } = await jwtVerify(token, VIEWER_SECRET);
    if (payload.role !== 'viewer' || typeof payload.docId !== 'string') {
      return null;
    }
    return {
      docId: payload.docId as string,
      slug: (payload.slug as string) || '',
    };
  } catch (err) {
    return null;
  }
}
