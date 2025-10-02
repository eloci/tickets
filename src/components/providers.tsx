'use client'

// This file is maintained for backwards compatibility 
// The app now uses ClerkProvider from @/components/ClerkProvider.tsx
import { ClerkProviderWithTheme } from './ClerkProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProviderWithTheme>
      {children}
    </ClerkProviderWithTheme>
  )
}