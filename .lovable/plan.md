

## Remaining Features & Improvements for Bird Bazaar

Based on a thorough review of your codebase, here's what's missing to make this a complete, production-ready marketplace:

---

### Must-Have Features

1. **Location/City Filter on Browse Page** — The city filter field exists but isn't prominently surfaced. Add a visible city dropdown or autocomplete with Pakistani cities so buyers can filter locally.

2. **Pagination on Browse Page** — Currently loads all listings at once. Add infinite scroll or page-based pagination to handle growth.

3. **Email Verification Flow** — Auth exists but there's no post-verification redirect or confirmation UI. Users may be confused after signing up.

4. **Password Reset / Forgot Password** — No forgot-password flow exists. Essential for any auth system.

5. **Contact Seller from Listing** — Verify the "Message Seller" button on listing detail works end-to-end and pre-fills the listing context in the conversation.

6. **Mobile Navbar** — The hamburger menu exists but verify all links (Dashboard, Favorites, Messages with badges) render correctly in the mobile dropdown.

---

### Nice-to-Have Improvements

7. **Image Compression on Upload** — Listing photos are uploaded raw. Compress/resize client-side before upload to improve load times.

8. **Empty State & Loading Improvements** — Several pages (Favorites, Messages, Seller Profile) could benefit from better empty states with CTAs.

9. **SEO & Meta Tags** — No page-level meta titles/descriptions. Add react-helmet or similar for better discoverability.

10. **Terms of Service / Privacy Policy Pages** — Standard for any marketplace handling user data.

11. **Responsive Polish** — Ensure listing cards, dashboard, and admin panel look good on all screen sizes.

12. **Rate Limiting on Reports** — Users can currently spam reports. Add a check to prevent duplicate reports on the same listing.

---

### Implementation Plan

I would tackle these in priority order:

1. **Password reset flow** — Add forgot-password page + reset handler (~1 file)
2. **City filter enhancement** — Add city dropdown to Browse with common Pakistani cities (~1 file edit)
3. **Pagination** — Add cursor-based pagination to Browse (~1 file edit)
4. **Duplicate report prevention** — Add unique constraint on `(reporter_id, listing_id)` where status is open (~1 migration)
5. **Image compression** — Add client-side resize before upload in CreateListing and EditListing (~2 file edits)
6. **Mobile nav polish** — Ensure badges and all links appear in mobile menu (~1 file edit)

Total: ~6 tasks, mostly incremental improvements to existing code.

