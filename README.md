# Tution Hub

A tuition centre manager for small coaching centres — students, batches, attendance, fees and reports in one place, with no backend and no account to create. Records stay on the device in the browser's IndexedDB, so it works offline and nothing is uploaded anywhere.

## Status: this is the vibe-coded version

Be clear about what this repo is. It's the **vibe-coded prototype** — built fast, in plain HTML, CSS and JavaScript, to pin down the screens, the flows and the data model before committing to a real codebase. It runs, it's usable, and the thinking behind it is real, but the code is prototype code and shouldn't be treated as the shipping product.

The actual product is a **React Native app**, which we're building now. Once that's ready, the **web and APK builds get released**, and this prototype becomes a design reference rather than the thing you use.

So: good for trying the idea, showing it to a centre owner, or checking whether the attendance and fee flows make sense. Not the app you install.

## What's in it

- **Dashboard** — totals at a glance, monthly revenue and enrolment charts, fee reminders
- **Students** — searchable list with batch and status filters, add and edit
- **Batches** — schedule, teacher, capacity, and who's enrolled
- **Attendance** — pick a batch and date, mark present/absent/late, save the session
- **Fees & Payments** — record payments, track balances, print receipts
- **Reports** — summary report and CSV exports
- **Settings & Backup** — JSON export and restore, demo data, light/dark theme

## Pages

Each screen is its own HTML file, linked by ordinary navigation:

| Page | What it does |
| --- | --- |
| `index.html` | Entry point, redirects to the dashboard |
| `dashboard.html` | Totals, charts, fee reminders |
| `students.html` | Student list, filters, add and edit forms |
| `batches.html` | Batch list, capacity and roster |
| `attendance.html` | Mark and save a session |
| `payments.html` | Payments, balances, receipts |
| `reports.html` | Summary and CSV export |
| `settings.html` | Backup, restore, demo data, theme |

## Structure

```
index.html                        entry point, redirects to dashboard.html
dashboard.html ... settings.html  one file per page
css/style.css                     all styling, including the mobile tab bar
js/core.js                        shared helpers: DOM, formatting, modals, theme
js/app.js                         shell bootstrap every page calls
js/forms.js                       student / batch / payment forms, receipts
js/pages/*.js                     one module per page
js/db.js                          IndexedDB setup and helpers
js/students.js  js/batches.js  js/attendance.js  js/payments.js  js/reports.js  js/backup.js
```

Page modules call `boot({render, act, onInput, onChange})`, which paints the content area and routes `data-action` clicks into that page's own handlers. On phones the navigation moves to a bottom tab bar, with Reports and Settings behind "More".

## Notes

- Data lives in that one browser profile on that one device. It doesn't sync between devices, and clearing site data wipes it — export a JSON backup now and then.
- Charts are drawn on Canvas; icons come from a CDN, so the first paint wants a connection.
- The theme choice is remembered in `localStorage`.
- Payments are partial payments against a student's fee period, and the app won't let you collect more than the amount due.
