// next-auth.d.ts

import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser as BaseAdapterUser } from 'next-auth/adapters'; // Import the base AdapterUser type

// ----------------------------------------------------------------------
// 1. EXTEND NEXT-AUTH/JWT: For JWT strategy
// ----------------------------------------------------------------------

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    // Add custom properties you want in the JWT token
    id: string; // Typically the user's ID
    role: string; // <--- CRITICAL: Your custom property
    // You can keep sub, name, etc., but declaring them here ensures they are non-optional
    sub: string;
    name: string;
  }
}

// ----------------------------------------------------------------------
// 2. EXTEND NEXT-AUTH: For useSession() on the client and getServerSession() on the server
// ----------------------------------------------------------------------

declare module 'next-auth' {
  /** The User type is the second argument of the `session` callback and used internally */
  interface User {
    id: string;
    role: string; // <--- CRITICAL: Your custom property
  }

  /** The Session type returned by `useSession`, `getSession`, etc. */
  interface Session {
    user: {
      id: string;
      role: string; // <--- CRITICAL: Your custom property
      // Preserve default user properties (name, email, image)
    } & DefaultSession['user'];
  }
}

// ----------------------------------------------------------------------
// 3. EXTEND NEXT-AUTH/ADAPTERS: To fix the Adapter compatibility error (The root cause)
// ----------------------------------------------------------------------

/** * Augments the AdapterUser type. This is the type the PrismaAdapter 
 * returns, and it must include any custom fields (like 'role')
 * that NextAuth is expecting from the User interface.
 */
declare module 'next-auth/adapters' {
  interface AdapterUser extends BaseAdapterUser {
    role: string; // <--- CRITICAL FIX: Ensures the Adapter type includes your custom property
  }
}

// NOTE: If the above AdapterUser fix doesn't work, you may need to try 
// declaring module '@auth/core/adapters' instead, depending on your package versions.
// declare module '@auth/core/adapters' { /* ... */ }