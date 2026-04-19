UI/UX Audit — Aclea

  ---
  🔴 Critical Issues

  1. Severe theme inconsistency across the entire product
  Dashboard, Leads, and Analytics are light mode. The Lead detail panel, Settings, About, Contact, and Solution pages are all dark. It feels like two completely different apps. Pick one and
  stick to it — your light mode is cleaner and more professional for a B2B SaaS tool. The dark mode pages (Settings especially) look like they were built separately and never unified.

  2. Lead detail panel opens in dark mode over a light page
  The panel slides over the light leads table in full dark mode, creating a jarring contrast. It's also an overlay rather than a proper side panel — it obscures the table completely.

  3. AI score is invisible where it matters most
  Your entire value proposition is AI qualification, but the leads table has no score column. Users only see a manual star rating. The AI recommendation is buried inside the detail panel, below
  the fold, and duplicated (it appears as both a subtitle to the stars AND a separate card). The score should be the first thing you see on every lead.

  4. Analytics chart is empty with no explanation
  The Lead Growth chart shows all blank bars for the week. There's no empty state — no message like "No leads this week" or "Connect a channel to start tracking." This looks broken to new users.

  ---
  🟡 Significant Issues

  5. Leads table has layout problems
  - Name column wraps to two lines (Sarah Johnson, James Rodriguez) — use a wider column or truncate
  - The last lead has no name, just an email, and shows status "Active" which doesn't exist in your filter system
  - No channel icons for Source (a WhatsApp logo or envelope icon would be much faster to scan than text)
  - "2d", "3d", "21h" timestamps — no tooltip with exact datetime
  - "Needs Action 6" tab (leads page) vs "Needs Review" (dashboard) — inconsistent naming for the same concept

  6. Dashboard stat cards are 2×2 grid instead of a row
  At normal desktop width, all 4 cards should sit in a single horizontal row. You're hitting a breakpoint issue — switch to grid-cols-4 at sm: instead of md:.

  7. Settings page has no app navigation
  It's a completely standalone page with no Dashboard/Leads/Analytics header. "Back" goes nowhere obvious. It feels like an afterthought, not part of the product.

  8. Lead detail panel shows N/A for Timeline and Budget
  These are the two most important qualification signals. Showing N/A with no guidance on how to fill them in (or that the AI couldn't extract them) is a dead end. Should say "Not detected in
  message" with a way to manually add.

  9. Solution and About pages don't match the new landing page aesthetic
  The landing page is now clean, light, and modern. The Solution and About pages are full dark mode with green accent colors — an older visual identity. They need to match.

  ---
  🟢 Differentiation Opportunities

  These are things that would set you apart from HubSpot, Salesforce, Pipedrive, and every other generic CRM:

  10. Show the AI's reasoning, not just a score
  Instead of just "Excellent lead! High budget..." as a hidden text block, surface 3–4 detected signals directly in the leads table as small tags: 💰 High budget ✅ Decision maker 📍 In service
  area. Competitors show nothing — you'd show everything.

  11. Replace star ratings with an AI confidence score (0–100)
  Stars feel manual and subjective. A numeric score (94/100) with a color gradient (green → yellow → red) is instantly scannable and communicates that AI produced it, not a human. This is your
  core differentiator — make it look like it.

  12. Add a "Qualify with AI" CTA on the dashboard for zero-lead state
  When "New Today: 0", show a prompt: "Connect WhatsApp or Gmail to start receiving leads automatically." Empty states are the best onboarding moments — every competitor wastes them.

  13. Add an AI-drafted reply suggestion in the detail panel
  After qualifying a lead, surface a one-click draft: "Based on their message, here's a suggested reply..." No competitor does this at the qualification stage. It's the natural next step after
  scoring.

  14. The industry verticals on Solution page (Real Estate, Agencies, SaaS, E-commerce) are great — but not visible in the product UI
  Let users tag their industry during onboarding and customize the AI criteria accordingly. Then the qualification card in the detail panel becomes "Fits your Real Estate criteria" rather than
  generic. This is a real moat.

  15. Add a conversion funnel to Analytics
  Right now Analytics is just numbers. A visual funnel — Received → Qualified → Approved → Closed — would let users see exactly where leads drop off. No tool in this space shows this at the
  qualification stage.

  16. The nav only has 3 items — hide Settings too deeply
  Settings is buried in a dropdown from the user avatar. Consider either a gear icon in the header or a bottom-left sidebar link. Every time a user needs it, they hunt for it.

  ---
