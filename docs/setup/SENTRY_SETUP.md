# Sentry Configuration Guide

Sentry is an error tracking and performance monitoring platform. It helps catch production errors before your users report them.

## Quick Setup (5 minutes)

### 1. Create a Sentry Account
- Go to https://sentry.io
- Sign up or log in
- Create a new organization

### 2. Create a Next.js Project
- Click "Create Project"
- Select **Next.js** as the platform
- Name it "Groomly"
- Create the project

### 3. Get Your DSN
- In the project settings, go to **Client Keys (DSN)**
- Copy the DSN value (looks like: `https://abc123@xyz.ingest.sentry.io/123456`)

### 4. Configure Environment Variables
Update your `.env.local`:

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@sentry.io/project-id

# Optional: For more advanced features
# SENTRY_AUTH_TOKEN=your-auth-token (for source map uploads in production)
```

### 5. Restart Your Dev Server
```bash
npm run dev
```

## Verification

Sentry will start capturing errors automatically. To test:

1. Create an error in your app:
   ```typescript
   throw new Error('Test error from Groomly')
   ```

2. Wait 10-15 seconds
3. Check the Sentry dashboard - the error should appear

## Features Enabled

✅ **Error Tracking**
- Automatic error capture from API routes and client-side
- Stack traces with source maps
- Error grouping and deduplication

✅ **Session Replay**
- Record 10% of user sessions for debugging
- Capture all sessions with errors
- Masked text and media for privacy

✅ **Performance Monitoring**
- Track API response times
- Monitor database query performance
- Identify slow endpoints

✅ **User Context**
- Associate errors with user ID
- Track user behavior before errors
- Create alerts for specific users

## Configuration in Groomly

### Automatic Error Capture
All API routes automatically capture errors via the `logger.ts` utility:

```typescript
import { logger } from '@/lib/logger'

try {
  // your code
} catch (error) {
  logger.error('DELETE_ACCOUNT', error)
  // Automatically logged to Sentry with context
}
```

### Manual Error Capture
For custom error handling:

```typescript
import { captureException } from '@/lib/sentry'

try {
  // risky operation
} catch (error) {
  captureException(error as Error, {
    endpoint: '/api/clients',
    userId: session.user.id,
    action: 'CREATE_CLIENT',
  })
}
```

### Set User Context
When user logs in, their errors are tagged with their ID:

```typescript
import { setUserContext } from '@/lib/sentry'

// After successful login:
setUserContext(user.id, user.email, user.name)
```

### Capture Messages
For important events:

```typescript
import { captureMessage } from '@/lib/sentry'

captureMessage('Payment processed successfully', 'info')
captureMessage('Rate limit exceeded for user', 'warning')
```

## Monitoring in Production

### Alert Setup
1. Go to Alerts → Create Alert Rule
2. Set condition: "Error rate is above 5% in last 5 minutes"
3. Choose notification channel (Email, Slack, etc.)
4. Save

### Dashboard
Key metrics to monitor:
- **Crash Free Sessions**: Target > 99%
- **Error Rate**: Trending down = good
- **Average Transaction Duration**: Track performance
- **User Feedback**: Monitor satisfaction

## Development vs Production

### Development Mode
- `tracesSampleRate: 1.0` (capture 100% of traces)
- `replaysSessionSampleRate: 0.1` (10% of sessions)
- Errors are logged locally AND sent to Sentry

### Production Mode
- `tracesSampleRate: 0.1` (10% sampling to control costs)
- `replaysSessionSampleRate: 0.1` (10% of sessions)
- All critical errors captured

## Cost Optimization

Sentry has a free tier with limits:
- 5,000 events/month free
- Groomly typical usage: ~500-1000 events/month (good)

To reduce costs in high-traffic scenarios:
```typescript
tracesSampleRate: 0.05 // 5% sampling
replaysSessionSampleRate: 0.05 // 5% of sessions
```

## Troubleshooting

### DSN not set - Sentry disabled?
- Check `.env.local` has `NEXT_PUBLIC_SENTRY_DSN`
- Prefix must have `NEXT_PUBLIC_` to be available in browser
- Restart dev server after changing env vars

### Errors not appearing?
- Wait 10-15 seconds (Sentry batches events)
- Check browser console for CORS errors
- Verify DSN is correct

### Too many events?
- Lower `tracesSampleRate` (currently 0.1 in prod)
- Set up error filtering in `beforeSend()`
- Exclude known non-critical errors

## Next Steps

- [ ] Create Sentry account
- [ ] Create Next.js project
- [ ] Copy DSN to `.env.local`
- [ ] Restart dev server
- [ ] Test error capture
- [ ] Set up alerts
- [ ] Deploy to production

## Useful Links

- [Sentry Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/enriching-events/distributed-tracing/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/session-replay/)
