# 🚀 Quick Start Guide - Admin Dashboard

**Duration:** 15 minutes to get started  
**Difficulty:** Beginner  
**Prerequisites:** Admin user account

---

## ⏱️ 5-Minute Setup

### Step 1: Create Admin User (2 min)

```bash
cd /path/to/Groomly
npx ts-node scripts/create-admin.ts your-email@example.com
```

**Output:**
```
Admin user created successfully!
Email: your-email@example.com
Password: your-password
```

### Step 2: Restart Dev Server (1 min)

```bash
# Kill current server (Ctrl+C)
# Restart:
npm run dev
```

Server will start on `http://localhost:3001`

### Step 3: Login as Admin (2 min)

1. Go to `http://localhost:3001/auth/login`
2. Enter email and password from Step 1
3. Click "Se connecter"
4. You should see "Admin Groomly" button in sidebar

---

## 👉 Access Admin Dashboard

### Method 1: Click "Admin Groomly" in Sidebar
1. Navigate to `http://localhost:3001/dashboard`
2. Look for "🔐 Admin Groomly" button in sidebar
3. Click it → You're now at `/admin` ✅

### Method 2: Direct URL
- Go to `http://localhost:3001/admin`
- Should load dashboard with 10 sections

### Not Working?
- Check: Are you logged in? (Look for user email in sidebar)
- Check: IsAdmin flag set? (See in user settings)
- Check: Session cookie exists? (Check browser DevTools > Application > Cookies)

---

## 📊 Dashboard Overview (5 min)

### The 9 Admin Sections

```
┌─────────────────────────────────────┐
│         Admin Dashboard             │
├─────────────────────────────────────┤
│  📊 Analytics        │ 📈 Stats     │
│  🐛 Errors          │ 💬 Activity  │
│  🎫 Support         │ 💡 Feedback  │
│  📈 Performance     │ 📦 Usage     │
│  🔔 Webhooks        │              │
└─────────────────────────────────────┘
```

### Each Section Explained

**1. 📊 Analytics** (`/admin` main page)
- Overview of all monitoring data
- Key metrics and summaries
- Links to detailed pages

**2. 🐛 Errors** (`/admin/errors`)
- See all production errors that occurred
- Filter by severity: error, warning, critical
- Filter by resolved status
- Stack traces for debugging

**3. 💬 Activity** (`/admin/activity`)
- Audit trail of all user actions
- See who created/updated/deleted what
- Filter by action type (create, update, delete, login, export, import)
- Timeline view

**4. 🎫 Support** (`/admin/tickets`)
- Support tickets from clients
- Ticket status tracking
- Response management

**5. 💡 Feedback** (`/admin/interactions`)
- Feature requests from users
- Bug reports
- General feedback
- Mark as requiring reply
- Priority levels

**6. 📈 Performance** (`/admin/performance`)
- API response times
- Slow query detection
- Endpoint metrics
- Status: 🟢 Excellent, 🟡 Good, 🟠 Improve, 🔴 Critical

**7. 📦 Usage** (`/admin/usage`)
- Which features are used most
- Usage percentage breakdown
- Time spent on features
- Total items processed

**8. 📊 Stats** (if available)
- High-level business metrics
- Conversion rates
- User growth

**9. 🔔 Webhooks** (`/admin/webhooks`)
- Configure Slack/Discord alerts
- Test webhook delivery
- See webhook status

---

## 🔧 First Integration (10 min)

### Add Error Logging to Your Code

