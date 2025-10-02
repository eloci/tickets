/**
 * Sign-up page that uses Clerk's pre-built UI components
 * Clerk will handle the sign-up flow and redirect to the specified page after success
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "bg-white/10 backdrop-blur-md shadow-xl rounded-xl border border-gray-200/20",
            headerTitle: "text-white",
            headerSubtitle: "text-gray-300",
            socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 text-white border-none",
            formFieldLabel: "text-gray-300",
            formFieldInput: "bg-white/10 border-gray-600 text-white",
            footerActionText: "text-gray-300",
            footerActionLink: "text-blue-400 hover:text-blue-300",
          }
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </div>
  );
}