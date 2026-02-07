# 📋 Production Deployment Checklist - Security Hardened

This checklist ensures your Groomly SaaS deployment is secure, performant, and ready for production traffic.

## ✅ Pre-Deployment Verification (Before any environment)

### Environment & Secrets
- [ ] `.env.local` file is in `.gitignore` (never committed)
- [ ] All required env vars are set:
  - [ ] DATABASE_URL
  - [ ] NEXTAUTH_URL
  - [ ] NEXTAUTH_SECRET (unique, 32+ characters)
  - [ ] REDIS_URL (for rate limiting)
- [ ] No secrets committed to Git history
- [ ] NEXTAUTH_SECRET was generated with `crypto.randomBytes(32).toString('base64')`

### Build & Compilation
- [ ] `npm run build` completes successfully (0 errors)
- [ ] `npm run lint` passes (ESLint warnings OK for now)
- [ ] TypeScript compilation successful
- [ ] No runtime errors in build output
- [ ] Build size is reasonable (~5-10MB .next folder)

### Security Configuration
- [ ] [next.config.js](next.config.js) has correct CORS settings
- [ ] CORS_ALLOWED_ORIGINS points to your domain (not `*`)
- [ ] Security headers configured:
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block
- [ ] All API routes return sanitized errors (not stack traces)

---

## ✅ Development Environment Setup

### Local Testing
- [ ] `npm run dev` starts without errors
- [ ] Server runs on http://localhost:3000
- [ ] Can register with valid password
- [ ] Can login successfully
- [ ] Database connection works (`npx prisma studio` opens)
- [ ] Rate limiting works (5 requests → 429 error)
- [ ] Logs don't contain sensitive data (passwords, API keys)
- [ ] CORS works (localhost:3000 allowed, others blocked)

### Testing Scenarios

**Authentication Flow**
```bash
# Test registration with invalid password
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak"}'
# Should fail: password must be 8+ chars with uppercase, lowercase, number

# Test registration with valid password
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"SecurePass123"}'
# Should succeed
```

**Rate Limiting**
```bash
# Make 5 login requests rapidly
for i in {1..5}; do
  curl -s -X POST http://localhost:3000/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' | jq '.message'
done
# Requests 1-4: 401 Unauthorized
# Request 5: 429 Too Many Requests
```

**Logging**
```bash
# Check terminal output for logs
# Ensure NO passwords, tokens, or API keys appear in logs
# Logs should look like:
# ✅ [AUTH] USER_REGISTERED: user_123 | {"email":"test@test.com"}
```

---

## ✅ Staging Environment Setup

### Infrastructure
- [ ] Database provisioned (PostgreSQL on Supabase/Railway/AWS RDS)
- [ ] Redis instance created (Upstash recommended - free tier available)
- [ ] Environment variables configured on hosting platform
- [ ] Database migrations run: `npx prisma migrate deploy`
- [ ] Database backup configured

### Configuration Files
- [ ] `.env.staging` created with staging values
- [ ] NEXTAUTH_URL points to staging domain (e.g., staging.groomly.com)
- [ ] NODE_ENV set to "production" (for proper logging)
- [ ] LOG_LEVEL set to "info" (only important logs)
- [ ] REDIS_URL points to production Redis instance
- [ ] DATABASE_URL points to staging database
- [ ] NEXTAUTH_SECRET is unique (different from dev)

### Security Verification
- [ ] CORS only allows staging domain
- [ ] SSL/TLS certificate installed and valid
- [ ] Security headers present in responses
- [ ] Rate limiting works with Redis backend
- [ ] Database connection is secure (SSL, strong password)
- [ ] No debug logs in console

### Testing on Staging
- [ ] Full registration flow works
- [ ] Full login flow works
- [ ] Create client/animal/appointment works
- [ ] Rate limiting works under load (use tools like Apache Bench)
- [ ] Error messages are sanitized (no stack traces)
- [ ] Logs are clean (no secrets visible)
- [ ] Performance is acceptable (<200ms API responses)

### Sentry Integration (Optional but Recommended)
- [ ] Sentry account created at sentry.io
- [ ] Next.js project created in Sentry
- [ ] NEXT_PUBLIC_SENTRY_DSN retrieved
- [ ] `SENTRY_AUTH_TOKEN` generated (for source maps in production builds)
- [ ] `.env.staging` has both SENTRY variables
- [ ] Test error is visible in Sentry dashboard

---

## ✅ Production Environment Setup

### Database & Infrastructure
- [ ] Production database provisioned (PostgreSQL)
- [ ] Database backups configured (daily)
- [ ] Database monitoring enabled (track query performance)
- [ ] Redis instance provisioned (Upstash, Vercel Redis, or self-hosted)
- [ ] CDN configured (optional but recommended for images)
- [ ] SSL certificate installed and valid
- [ ] CI/CD pipeline configured for deployments

### Environment Variables (Production)
```bash
# Must be set on your hosting platform (Vercel, Railway, etc.)
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=<unique-secret-different-from-staging>
DATABASE_URL=<production-database-url>
REDIS_URL=<production-redis-url>
REDIS_TOKEN=<redis-token-if-required>
NODE_ENV=production
LOG_LEVEL=info
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<sentry-auth-token>
```