**Before:**
```typescript
export async function POST(req: Request) {
  try {
    const data = await req.json();
    // ... do something ...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);  // ❌ Only console
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

**After:**
```typescript
import { logError } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // ... do something ...
    return NextResponse.json({ success: true });
  } catch (error) {
    // ✅ Now logged to admin dashboard!
    await logError({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack",
      severity: "error",
      url: req.url,
    });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Add Activity Logging

**Before:**
```typescript
// Creating a client - no logging
const client = await prisma.client.create({
  data: { name, email, salonId }
});
```

**After:**
```typescript
import { logActivity } from "@/lib/logger";

// Create client
const client = await prisma.client.create({
  data: { name, email, salonId }
});

// Log the action
await logActivity({
  action: "create",
  resource: "Client",
  resourceId: client.id,
  userId: session.user.id,
  salonId: session.user.salonId,
  newValue: { name, email }
});
```

### Add Performance Monitoring

**Before:**
```typescript
// Slow endpoint - invisible
const results = await expensiveQuery();
```

**After:**
```typescript
import { measurePerformance } from "@/lib/logger";

// Automatically logs if > 500ms
const results = await measurePerformance(
  "detailed-report",
  () => expensiveQuery(),
  req.url
);
```

---

## 🔔 Setup Webhooks (Optional but Recommended)

### Get Slack Webhook URL

1. Go to `https://api.slack.com/apps`
2. Create "New App" → "From scratch" → Name it "Groomly Alerts"
3. Go to "Incoming Webhooks" → Enable
4. Click "Add New Webhook to Workspace"
5. Select channel (e.g., #alerts)
6. Copy the webhook URL

### Add to Environment

```bash
# In .env.local:
SLACK_CRITICAL_WEBHOOK=https://hooks.slack.com/services/YOUR/URL/HERE
```

### Restart Server

```bash
npm run dev
```

### Test It

1. Go to `http://localhost:3001/admin/webhooks`
2. Click "Envoyer notification de test"
3. Check your Slack channel - you should see message!

---

## ✅ Verify Everything Works

### Test 1: Admin Dashboard Load
- [ ] Go to `/admin` - shows dashboard
- [ ] See 9 sections/links
- [ ] No TypeScript errors in console (F12)

### Test 2: Error Logging
- [ ] Go to `/admin/errors`
- [ ] Should show empty table (no errors to log yet)
- [ ] If you see errors, click on one to see details

### Test 3: Activity Logging
- [ ] Go to `/admin/activity`
- [ ] Should show your login(s)
- [ ] Action is "login", Resource is "User"

### Test 4: Webhook Test
- [ ] Go to `/admin/webhooks`
- [ ] See your configured webhooks
- [ ] Click "Test" button
- [ ] Should work if Slack URL configured correctly

**All tests pass? You're ready! 🎉**

---

## 📚 Where to Go Next

| Need | File | Time |
|------|------|------|
| Full feature guide | `ADMIN_COMPLETE_GUIDE.md` | 30 min |
| Code snippets | `SNIPPETS_LOGGING.md` | 20 min |
| API reference | `ADMIN_COMPLETE_GUIDE.md` | 20 min |
| Troubleshooting | `ADMIN_COMPLETE_GUIDE.md` FAQ | 10 min |

---

## 🆘 Common Issues & Fixes

### "Cannot access /admin (Unauthorized)"
```bash
# Problem: Not logged in or not admin
Solution: 
1. Make sure you're logged in (/auth/login)
2. Make sure admin user was created with isAdmin: true
3. Check: SELECT * FROM User WHERE email = 'your@email.com'
   Should have isAdmin: true
```

### "Page loads but no data showing"
```bash
# Problem: API not responding
Solution:
1. Check browser console (F12) for errors
2. Check terminal for API errors
3. Verify database connection (DATABASE_URL in .env.local)
```

### "Webhook not working"
```bash
# Problem: Slack webhook URL invalid
Solution:
1. Test URL in .env.local: `echo $SLACK_CRITICAL_WEBHOOK`
2. Verify it starts with: https://hooks.slack.com/services/
3. Go to /admin/webhooks and click "Test" button
4. Check Slack channel for message
```

### "Build errors with TypeScript"
```bash
Solution:
npm run build           # See actual error
npx prisma generate   # Regenerate types
rm -rf .next          # Clean build cache
npm install           # Reinstall deps
npm run build         # Try again
```

---

## 💡 Pro Tips

### Tip 1: Use Filters
- Most pages have filters at top
- Filter by date, status, severity, etc.
- Makes finding data faster

### Tip 2: Check Regularly
- Errors: Check daily
- Activity: Check when debugging
- Performance: Check weekly
- Usage: Check monthly

### Tip 3: Export Data
- Some pages allow CSV export (future)
- For now, screenshot or note data
- Or query database directly with SQL

### Tip 4: Mobile View
- Admin pages are responsive
- Works on tablet/phone
- Use for quick checks while away

---

## 🎓 Learning Path

### Day 1 (15 min)
- [ ] Read this Quick Start
- [ ] Create admin user
- [ ] Explore dashboard
- [ ] Test one webhook

### Day 2-3 (1 hour)
- [ ] Read `ADMIN_COMPLETE_GUIDE.md`
- [ ] Follow code snippets in `SNIPPETS_LOGGING.md`
- [ ] Add logging to 1-2 existing routes
- [ ] See logs appear in admin dashboard

### Week 1 (2 hours)
- [ ] Add logging to all critical routes
- [ ] Configure all webhooks
- [ ] Train team members
- [ ] Monitor errors/performance

### Week 2+ (Ongoing)
- [ ] Monitor dashboard daily
- [ ] Respond to errors
- [ ] Track usage patterns
- [ ] Optimize based on data

---

## 🎯 Success Criteria

**You're done when:**
- ✅ Admin user created and logged in
- ✅ Can see `/admin` dashboard
- ✅ Can view `/admin/errors` (even if empty)
- ✅ Can view `/admin/activity` and see your login
- ✅ Webhook test message sent to Slack/Discord
- ✅ Added logging to at least 1 route
- ✅ See log appear in admin dashboard within 1 minute

**Estimated time:** 30-45 minutes including setup

---

## 📞 Troubleshooting Flowchart

```
❌ Something not working?

┌─ Is it a BUILD error?
│  └─ Run: npm run build
│     See error message
│     Fix TypeScript issue
│
├─ Is it a LOADING error?
│  └─ Check console (F12)
│     See actual error
│     Fix API issue
│
├─ Is it a DATA issue?
│  └─ No data in table
│     Check if you logged anything yet
│     Try creating test error/activity
│     Verify database connection
│
└─ Is it a WEBHOOK issue?
   └─ Check SLACK_CRITICAL_WEBHOOK in .env.local
      Copy URL from Slack correctly
      Click "Test" in /admin/webhooks
      Verify message appears in Slack
```

---

## 🚀 Ready to Deploy?

Once you're comfortable:

```bash
# 1. Test production build locally
npm run build

# 2. Deploy to Vercel (if using)
vercel

# Or deploy manually
# Push to git, deploy on your hosting

# 3. Run migrations
npx prisma migrate deploy

# 4. Restart application
# (Vercel restarts auto)

# 5. Test admin dashboard on production
# Go to https://your-app.com/admin
```

---

**You've got this! 🎉**

Start with Step 1 above, then come back here if stuck.

Next file to read: `ADMIN_COMPLETE_GUIDE.md` for detailed feature documentation.
