# Authentication & Authorization

This document describes the authentication and authorization system implemented in the Cognito application.

## Overview

Cognito uses **Auth.js (NextAuth v5)** with JWT sessions and role-based access control (RBAC) to manage authentication and authorization.

### Key Features

- ✅ **JWT-based sessions** - Stateless authentication with HTTP-only cookies
- ✅ **Role-based access control** - Two roles: `admin` and `customer`
- ✅ **Password hashing** - bcrypt with salt for secure password storage
- ✅ **Middleware protection** - Automatic route protection based on roles
- ✅ **Internationalization** - Validation errors in multiple languages (EN, PL)
- ✅ **Repository pattern** - Clean separation of database operations

## Architecture

### Technology Stack

- **Auth.js (NextAuth v5)** - Authentication framework with App Router support
- **MongoDB** - User data storage
- **bcryptjs** - Password hashing
- **Zod** - Input validation with i18n support
- **JWT** - Stateless session tokens

### Directory Structure

```
services/
├── auth/
│   ├── auth.config.ts       # Auth.js configuration
│   ├── auth.service.ts      # Password hashing, registration, validation
│   └── auth.helpers.ts      # Helper functions for components
├── registration/
│   └── registration.service.ts  # Registration logic and validation
├── validation/
│   └── validation.service.ts    # Zod i18n configuration
└── locale/
    └── locale.service.ts        # Locale extraction from requests

models/
└── users/
    └── usersModel.ts   # MongoDB user operations

domain/
└── user.ts                  # User domain model with ROLE enum

app/
└── api/
    ├── auth/[...nextauth]/route.ts  # Auth.js handler
    └── register/route.ts            # Registration endpoint

types/
└── next-auth.d.ts          # TypeScript type extensions

middleware.ts               # Route protection middleware
```

## User Roles

```typescript
export enum ROLE {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}
```

- **ADMIN** - Full access to CMS (`/cms/*` routes)
- **CUSTOMER** - Regular users registered through the application

## Authentication Flow

### Registration Flow

1. User submits registration form
2. **API Controller** (`/api/registration`):
   - Extracts locale from URL
   - Validates input with Zod (with i18n errors)
   - Calls service to create user
3. **Registration Service**:
   - Checks if email already exists (via repository)
   - Hashes password with bcrypt
   - Creates user with `CUSTOMER` role
4. **Repository**:
   - Inserts user into MongoDB
   - Returns created user

```
User → API (/api/registration) → Registration Service → Repository → MongoDB
         ↓
    Validation (Zod + i18n)
```

### Login Flow

1. User submits credentials
2. **Auth.js** (`/api/auth/[...nextauth]`):
   - Receives email and password
   - Calls `authorizeUser` function
3. **Auth Service**:
   - Finds user by email (via repository)
   - Verifies password with bcrypt
   - Returns user data if valid
4. **JWT Creation**:
   - Auth.js creates JWT token with user data + role
   - Stores in HTTP-only cookie

```
User → Auth.js → Auth Service → Repository → MongoDB
                     ↓
              Password Verification
                     ↓
              JWT Token Creation
```

### Authorization Flow (Middleware)

1. User requests protected route (e.g., `/en/cms/dashboard`)
2. **Middleware** checks:
   - Is user authenticated? → If NO: redirect to `/cms/login`
   - Is user ADMIN? → If NO: redirect to home page
   - If YES: allow access

```
Request → Middleware → Check Session → Check Role → Allow/Deny
```

## API Endpoints

### POST `/api/registration`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "termsAccepted": true
}
```

**Validation Rules:**
- `email` - Valid email format
- `password` - Minimum 8 characters, at least one uppercase letter and one number
- `termsAccepted` - Must be true

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

**Error Responses:**

- **400 Validation Failed:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

- **409 User Exists:**
```json
{
  "error": "User with this email already exists"
}
```

### POST `/api/auth/signin`

Login with credentials (handled by Auth.js).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST `/api/auth/signout`

Logout current user (handled by Auth.js).

## Usage in Components

### Server Components

#### Require Authentication

```typescript
import { requireAuth } from '@/services/auth/auth.helpers';

export default async function ProfilePage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const user = await requireAuth(locale);

  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

#### Require Admin Role

```typescript
import { requireAdmin } from '@/services/auth/auth.helpers';

export default async function DashboardPage({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const user = await requireAdmin(locale);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome {user.name}</p>
    </div>
  );
}
```

#### Optional Authentication

```typescript
import { getCurrentUser } from '@/services/auth/auth.helpers';
import { ROLE } from '@/domain/user';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div>
      <h1>Home</h1>
      {user ? (
        <>
          <p>Welcome back, {user.name}!</p>
          {user.role === ROLE.ADMIN && (
            <a href="/cms">Go to Admin Panel</a>
          )}
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </div>
  );
}
```

#### Check Role

```typescript
import { hasRole } from '@/services/auth/auth.helpers';
import { ROLE } from '@/domain/user';

export default async function SomePage() {
  const isAdmin = await hasRole(ROLE.ADMIN);

  return (
    <div>
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Client Components

```typescript
'use client';

import { useSession, signOut } from 'next-auth/react';

