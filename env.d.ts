declare namespace NodeJS {
  interface ProcessEnv {
    // Public variables (exposed to the browser)
    NEXT_PUBLIC_API_BASE: string;
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string;

    // Private variables (server-side only)
    FIREBASE_PROJECT_ID: string;
    FIREBASE_CLIENT_EMAIL: string;
    FIREBASE_PRIVATE_KEY: string;
    EXCHANGERATE_API_KEY: string;
    PLAID_ENV: 'sandbox' | 'development' | 'production';
    PLAID_CLIENT_ID: string;
    PLAID_SECRET: string;

    // Standard Next.js variable
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
