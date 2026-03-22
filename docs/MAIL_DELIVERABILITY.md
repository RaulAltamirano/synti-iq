# Mail Deliverability — Resend Best Practices

Audit against [Resend's Top 10 Email Deliverability Tips](https://resend.com/blog/top-10-email-deliverability-tips).

---

## Status by Recommendation

| #   | Recommendation                  | Status    | Notes                                                                                                                   |
| --- | ------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------- |
| 1   | **Use subdomain**               | ⚠️ Config | Use `onboarding@notify.syntiiq.com` instead of root domain. Configure in Resend and `MAIL_FROM`.                        |
| 2   | **Configure DMARC**             | ⚠️ DNS    | Add TXT record `_dmarc.syntiiq.com` in DNS. See [Resend DMARC](https://resend.com/docs/dashboard/domains/introduction). |
| 3   | **URLs match domain**           | ✅ OK     | Welcome template has no links. If adding links, ensure they point to your domain.                                       |
| 4   | **Avoid link/open tracking**    | ✅ OK     | No tracking used. Template is transactional without links.                                                              |
| 5   | **Small and accessible emails** | ✅ OK     | Light template (text only, no images). Resend generates HTML; consider `text` alternative if adding complex HTML.       |
| 6   | **No look-alike domains**       | ⚠️ Config | Avoid domains that mimic the brand (e.g. `syntiiq-mails.com`).                                                          |
| 7   | **Test correctly**              | ✅ OK     | Only send to users who just registered (implicit opt-in). Do not send to fake addresses.                                |
| 8   | **Clean email list**            | ✅ OK     | Only send to registrants. Do not send to unsubscribers.                                                                 |
| 9   | **No no-reply**                 | ✅ OK     | Default `onboarding@syntiiq.com` (avoids `noreply@` which reduces trust).                                               |
| 10  | **Send consistently**           | ✅ OK     | Low, predictable volume (1 email per registration).                                                                     |

---

## Code Changes Applied

- **MAIL_FROM default**: `onboarding@syntiiq.com` (previously `noreply@syntiiq.com`) — improves trust with email providers.
- **`+` suffix normalization**: In sandbox, Resend only accepts the exact registered email. If the recipient uses a Gmail alias (`user+test@gmail.com`), it is normalized to `user@gmail.com` before sending; the email still reaches the same inbox.
- **Logo**: Synti-IQ logo is loaded from `{FRONTEND_URL}/logo.svg`. The frontend must serve `public/logo.svg` for the image to load in the email.

---

## Production Checklist

1. [ ] Verify domain in [Resend Dashboard](https://resend.com/domains)
2. [ ] Configure SPF, DKIM, and DMARC in DNS
3. [ ] Use subdomain: `onboarding@notify.syntiiq.com` or similar
4. [ ] Set `MAIL_FROM` in `.env` with the verified domain
