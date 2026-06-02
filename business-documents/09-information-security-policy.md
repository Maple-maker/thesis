# Thesis — Information Security Policy

**Last Updated:** June 2026
**Owner:** Jaiden Rabatin, Owner/CEO

## 1. Scope

This policy applies to all systems, data, and personnel involved in the Thesis application ("the App"), including the mobile client, backend API server, database, and third-party integrations (Plaid, Supabase, DeepSeek API).

## 2. Roles & Responsibilities

| Role | Name | Responsibility |
|------|------|----------------|
| Security Owner | Jaiden Rabatin | All security decisions, incident response, policy maintenance |
| Developer | Jaiden Rabatin | Secure coding, dependency management, deployment |

As a sole-founder operation, all security responsibilities are held by the owner. A group contact email is maintained for continuity: `founder@makeyourthesis.com`.

## 3. Asset Classification

| Asset | Classification | Location |
|-------|---------------|----------|
| Plaid access tokens | **Sensitive** — financial data access | Server (`server/data/plaid-tokens.json`, to be migrated to encrypted database) |
| Plaid API keys | **Critical** — would allow unauthorized data access | Environment variables only, never in source code |
| User profile data | **Confidential** — PII-lite (email, investment preferences) | Supabase (encrypted at rest) |
| Source code | **Internal** | GitHub private repository |
| Mobile app | **Public** | Expo / TestFlight distribution |

## 4. Access Controls

### 4.1 Production Access

- Single developer (Jaiden Rabatin) has production access
- Server access: SSH key-based authentication only (no password login)
- Database access: Supabase dashboard with MFA, service-role key restricted to server-side API routes
- No third-party contractors or employees with production access

### 4.2 Sensitive Data Access

- Plaid API keys: Stored in environment variables (`.env`), never committed to version control
- Plaid access tokens: Server-side only, never exposed to mobile client
- User data: Accessed through Supabase Row-Level Security (RLS) policies, scoped to authenticated user

### 4.3 Client Access

- Users authenticate via Google OAuth (Supabase Auth) before accessing any features
- Plaid Link is only surfaced after authentication
- Mobile app never receives or stores Plaid access tokens

## 5. Encryption

### 5.1 Data in Transit

- All client-server communication uses HTTPS/TLS 1.2+
- Plaid API communication is server-to-server over HTTPS
- Supabase connections use TLS

### 5.2 Data at Rest

- Plaid access tokens: Stored on server filesystem (migration to encrypted database planned before production launch)
- User data in Supabase: Encrypted at rest (AES-256) by Supabase
- Mobile device storage: AsyncStorage (local only, cleared on app deletion)

## 6. Authentication

### 6.1 Consumer Authentication

- Users authenticate via Google OAuth 2.0 (Supabase Auth)
- Google OAuth enforces Google's MFA policies on the consumer side
- Thesis does not store passwords — authentication is delegated to Google

### 6.2 Administrative Authentication

- Supabase dashboard: MFA enabled
- Plaid dashboard: MFA enabled
- GitHub: MFA enabled
- Server SSH: Key-based authentication

## 7. Vulnerability Management

### 7.1 Dependency Scanning

- `npm audit` run on each dependency installation
- Dependabot enabled on GitHub repository for automated vulnerability alerts
- Critical/High vulnerabilities patched within 7 days; Medium within 30 days

### 7.2 Code Review

- All code changes reviewed before merge
- TypeScript strict mode catches type-level issues at compile time
- Server-side input validation on all API endpoints (Zod schemas)

### 7.3 Production Monitoring

- Railway deployment logs monitored for anomalies
- Server health endpoint (`/v1/health`) checked on deploy
- API error rates manually reviewed

## 8. Incident Response

### 8.1 Detection

- Server errors logged with context
- Plaid webhook endpoint (`/v1/webhooks/plaid`) ready for ITEM/HOLDINGS error notifications
- Supabase provides database error monitoring

### 8.2 Response Procedure

1. **Identify:** Determine scope and affected systems
2. **Contain:** Revoke affected credentials, rotate keys, disable compromised endpoints
3. **Investigate:** Review logs, determine root cause
4. **Notify:** Inform affected users within 72 hours; notify Plaid if Plaid data is involved
5. **Remediate:** Patch vulnerability, restore service
6. **Post-mortem:** Document findings, update policy

### 8.3 Contact

- Security contact: `founder@makeyourthesis.com`
- Alternate: `jaiden@makeyourthesis.com`

## 9. Data Retention & Deletion

- Plaid access tokens: Deleted immediately when user disconnects accounts
- User profile and thesis data: Retained until user requests deletion
- Cached financial data: Cleared from client on disconnect
- Users can request full data deletion by email or in-app settings

## 10. Third-Party Risk Management

| Provider | Service | Security Review |
|----------|---------|-----------------|
| Plaid | Financial data aggregation | SOC 2 Type II, ISO 27001 certified |
| Supabase | Database & authentication | SOC 2, encrypted at rest, RLS |
| Railway | Server hosting | SOC 2, isolated containers |
| DeepSeek | AI/LLM API | API key authentication, no financial data sent |
| Google OAuth | Consumer authentication | Industry-standard OAuth 2.0 |

## 11. Policy Review

This policy is reviewed every 6 months or after any significant system change, whichever comes first. Next review: December 2026.

---

**Acknowledged by:**

Jaiden Rabatin, Owner/CEO — June 2026
