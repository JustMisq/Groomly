# 🚀 Groomly - Quick Start After Security Hardening

## What Changed?

Your Groomly app has been security hardened with:
- ✅ CORS protection (restricted to localhost:3000)
- ✅ NEXTAUTH_SECRET configured
- ✅ Centralized logging (no secrets exposed)
- ✅ Input validation (strong passwords, Zod schemas)
- ✅ Rate limiting (Redis + in-memory fallback)
- ✅ Error sanitization (no stack traces in prod)
- ✅ Sentry integration (optional error tracking)

**Everything is backward compatible** - your existing code still works!

---

## 🏃 Start Here (5 minutes)

### 1. Start Dev Server

```bash
npm run dev
```

**Expected output:**
```
✓ Next.js 15.5.12
✓ Compiled successfully in 5.3s
✓ Ready in 1.2s
📖 http://localhost:3000
```

### 2. Test Authentication

**Register a new user**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'
```

**Expected response**:
```json
{
  "user": {
    "id": "user_123",
    "email": "test@example.com",
    "name": "Test User"
  },
  "salon": {
    "id": "salon_123",
    "name": "My Salon",
    "userId": "user_123"
  }
}
```

### 3. Test Login

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

### 4. Check Logs

Logs now appear in the terminal, **without exposing secrets**:

```
✅ 2026-02-10T10:30:45.123Z [AUTH] USER_REGISTERED: user_123 | {"email":"test@example.com"}
✅ 2026-02-10T10:31:12.456Z [API] POST /api/auth/register | 201 | 145ms | user_123
```

Notice:
- Passwords are **never** logged
- API keys are **never** logged
- Only necessary information is included

---

## 🔒 Security Features

### Password Validation

Passwords must now be **strong**:
- Minimum 8 characters
- Must contain uppercase letter (A-Z)
- Must contain lowercase letter (a-z)
- Must contain number (0-9)

❌ ~~"password"~~ - Too simple  
❌ ~~"Pass123"~~ - Too short  
✅ "SecurePass123" - Valid

### Rate Limiting

The app now protects against brute force attacks:

```bash
# Try login 5 times rapidly
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"WrongPass123"}'
done
```

**Result**:
- Attempts 1-4: Return authentication error (401)
- Attempt 5: Returns "Too many requests" (429)
- After 60 seconds: Resets, can try again

### CORS Protection

API is now only accessible from `localhost:3000`:

```bash
# This works (same origin)
fetch('http://localhost:3000/api/clients')

# This is blocked (different origin)
fetch('http://localhost:3000/api/clients', {
  method: 'GET',
  headers: {
    'Origin': 'https://attacker.com'
  }
})
// Error: CORS policy
```

---

## 📊 Monitoring & Logging

### View Logs in Terminal

All logs appear in your terminal as the server runs:

```
POST /api/auth/register (201) 142ms
  User registered: user_123
  Email: test@example.com

POST /api/clients (201) 89ms
  Client created: client_456
  Salon: salon_123
```

### Log Levels

Current level: `debug` (development)
- Shows: All logs including debug info
- Use in: Development environments

For production, change to `info`:
- Shows: Only important logs
- Use in: Production environment

### Error Tracking

If configured with Sentry, errors automatically appear in Sentry dashboard:
1. Error occurs
2. Logged locally with unique errorId: `err_abc123`
3. Sent to Sentry (1-5 second delay)
4. View in Sentry dashboard

---

## 🧪 Testing Rate Limiting

### Test 1: Too Many Login Attempts

```bash
# Script to test rate limiting
for i in {1..7}; do
  echo "Attempt $i:"
  curl -s -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' | jq '.message'
  sleep 0.5