export const UserMenu = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <a href="/login">Login</a>;
  }

  return (
    <div>
      <span>Welcome, {session.user.name}</span>
      <span>Role: {session.user.role}</span>
      <button onClick={() => signOut()}>Logout</button>
    </div>
  );
};
```

## Helper Functions

### `getCurrentUser()`

Returns the currently authenticated user or `null`.

```typescript
const user = await getCurrentUser();
// user: { id, email, name, role } | null
```

### `requireAuth(locale: string)`

Requires user to be authenticated. Redirects to login if not.

```typescript
const user = await requireAuth('en');
// user: { id, email, name, role }
```

### `requireAdmin(locale: string)`

Requires user to have ADMIN role. Redirects if not admin.

```typescript
const admin = await requireAdmin('en');
// admin: { id, email, name, role: 'admin' }
```

### `hasRole(role: ROLE)`

Checks if current user has specific role.

```typescript
const isAdmin = await hasRole(ROLE.ADMIN);
// isAdmin: boolean
```

### `isAuthenticated()`

Checks if user is authenticated.

```typescript
const authenticated = await isAuthenticated();
// authenticated: boolean
```

## Middleware Protection

The middleware automatically protects routes based on authentication and roles.

### Protected Routes

#### CMS Routes (Admin Only)

All `/cms/*` routes except `/cms/login` require:
- ✅ User is authenticated
- ✅ User has `ADMIN` role

```typescript
// middleware.ts
if (isCmsRoute && !isCmsLoginRoute) {
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(`/${locale}/cms/login`);
  }

  if (session.user.role !== ROLE.ADMIN) {
    return NextResponse.redirect(`/${locale}`);
  }
}
```

### Adding New Protected Routes

To protect additional routes, update `middleware.ts`:

```typescript
// Example: Protect /profile routes
const isProfileRoute = pathname.includes('/profile');

if (isProfileRoute) {
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(`/${locale}/login`);
  }
}
```

## Environment Variables

Create `.env.local`:

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/cognito

# NextAuth configuration
NEXTAUTH_URL=http://localhost:2137
NEXTAUTH_SECRET=your-super-secret-key-here
```

Generate secret:
```bash
openssl rand -base64 32
```

## Security Best Practices

### Password Security
- ✅ Passwords are hashed with **bcrypt** (salt rounds: 10)
- ✅ Never stored in plain text
- ✅ Minimum 8 characters required
- ✅ Hash verification on login

### Session Security
- ✅ **JWT tokens** stored in HTTP-only cookies
- ✅ 30-day session expiration
- ✅ Tokens include: id, email, name, role
- ✅ No sensitive data in tokens

### Route Protection
- ✅ Middleware checks on every request
- ✅ Role-based access control
- ✅ Automatic redirects for unauthorized access
- ✅ No client-side only protection

### Input Validation
- ✅ **Zod schemas** validate all inputs
- ✅ Server-side validation in API routes
- ✅ Translated error messages (i18n)
- ✅ Type-safe with TypeScript

## Testing

All authentication services have comprehensive test coverage:

### Run Tests

```bash
npm test
```

### Test Files

- `models/users/usersModel.test.ts` - Model layer tests
- `services/auth/auth.service.test.ts` - Auth service tests
- `services/registration/registration.service.test.ts` - Registration tests
- `services/locale/locale.service.test.ts` - Locale extraction tests

### MongoDB Memory Server

Tests use `mongodb-memory-server` for isolated testing:

```typescript
import { setupMongoTest, teardownMongoTest } from '@/test/utils/mongoTestUtils';

let context: IMongoTestContext;

beforeEach(async () => {
  context = await setupMongoTest();
});

afterEach(async () => {
  await teardownMongoTest(context);
});
```

See [TEST_GUIDE.md](./TEST_GUIDE.md) for detailed testing documentation.

## Troubleshooting

### "Invalid credentials" on login

**Causes:**
- Wrong email or password
- User account is banned
- User not found in database

**Solution:**
- Verify credentials
- Check MongoDB for user account
- Check `banned` field in user document

### Middleware redirecting incorrectly

**Causes:**
- Session not created properly
- JWT token expired
- Role mismatch

**Solution:**
- Check `NEXTAUTH_SECRET` in `.env.local`
- Verify session in browser DevTools (Application → Cookies)
- Clear cookies and login again

### Registration fails with validation errors

**Causes:**
- Input doesn't meet minimum requirements
- Invalid email format
- Email already exists

**Solution:**
- Check validation rules in schema
- Ensure all required fields are provided
- Use unique email address

### TypeScript errors with session.user.role

**Causes:**
- Missing type extensions

**Solution:**
- Ensure `types/next-auth.d.ts` exists
- Restart TypeScript server in IDE
- Check imports in components

## Future Enhancements

Potential improvements for the authentication system:

- [ ] Email verification on registration
- [ ] Password reset flow
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication (2FA)
- [ ] Account activation flow
- [ ] Password strength meter
- [ ] Rate limiting on login attempts
- [ ] Session management dashboard
- [ ] Audit logs for authentication events
- [ ] Remember me functionality

## References

- [Auth.js Documentation](https://authjs.dev/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [bcrypt Documentation](https://www.npmjs.com/package/bcryptjs)
- [Zod Documentation](https://zod.dev/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
