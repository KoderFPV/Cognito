import NextAuth, { User, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToMongo } from '@/clients/mongodb/mongodb';
import { validateUserCredentials } from './auth.service';
import { ROLE } from '@/domain/user';

const authorizeUser = async (
  credentials: Partial<Record<'email' | 'password', unknown>> | undefined,
  request: Request
): Promise<User | null> => {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const email = credentials.email as string;
  const password = credentials.password as string;

  try {
    const db = await connectToMongo();
    const user = await validateUserCredentials(db, {
      email,
      password,
    });

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role,
    };
  } catch (error) {
    console.error('Authorization error:', error);
    return null;
  }
};

const handleJwt = async ({
  token,
  user,
}: {
  token: JWT;
  user: User;
}): Promise<JWT> => {
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.name = user.name;
    token.role = user.role as ROLE;
  }
  return token;
};

const handleSession = async ({
  session,
  token,
}: {
  session: Session;
  token: JWT;
}): Promise<Session> => {
  if (token && session.user) {
    session.user.id = token.id as string;
    session.user.email = token.email as string;
    session.user.name = token.name as string;
    session.user.role = token.role as ROLE;
  }
  return session;
};

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeUser,
    }),
  ],
  callbacks: {
    jwt: handleJwt,
    session: handleSession,
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