### Security Checklist
- [ ] NEXTAUTH_SECRET is strong (32+ chars, random)
- [ ] Database password is strong (20+ chars, random)
- [ ] Redis token is set (if using Upstash)
- [ ] CORS only allows production domain (https://your-domain.com)
- [ ] All environment variables are encrypted (use hosting platform vault)
- [ ] No secrets in code or comments
- [ ] HTTPS enforced (redirect http → https)
- [ ] Security headers present in all responses
- [ ] CSP (Content Security Policy) configured if needed

### Deployment Checklist
- [ ] DNS configured and pointing to hosting platform
- [ ] SSL certificate issued and valid
- [ ] Database migrations run on production: `npx prisma migrate deploy`
- [ ] Build test succeeds: `npm run build`
- [ ] Application starts without errors: `npm start`
- [ ] Health check endpoint works (`/api/health` or `/`)
- [ ] Monitoring/alerting configured

---

## ✅ Post-Deployment Verification

### Application Health
- [ ] Application loads without errors
- [ ] No 500 errors on home page
- [ ] Database connections are stable
- [ ] Redis connections working
- [ ] Can register new user with strong password
- [ ] Can login successfully
- [ ] Sessions persist across requests
- [ ] CSRF tokens generated and validated

### Security Verification
- [ ] CORS headers correct (only your domain)
- [ ] No sensitive data in error responses
- [ ] Rate limiting active (fewer than expected requests fail with 429)
- [ ] Passwords not logged anywhere
- [ ] API keys/tokens not logged
- [ ] HTTPS enforced (http → https redirect works)
- [ ] Security headers present:
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block

### Monitoring & Logging
- [ ] Sentry is capturing errors (if configured)
- [ ] Logs are accessible (check hosting platform logs)
- [ ] Performance metrics tracked (response times, error rates)
- [ ] Alerts configured for:
  - [ ] Error rate > 1%
  - [ ] Response time > 1000ms
  - [ ] Database connection failures
  - [ ] Redis connection failures

### Performance Benchmark
- [ ] Home page loads in < 2 seconds
- [ ] API responses in < 500ms
- [ ] Rate limiting doesn't cause false positives
- [ ] Database queries optimized (no N+1 problems)
- [ ] No memory leaks (monitor heap usage)

---

## ✅ Ongoing Production Operations

### Daily
- [ ] Check error rate in Sentry/logs (should be < 0.1%)
- [ ] Verify all endpoints responding (health check)
- [ ] Check database disk space (should be < 80% full)

### Weekly
- [ ] Review error patterns in Sentry
- [ ] Check performance metrics (API response times)
- [ ] Review security logs for suspicious activity
- [ ] Database backup verification

### Monthly
- [ ] Update dependencies (`npm audit`)
- [ ] Review rate limiting thresholds (adjust if needed)
- [ ] Security audit of logs
- [ ] Database maintenance (vacuum, analyze)
- [ ] Sentry error trends analysis

### Quarterly
- [ ] Full security audit (check for new vulnerabilities)
- [ ] Performance optimization review
- [ ] Disaster recovery test (restore from backup)
- [ ] Load testing (simulate peak traffic)

---

## 🚨 Emergency Procedures

### Database Down
```bash
# Check database status
npx prisma db execute --stdin < check.sql

# Restart database (contact hosting provider)
# Re-run migrations if needed
npx prisma migrate deploy
```

### Rate Limiting Not Working
```bash
# Check Redis connection
redis-cli ping
# Should return "PONG"

# If no Redis, in-memory fallback is active
# Restart application to clear in-memory state
pm2 restart groomly
```

### High Error Rate
```bash
# Check Sentry dashboard
# Find error pattern
# Review recent code changes
# Rollback if necessary: git revert <commit>
```

### Security Breach
1. Check Sentry for suspicious errors
2. Review database access logs
3. Check for unauthorized API access (from unusual IPs/locations)
4. Rotate NEXTAUTH_SECRET if compromised
5. Force re-login of all users
6. Review recent deploys for code changes

---

## 📊 Key Metrics to Monitor

### Uptime
- Target: 99.5% uptime
- Alert if: Down for > 5 minutes

### Performance
- Response time: Target < 500ms
- Alert if: > 1000ms

### Error Rate
- Target: < 0.1%
- Alert if: > 1%

### Rate Limiting
- Login failures per minute: Monitor for attacks
- API rate limit hits: Normal during load testing
- Register rate limit hits: High if under attack

### Security
- Failed logins: Track for brute force attempts
- CORS violations: Should be rare
- Validation errors: Review for attack patterns

---

## ✅ Decommissioning Checklist (if needed)

- [ ] Database backup created
- [ ] Data export for legal compliance (GDPR)
- [ ] Notify users of shutdown
- [ ] Deactivate Stripe accounts
- [ ] Cancel hosting/database services
- [ ] Revoke API keys and tokens
- [ ] Remove from monitoring/Sentry
- [ ] Archive logs for legal retention

---

## 🎯 Success Criteria

Your production deployment is successful when:

✅ Application is live and accessible  
✅ Users can register and login  
✅ No security vulnerabilities detected  
✅ Error rate is < 0.1%  
✅ Response times are < 500ms  
✅ Database is properly backed up  
✅ Monitoring and alerting are in place  
✅ Team is trained on incident response  

---

## 📞 Support Matrix

| Issue | Team | Timeline |
|-------|------|----------|
| Application error | Backend | 15 min |
| Database down | DBA/DevOps | 30 min |
| Security breach | Security | 5 min |
| Performance issue | Backend | 1 hour |
| Feature request | Product | Next sprint |

---

**Last Updated**: 2026-02-10  
**Status**: ✅ Ready for Production Deployment  
**Approved By**: Security Team  