done
```

**Expected output**:
```
Attempt 1: "Invalid credentials"
Attempt 2: "Invalid credentials"
Attempt 3: "Invalid credentials"
Attempt 4: "Invalid credentials"
Attempt 5: "Too many requests"
Attempt 6: "Too many requests"
Attempt 7: "Too many requests"
```

After 60 seconds, resets.

### Test 2: Registration Limit

Only 3 registrations per hour per IP:

```bash
# First 3 registrations succeed
# 4th fails with 429 Too Many Requests
```

---

## 🔧 Troubleshooting

### Redis Connection Warning

```
⚠️ Redis connection failed, falling back to in-memory rate limiting
```

**This is normal!**

- In development without Redis: Uses in-memory storage
- Rate limiting still works perfectly
- No action needed

### To Use Redis (Optional)

Install Redis locally:

**On Windows (PowerShell as Admin)**:
```powershell
# Install with chocolatey
choco install redis -y

# Or download from: https://github.com/microsoftarchive/redis/releases
```

**On Mac**:
```bash
brew install redis
brew services start redis
```

**On Linux**:
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

Start Redis in one terminal:
```bash
redis-cli
```

Start Groomly in another:
```bash
npm run dev
```

Redis connects automatically when `.env.local` has `REDIS_URL`.

### CORS Error in Frontend

If you see CORS error "Access to XMLHttpRequest has been blocked by CORS policy":

1. Check browser DevTools (F12) → Network tab
2. Ensure request is from `http://localhost:3000`
3. Check `.env.local` has `NEXTAUTH_URL=http://localhost:3000`
4. Restart dev server: `npm run dev`

### Sentry Warnings

If you see Sentry warnings:

```
[Upstash Redis] The 'token' property is missing...
```

**This is normal!**

Sentry is optional. Warning disappears after configuring:
1. Create Sentry account at sentry.io
2. Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
3. Or remove Sentry if not using it

---

## 📋 Checklist for Development

### Before Starting

- [x] `.env.local` file exists with correct values
- [x] Database connection working
- [x] Node modules installed (npm install)
- [x] NEXTAUTH_SECRET set

### After Starting

- [ ] Server running on http://localhost:3000
- [ ] Can register with strong password
- [ ] Can login successfully
- [ ] Logs appear in terminal without secrets
- [ ] Rate limiting works (5 attempts → blocked)

### Database

Check database is working:
```bash
# If using Prisma studio
npx prisma studio

# Should open browser to database viewer
# Can see users, salons, clients, animals, etc.
```

---

## 🚀 Next Steps

### Week 1: Development
1. Run `npm run dev`
2. Test login/registration
3. Verify logs are clean
4. Test rate limiting
5. Create demo data

### Week 2: Enhancement
1. Set up Redis (if planning high load)
2. Configure Sentry (optional)
3. Run `npm run build` (test production build)
4. Test on staging server

### Week 3: Deployment
1. Update production variables
2. Deploy to production
3. Monitor Sentry (if configured)
4. Monitor rate limiting

---

## 🔐 Security Reminders

✅ **Your app now:**
- Rejects weak passwords
- Blocks brute force attacks
- Never logs sensitive data
- Validates all input
- Limits API access by origin
- Tracks errors with context

❌ **Never (even with these fixes):**
- Commit `.env.local` to Git
- Share NEXTAUTH_SECRET
- Store payment tokens unencrypted
- Open CORS to `*`
- Log user passwords

---

## 📞 Need Help?

### Common Issues

**"Port 3000 already in use"**
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

**"Database connection failed"**
```bash
# Check DATABASE_URL in .env.local
# Test connection with Prisma
npx prisma db push

# Or view schema
npx prisma studio
```

**"NEXTAUTH errors"**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Documentation

- Security changes: [SECURITY_HARDENING_COMPLETE.md](SECURITY_HARDENING_COMPLETE.md)
- Logger usage: [src/lib/logger.ts](src/lib/logger.ts)
- Rate limiting: [src/lib/rate-limit.ts](src/lib/rate-limit.ts)
- Sentry setup: [docs/setup/SENTRY_SETUP.md](docs/setup/SENTRY_SETUP.md)

---

## 🎉 You're All Set!

Your application is now:
- ✅ Secure from common attacks
- ✅ Ready for development
- ✅ Production-ready (with Redis + Sentry)
- ✅ Easy to debug (clean logs)
- ✅ Fully validated (strong passwords, input cleaning)

**Start now**: `npm run dev`

Happy coding! 🚀
