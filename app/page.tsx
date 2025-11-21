import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getHomepageCards } from '@/lib/data';
import BentoGrid from '@/components/bento/BentoGrid';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || 'mybento',
};

export default async function Home() {
  const session = await auth();
  const homepageData = await getHomepageCards();

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'mybento';
  const siteDescription = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "A place for all your links, social media, and content.\nBeautiful, customizable, and yours.";

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      {/* Left Side: Hero */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center p-8 lg:p-16 bg-white border-r border-gray-200 z-10">
        <div className="max-w-md mx-auto lg:mx-0">
          <h1 className="text-6xl font-bold mb-6 text-gray-900 tracking-tight">{siteName}</h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed whitespace-pre-line">
            {siteDescription}
          </p>

          <div className="flex gap-4">
            {session?.user ? (
              <Link href={`/${session.user.name}`}>
                <Button size="lg" className="text-lg px-8 py-6">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-6">Get Yours</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Bento Grid (Admin's Cards) */}
      <div className="w-full relative bg-gray-50 overflow-y-auto max-h-screen">
        {homepageData ? (
          <div className="transform origin-top-left lg:origin-top-center w-full">
            <BentoGrid
              initialCards={homepageData.cards}
              initialProfile={homepageData.profile}
              isEditable={false}
              showProfile={false}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No featured content yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
