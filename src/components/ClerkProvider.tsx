'use client';

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { PropsWithChildren } from "react";

export function ClerkProviderWithTheme({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#6366f1', // indigo-500
          colorText: 'white',
          colorTextOnPrimaryBackground: 'white',
          colorTextSecondary: '#d1d5db', // gray-300
          colorBackground: 'transparent',
          colorInputBackground: 'rgba(255, 255, 255, 0.1)',
          colorInputText: 'white',
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}