import FlipbookViewer from '@/components/flipbook-viewer';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/db';
import { sendViewMilestoneEmail } from '@/lib/email';
import { createViewerToken } from '@/lib/viewer-token';

function getAppBaseUrl(): string {
  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') &&
    !process.env.NEXT_PUBLIC_APP_URL.includes('vercel.app')
  ) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  // Default to official production domain
  return 'https://e.whizpoint.app';
}

// Read-only fetch for metadata generation
async function getDocument(slug: string) {
  try {
    const document = await prisma.document.findUnique({
      where: { slug },
    });

    if (!document) return null;

    // Map to expected props
    return {
      id: document.id,
      title: document.title,
      slug: document.slug,
      pageCount: document.pages && document.pages.length > 0 ? document.pages.length : document.page_count,
      pages: document.pages,
      logoUrl: document.logo_url,
      views: document.views || 0,
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

// Atomically record view and trigger milestone emails
async function recordViewAndGetDocument(slug: string) {
  try {
    const document = await prisma.document.update({
      where: { slug },
      data: { views: { increment: 1 } },
      include: { user: true },
    });

    // Milestone thresholds to notify author
    const MILESTONES = [25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    if (MILESTONES.includes(document.views) && document.user?.email) {
      sendViewMilestoneEmail({
        to: document.user.email,
        name: document.user.name,
        title: document.title,
        slug: document.slug,
        views: document.views,
      }).catch((err) => console.error('[MILESTONE EMAIL ERROR]:', err));
    }

    return {
      id: document.id,
      title: document.title,
      slug: document.slug,
      pageCount: document.pages && document.pages.length > 0 ? document.pages.length : document.page_count,
      pages: document.pages,
      logoUrl: document.logo_url,
      views: document.views,
    };
  } catch (error) {
    console.error('Error recording view on document:', error);
    return getDocument(slug);
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocument(slug);

  if (!doc) return { title: 'Not Found | Whizpoint Flipbook' };

  const baseUrl = getAppBaseUrl();
  const docUrl = `${baseUrl}/${doc.slug}`;
  // Use our secure server-side cover endpoint so the raw R2 bucket URL is never leaked in HTML
  const ogImage = `${baseUrl}/api/documents/${doc.slug}/cover`;
  const description = `Read ${doc.title} on Whizpoint Flipbook. Swipe or scroll to explore this ${doc.pageCount}-page interactive digital document.`;

  return {
    title: `${doc.title} | Whizpoint Flipbook`,
    description: description,
    alternates: {
      canonical: docUrl,
    },
    openGraph: {
      title: `${doc.title} | Whizpoint Flipbook`,
      description: description,
      url: docUrl,
      siteName: 'Whizpoint Flipbook',
      images: [
        {
          url: ogImage,
          width: 800,
          height: 1131, // A4 ratio
          alt: `${doc.title} Cover`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${doc.title} | Whizpoint Flipbook`,
      description: description,
      site: '@whizpoint',
      images: [ogImage],
    },
  };
}

export default async function ViewerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const doc = await recordViewAndGetDocument(slug);
  if (!doc) notFound();

  const baseUrl = getAppBaseUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: doc.title,
    url: `${baseUrl}/${doc.slug}`,
    image: `${baseUrl}/api/documents/${doc.slug}/cover`,
    numberOfPages: doc.pageCount,
    publisher: {
      '@type': 'Organization',
      name: 'Whizpoint Flipbook',
    },
  };

  // Generate cryptographically signed ephemeral viewer token
  const sessionToken = await createViewerToken(doc.id, doc.slug);

  // SECURITY ARCHITECTURE:
  // We explicitly DO NOT pass the raw `doc.pages` array of R2 storage URLs to the client props.
  // This prevents Next.js SSR from injecting <link rel="preload"> in the <head>
  // and keeps direct Cloudflare R2 bucket URLs completely out of the HTML source code.
  // The client streams each page securely via /api/documents/[id]/render?page=X&token=... into an HTML5 Canvas.
  const secureViewerDoc = {
    id: doc.id,
    title: doc.title,
    slug: doc.slug,
    pageCount: doc.pageCount,
    logoUrl: doc.logoUrl,
    views: doc.views,
    sessionToken,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FlipbookViewer doc={secureViewerDoc} />
    </>
  );
}
