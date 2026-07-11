# Interakt WhatsApp + Email OTP — JalVayu AI

Redacted handoff for OTP authentication. **Live credentials belong only in `.env` — never commit secrets.**

## Environment variables

```env
INTERAKT_API_KEY="your-interakt-basic-auth-key-base64"
INTERAKT_OTP_TEMPLATE_NAME=otp_for_help_desk
INTERAKT_OTP_LANGUAGE_CODE=en
INTERAKT_DEFAULT_COUNTRY_CODE=+91
INTERAKT_WEBHOOK_SECRET="your-interakt-webhook-secret"
```

Optional SMTP for email OTP (without SMTP, OTP is logged server-side for dev):

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@ai.rohanbhoi.in
```

## Interakt WhatsApp API

- **URL:** `POST https://api.interakt.ai/v1/public/message/`
- **Auth:** `Authorization: Basic ${INTERAKT_API_KEY}` (key is already Base64 for Basic auth)
- **Template:** `otp_for_help_desk` (language `en`)
- **Body text (Meta-approved):** `{{1}} is your verification code.`

```json
{
  "countryCode": "+91",
  "phoneNumber": "9876543210",
  "type": "Template",
  "callbackData": "{\"purpose\":\"jalvayu_access\",\"email\":\"user@example.com\",\"channel\":\"whatsapp\"}",
  "template": {
    "name": "otp_for_help_desk",
    "languageCode": "en",
    "bodyValues": ["123456"],
    "buttonValues": { "0": ["123456"] }
  }
}
```

- `bodyValues[0]` and `buttonValues["0"]` = same 6-digit OTP
- Success: HTTP 200 and `result: true` in JSON

## OTP rules

| Setting | Value |
|---|---|
| Length | 6 digits (`100000`–`999999`) |
| Expiry | 5 minutes |
| Max verify attempts | 5 |
| Purpose | `jalvayu_access` |
| Channels | `email` or `whatsapp` |

## JalVayu API endpoints

**Send** — `POST /api/auth/otp`

```json
{
  "email": "user@example.com",
  "channel": "whatsapp",
  "phone": "9876543210"
}
```

**Verify** — `POST /api/auth/verify`

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

On success, sets HTTP-only `jalvayu_session` cookie (30-day expiry).

## Implementation files

| File | Role |
|---|---|
| `app/api/auth/otp/route.ts` | Send OTP (email or WhatsApp) |
| `app/api/auth/verify/route.ts` | Verify OTP, issue session |
| `lib/interakt/send-whatsapp-otp.ts` | Interakt client |
| `lib/phone/parse-for-interakt.ts` | +91 phone parsing |
| `lib/email/send-otp-email.ts` | JalVayu-branded email OTP |
| `app/(auth)/login/page.tsx` | Email / WhatsApp OTP UI |

## UI flow

1. User enters email
2. Choose **Email OTP** or **WhatsApp OTP** (phone required for WhatsApp)
3. Enter 6-digit code and verify
4. Redirect to `/dashboard` on success

## Do not

- Expose `INTERAKT_API_KEY` to the browser
- Commit `.env` secrets to git
- Change the Interakt template name unless approved in Meta Business Manager

## Test

```bash
curl -X POST http://127.0.0.1:2510/api/auth/otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","channel":"whatsapp","phone":"9876543210"}'

curl -X POST http://127.0.0.1:2510/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}'
```

## Origin

Adapted from WZATCO helpdesk Interakt setup. Rotate Interakt API key and webhook secret if credentials were shared outside `.env`.
