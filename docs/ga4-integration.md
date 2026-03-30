# Google Analytics 4 (GA4) Integration Guide

## Setup

### Step 1: Get GA4 Measurement ID
1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property or use existing
3. Go to Admin → Data Streams → Web
4. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### Step 2: Add to Application
Add the GA4 script to `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Step 3: Event Tracking Structure

| Event Name | Trigger | Parameters |
|---|---|---|
| `page_view` | Route change | `page_path`, `page_title` |
| `quiz_start` | User starts scalp test | `session_id` |
| `quiz_complete` | User finishes quiz | `session_id`, `score` |
| `report_view` | User views report | `score`, `scalp_type` |
| `email_capture` | User enters email on report | `source` |
| `signup` | User creates account | `method` (email/google) |
| `upgrade_click` | User clicks upgrade | `plan` |
| `product_click` | User clicks product | `product_id`, `product_name` |
| `referral_share` | User shares referral link | `platform` |

### Step 4: Conversion Events
Mark these as conversions in GA4 Admin:
- `quiz_complete`
- `email_capture`
- `signup`
- `upgrade_click`

## Notes
- GA4 Measurement ID is not yet configured in this project
- When ready, provide the ID and it will be integrated into the codebase
