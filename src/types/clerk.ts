// src/types/clerk.ts
declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: 'ADMIN' | 'USER';
    };
  }
}

export {};
