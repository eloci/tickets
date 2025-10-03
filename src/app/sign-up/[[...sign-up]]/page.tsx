"use client";
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-xl border p-6 shadow-sm text-center">
        <h1 className="text-xl font-semibold mb-4">Create your account</h1>
        <p className="text-sm text-gray-600 mb-6">We use Google for sign up and sign in.</p>
        <button
          className="w-full rounded-md bg-blue-600 text-white py-2.5 hover:bg-blue-700"
          onClick={() => signIn('google')}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
