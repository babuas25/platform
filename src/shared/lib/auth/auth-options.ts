import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDefaultRole } from './rbac';
import { db } from './firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// Helper: sign in with Firebase Auth REST (email/password)
async function firebaseSignInWithPassword(email: string, password: string) {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Missing FIREBASE_API_KEY/NEXT_PUBLIC_FIREBASE_API_KEY env");
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Invalid credentials");
  }
  return data;
}

// Helper: Create or update user in Firestore
async function createOrUpdateUserInFirestore(userId: string, email: string, name: string, role: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    const now = Timestamp.now();
    const userData = {
      name: name || email.split('@')[0],
      email,
      role,
      category: getCategoryFromRole(role),
      subcategory: getSubcategoryFromRole(role),
      status: 'Active',
      updatedAt: now,
      lastLogin: now
    };

    if (userSnap.exists()) {
      // Update existing user
      await setDoc(userRef, {
        ...userData,
        // Keep original createdAt
        createdAt: userSnap.data().createdAt
      }, { merge: true });
      console.log(`[AUTH] Updated user in Firestore: ${email}`);
    } else {
      // Create new user
      await setDoc(userRef, {
        ...userData,
        createdAt: now
      });
      console.log(`[AUTH] Created new user in Firestore: ${email}`);
    }
  } catch (error) {
    console.error('[AUTH] Error creating/updating user in Firestore:', error);
  }
}

// Helper: Get category from role
function getCategoryFromRole(role: string): string {
  switch (role) {
    case 'SuperAdmin':
    case 'Admin':
      return 'Admin';
    case 'Support':
    case 'Key Manager':
    case 'Research':
    case 'Media':
    case 'Sales':
      return 'Staff';
    case 'Supplier':
    case 'Service Provider':
      return 'Partner';
    case 'Distributor':
    case 'Franchise':
    case 'B2B':
      return 'Agent';
    case 'User':
    default:
      return 'Users';
  }
}

// Helper: Get subcategory from role
function getSubcategoryFromRole(role: string): string {
  switch (role) {
    case 'SuperAdmin':
      return 'SuperAdmin';
    case 'Admin':
      return 'Admin';
    case 'Support':
      return 'Support';
    case 'Key Manager':
      return 'Key Manager';
    case 'Research':
      return 'Research';
    case 'Media':
      return 'Media';
    case 'Sales':
      return 'Sales';
    case 'Supplier':
      return 'Supplier';
    case 'Service Provider':
      return 'Service Provider';
    case 'Distributor':
      return 'Distributor';
    case 'Franchise':
      return 'Franchise';
    case 'B2B':
      return 'B2B';
    case 'User':
    default:
      return 'publicuser';
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const data = await firebaseSignInWithPassword(credentials.email, credentials.password);
          // Get default role based on email
          const role = getDefaultRole(data.email);
          console.log(`[AUTH] User ${data.email} assigned role:`, role);
          
          return {
            id: data.localId,
            name: data.email?.split("@")[0] || "User",
            email: data.email,
            image: null,
            role: role, // Add role to the user object
            idToken: data.idToken,
            refreshToken: data.refreshToken,
          } as any;
        } catch (e) {
          console.error("Credentials authorize error", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/auth" },
  callbacks: {
    async jwt({ token, user, account, trigger, session }: any) {
      // Initial sign in
      if (account && user) {
        // For email/password login
        if (user.email) {
          // Re-fetch the role to ensure it's up to date
          const role = getDefaultRole(user.email);
          token.role = role;
          console.log('[AUTH] JWT - Initial sign in, setting role:', role);
          
          // Create or update user in Firestore
          await createOrUpdateUserInFirestore(user.id, user.email, user.name, role);
        } else {
          token.role = user.role || 'User';
        }
        token.idToken = user.idToken;
        token.refreshToken = user.refreshToken;
        token.uid = user.id;
        token.email = user.email;
      }
      
      // If we're updating the session (e.g., after a role change)
      if (trigger === 'update' && session?.user?.role) {
        token.role = session.user.role;
        console.log('[AUTH] JWT - Updated role:', token.role);
      }
      
      // Ensure we always have a role
      if (!token.role) {
        token.role = 'User';
      }
      
      console.log('[AUTH] JWT - Current token:', {
        role: token.role,
        email: token.email,
        uid: token.uid
      });
      
      return token;
    },
    async session({ session, token }: any) {
      // Add role and tokens to session
      session.idToken = token.idToken;
      session.refreshToken = token.refreshToken;
      
      // Ensure role is always set and valid
      const validRoles = ['SuperAdmin', 'Admin', 'Staff', 'Partner', 'Agent', 'User'];
      session.user.role = validRoles.includes(token.role) ? token.role : 'User';
      
      // For SuperAdmin emails, force the role
      const superAdminEmails = ['babuas25@gmail.com', 'md.ashifbabu@gmail.com'];
      if (session.user?.email && superAdminEmails.includes(session.user.email)) {
        console.log('[AUTH] Overriding role to SuperAdmin for email:', session.user.email);
        session.user.role = 'SuperAdmin';
      }
      
      // Debug log
      console.log('[AUTH] Session - Final user role:', session.user.role);
      console.log('[AUTH] Session user email:', session.user?.email);
      
      if (session?.user) {
        (session.user as any).id = token.uid || session.user.id;
        (session.user as any).picture = token.picture || session.user.image;
        (session.user as any).provider = token.provider || 'credentials';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} as const;
