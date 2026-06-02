# Plaid Security Questionnaire — Answer Key

**Application:** Thesis (makeyourthesis.com)
**Contact:** Jaiden Rabatin, founder@makeyourthesis.com
**Date:** June 2026

---

## Q1: Security Contact ✅

- Name: Jaiden Rabatin
- Title: Owner/CEO
- Email: founder@makeyourthesis.com
- Alternate: jaiden@makeyourthesis.com

---

## Q2: Documented Information Security Policy?

**Answer: Yes**

Upload: `business-documents/09-information-security-policy.md`

---

## Q3: Access Controls?

- [x] Role-based access controls (single admin; Supabase RLS)
- [x] MFA for administrative access (all dashboards)
- [x] SSH key-based authentication (server, no passwords)
- [x] Environment variable-based secrets management
- [x] Principle of least privilege

---

## Q4: MFA for Consumers Before Plaid Link? ✅

**Answer: Yes — Phishing-resistant MFA (TOTP/Google Authenticator)**

Implementation: `POST /v1/mfa/setup` → QR code → Google Authenticator → `POST /v1/mfa/verify`

Screenshot needed: MFA setup screen with QR code (tap "Link accounts" in Accounts tab)

---

## Q5: MFA for Critical Systems?

**Answer: Yes**

Supabase, Plaid, and GitHub dashboards all have MFA. Server access via SSH keys only.

---

## Q6: TLS 1.2+ in Transit?

**Answer: Yes**

HTTPS/TLS 1.2+ on all connections (Railway, Supabase, Plaid API).

---

## Q7: Encryption at Rest for Plaid Data?

**Answer: Yes**

Filesystem encryption on server. Supabase AES-256 at rest. Tokens never on mobile device.

---

## Q8: Vulnerability Scans?

- [x] Dependency scanning (npm audit, Dependabot)
- [x] Static analysis (TypeScript strict, Zod validation)
- [x] Manual code review

---

## Q9: Privacy Policy?

**Answer: Yes**

Document: `business-documents/06-privacy-policy.md`
URL (once published): makeyourthesis.com/privacy

---

## Q10: Consumer Consent?

**Answer: Yes**

Plaid Link in-flow consent + Privacy Policy + Terms of Service acceptance.

---

## Q11: Data Deletion & Retention Policy?

**Answer: Yes**

Plaid tokens deleted on disconnect. User deletion by request. Policy reviewed every 6 months.

---

## Document Upload Checklist

| Question | File to Upload |
|----------|---------------|
| Q2 | `09-information-security-policy.md` |
| Q4 | Screenshot of MFA setup screen (QR code) |
| Q9 | `06-privacy-policy.md` (or link to makeyourthesis.com/privacy) |
