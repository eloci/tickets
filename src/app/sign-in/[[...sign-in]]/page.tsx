"use client";
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function SignInPage() {
  const params = useSearchParams();
  const callbackUrl = params.get('redirect_url') || '/';
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <p className="text-sm text-gray-600 mb-6">Use your Google account to continue.</p>
        <button
          className="w-full rounded-md bg-blue-600 text-white py-2.5 hover:bg-blue-700"
          onClick={() => signIn('google', { callbackUrl })}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}