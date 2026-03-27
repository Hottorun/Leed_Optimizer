# Security Notice

## ⚠️ CRITICAL CREDENTIALS EXPOSED

**Date:** 2026-03-27

We have identified that sensitive API credentials were accidentally committed to the git repository and are present in the git history.

### Exposed Credentials

The following credentials were exposed in the git history in the `.env` file:

1. **Supabase Credentials:**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SECRET_KEY`

2. **Resend API Key:**
   - `RESEND_API_KEY`

### Immediate Actions Required

#### 1. Rotate Supabase API Keys

**You must rotate your Supabase API keys immediately:**

1. Log in to your Supabase dashboard at https://supabase.com
2. Navigate to your project
3. Go to **Settings** → **API**
4. Click **Reveal secrets**
5. Generate a new service role key (replace the exposed `SUPABASE_SECRET_KEY`)
6. If needed, generate a new `anon key` (replace `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
7. Update your local `.env` file with the new keys

**Supabase Documentation:** https://supabase.com/docs/guides/api/api-keys

#### 2. Rotate Resend API Key

**You must rotate your Resend API key:**

1. Log in to your Resend dashboard at https://resend.com
2. Navigate to **API Keys**
3. Click **Create API Key**
4. Give it a name (e.g., "production-rotated")
5. Copy the new API key
6. Replace the exposed key in your local `.env` file
7. Delete the old exposed API key

**Resend Documentation:** https://resend.com/docs/dashboard/api-keys

#### 3. Update .env File

After rotating keys, update your `.env` file with the new credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
SUPABASE_SECRET_KEY=your_new_secret_key

# Resend
RESEND_API_KEY=your_new_resend_key
RESEND_FROM_EMAIL=your_from_email
```

### Security Improvements Implemented

The following security improvements have been made to prevent future incidents:

1. **Added `.env` to `.gitignore`** - Prevents accidental commits
2. **Added authentication checks** to API endpoints that return sensitive data
3. **Added input validation** for cookie parsing to prevent injection attacks
4. **Standardized error responses** to prevent information leakage

### Audit Your Systems

After rotating credentials, audit your systems for any suspicious activity:

1. Check Supabase logs for unauthorized access attempts
2. Check Resend sending history for unauthorized emails
3. Review any database changes made by unauthorized users
4. Monitor for unusual API usage patterns

### Update Your Team

Ensure all team members:

1. Are aware of this security incident
2. Update their local `.env` files with the new rotated keys
3. Understand the importance of never committing `.env` files
4. Use environment-specific configuration files (`.env.local`, `.env.production.local`)

### Additional Resources

- [GitHub Documentation: Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/security)
- [Next.js Environment Variables Documentation](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)

### Questions?

If you have questions about this security incident or need help rotating credentials, please contact your security team or system administrator.

---

**Remember:** Never commit `.env` files or any files containing secrets to version control. Always use environment variables and keep sensitive data out of your repository.
