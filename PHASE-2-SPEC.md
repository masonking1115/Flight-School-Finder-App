# Flight School Finder — Phase 2: Design & UX Spec

**Scope:** MVP only. Student onboarding → ranked results → school profile → compare → contact/lead handoff.  
**Principles:** Trust, transparency, speed.

---

## A) User Personas

### 1. Student Pilot
- **Goal:** Find a flight school that fits location, budget, and goals; get in touch quickly without spam.
- **Pains:** Too many schools, unclear pricing, fear of commitment before visiting, generic contact forms that go nowhere.
- **Context:** Often researching on mobile; may not know Part 61 vs Part 141; cares about instructor availability and reputation.

### 2. Flight School Admin
- **Goal:** Get qualified leads (serious students), fill seats, control how the school is presented.
- **Pains:** Low-quality inquiries, time spent on tire-kickers, outdated listings elsewhere, no single place to manage “find us” presence.
- **Context:** Small team; may be owner or front-desk; needs simple inbox, not a full CRM.

---

## B) Primary User Flows

### Flow 1: Student — Onboarding → Results → Compare → Contact

1. **Landing** → Student sees value prop and CTA (“Find your flight school”).
2. **Sign up / Log in** → Email + password (or social); minimal friction.
3. **Onboarding (multi-step):**
   - Step 1: Location (ZIP or city) + radius.
   - Step 2: Goals (e.g. Private Pilot, Instrument, Career).
   - Step 3: Preferences: Part 61 / Part 141 / no preference; budget range (optional); timeline (e.g. start within 3 months).
4. **Results** → Ranked list of schools; student can filter/sort and open profiles.
5. **School profile** → Student views details, then can “Add to compare” or “Request intro.”
6. **Compare** → Student selects 2–4 schools; sees side-by-side summary; chooses one or more to contact.
7. **Contact / Request intro** → Form: message (optional), preferred contact method; submit.
8. **Confirmation** → “Request sent. [School] will contact you at [email/phone].”

### Flow 2: School — Create Profile → Publish → Receive Lead → Respond

1. **Landing** → School sees “List your school” CTA.
2. **Sign up / Log in** → School email + password.
3. **Profile editor (multi-step):**
   - Step 1: Name, address, phone, website, one photo.
   - Step 2: Programs (Part 61, Part 141, ratings offered), aircraft types, pricing (ranges or “Contact for quote”).
   - Step 3: Brief description, key differentiators; preview & publish.
4. **Publish** → Profile goes live; school appears in student results when criteria match.
5. **Leads inbox** → List of leads (student name, date, school, status); click for detail.
6. **Lead detail** → Student message, preferences, contact info; school responds via their own email/phone (no in-app messaging in MVP).

---

## C) Information Architecture — MVP Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Landing | Public |
| `/login` | Student signup/login | Public |
| `/onboarding` | Student onboarding (multi-step) | Student (post-login) |
| `/results` | Ranked results + filters | Student |
| `/school/:id` | School profile (student view) | Public or Student |
| `/compare` | Compare schools (2–4) | Student |
| `/contact/:schoolId` | Request intro form | Student |
| `/contact/confirmation` | Request sent confirmation | Student |
| `/school/login` | School signup/login | Public |
| `/school/dashboard` | Redirect to profile or inbox | School |
| `/school/profile` | School profile editor (multi-step) | School |
| `/school/leads` | Leads inbox (list) | School |
| `/school/leads/:id` | Lead detail | School |

---

## D) Screen Specs

### 1. Landing (public) — `/`

- **Purpose:** Communicate value and drive students or schools to sign up.
- **Components:**
  - Hero: headline, subhead, primary CTA (“Find your flight school”), secondary CTA (“List your school”).
  - Short “How it works” (3 steps): Enter your goals → See matched schools → Contact and visit.
  - Trust: number of schools (e.g. “50+ flight schools”) or “Trusted by aspiring pilots.”
  - Footer: Login, Privacy, Terms.
- **Microcopy:**
  - Headline: “Find the right flight school for you.”
  - Subhead: “Compare programs, pricing, and locations—then reach out when you’re ready.”
  - CTA: “Find your flight school” / “List your school”
- **Empty states:** N/A.

---

### 2. Student signup/login — `/login`

- **Purpose:** Create account or sign in with minimal friction.
- **Components:**
  - Tabs or toggle: “Log in” / “Sign up.”
  - Form: Email, Password; Sign up also: Confirm password, optional “I’m a student” (implicit).
  - Submit button; “Forgot password?” link.
- **Fields + validation:**
  - Email: required, valid email format.
  - Password: required; min 8 chars (sign up).
  - Confirm password: must match (sign up only).
- **Microcopy:**
  - Headline: “Log in” / “Create account”
  - Buttons: “Log in” / “Sign up”
  - Error: “Invalid email or password.” / “Passwords don’t match.”
- **Empty states:** N/A.

---

### 3. Student onboarding — `/onboarding`

- **Purpose:** Collect location, goals, and preferences to rank and filter schools.
- **Components:**
  - Stepper (e.g. Step 1 of 3).
  - Step 1: Location input (ZIP or city), radius dropdown (25 / 50 / 75 / 100 mi).
  - Step 2: Goal checkboxes (Private Pilot, Instrument, Commercial, CFI, Other).
  - Step 3: Part 61 / Part 141 / No preference; Budget range (optional); Timeline (e.g. Start in &lt; 1 month, 1–3 months, 3–6 months, Just browsing).
  - “Back” / “Next” / “See schools” (on last step).
- **Fields + validation:**
  - Location: required; ZIP (5 or 9) or city name.
  - Radius: required; one of 25, 50, 75, 100.
  - Goals: at least one required.
  - Part/Budget/Timeline: optional with sensible defaults.
- **Microcopy:**
  - Step 1: “Where do you want to fly?” — “ZIP or city” placeholder.
  - Step 2: “What’s your goal?” — “Select at least one.”
  - Step 3: “Any preferences?” — “We’ll use this to rank schools.”
  - Button: “See schools”
  - Error: “Please enter a valid ZIP or city.”
- **Empty states:** N/A.

---

### 4. Results (ranked list + filters) — `/results`

- **Purpose:** Show schools ranked by match score with filters and quick actions.
- **Components:**
  - Sticky toolbar: sort (Best match, Distance, Price), filter chips (Part 61/141, budget, distance).
  - Result cards: school name, location, distance, match %, 1-line tagline; “View profile” / “Add to compare.”
  - Pagination or “Load more.”
- **Fields + validation:** None (display only).
- **Microcopy:**
  - Headline: “Flight schools near you”
  - Sort: “Best match” / “Closest” / “Price”
  - Empty state: “No schools match your criteria. Try widening your search radius or relaxing filters.”
- **Empty state:** “No schools match your criteria. Try widening your search radius or relaxing filters.” + CTA “Edit preferences.”

---

### 5. School profile (student view) — `/school/:id`

- **Purpose:** Single place for student to evaluate a school before contacting.
- **Components:**
  - Header: name, location, one hero image; “Add to compare” / “Request intro” buttons.
  - Tabs or sections: Overview (description, programs, aircraft), Pricing, Location (address + simple map or link to map).
  - Optional: Review placeholder (“Reviews coming soon”).
- **Fields + validation:** None (read-only).
- **Microcopy:**
  - Buttons: “Add to compare” / “Request intro”
  - Section labels: “Programs,” “Pricing,” “Location”
- **Empty states:** “Pricing: Contact for quote” when no price; “No reviews yet” if reviews exist but empty.

---

### 6. Compare schools — `/compare`

- **Purpose:** Side-by-side comparison of 2–4 schools to decide who to contact.
- **Components:**
  - Comparison table: rows = attributes (Location, Distance, Programs, Price range, etc.); columns = selected schools.
  - School cards at top with “Remove” and “Request intro” per school.
  - “Add another school” (from results) until 4.
- **Microcopy:**
  - Headline: “Compare schools”
  - Empty: “Add schools from your results to compare them here.” + “Go to results”
- **Empty state:** When &lt; 2 schools: “Add at least 2 schools from your results to compare.”

---

### 7. Contact / Request intro + Confirmation — `/contact/:schoolId` and `/contact/confirmation`

**Contact form — `/contact/:schoolId`**

- **Purpose:** Send a single lead to one school with student message and contact info.
- **Components:**
  - School name reminder.
  - Optional message textarea (“What would you like to ask?”).
  - Preferred contact: Email and/or Phone (pre-filled from profile if logged in).
  - “Send request” button.
- **Fields + validation:**
  - Message: optional, max 500 chars.
  - Email or phone: at least one required; valid format.
- **Microcopy:**
  - Headline: “Request intro to [School name]”
  - Placeholder: “Introduce yourself or ask a question (optional).”
  - Button: “Send request”
  - Error: “Please provide an email or phone number.”

**Confirmation — `/contact/confirmation`**

- **Purpose:** Confirm lead was sent and set expectations.
- **Components:** Success message, school name, where they’ll be contacted; “Back to results” / “Compare more schools.”
- **Microcopy:**
  - Headline: “Request sent”
  - Body: “[School name] will contact you at [email/phone]. Usually within 1–2 business days.”

---

### 8. School signup/login — `/school/login`

- **Purpose:** Separate entry for schools to create account or sign in.
- **Components:** Same as student login but labeled for schools; “Sign up as a flight school” / “Log in.”
- **Fields + validation:** Same as student login.
- **Microcopy:**
  - Headline: “Flight school login” / “Create school account”
  - Link from main site: “List your school” → this page.

---

### 9. School profile editor — `/school/profile`

- **Purpose:** Create or edit school profile in steps; publish when ready.
- **Components:**
  - Stepper (e.g. 3 steps).
  - Step 1: Name, Address, Phone, Website, Logo/photo upload (one).
  - Step 2: Programs (Part 61, Part 141, ratings), Aircraft types, Price range or “Contact for quote.”
  - Step 3: Short description (rich text or plain), 2–3 differentiators; Preview; Publish / Save draft.
- **Fields + validation:**
  - Name, Address, Phone: required.
  - Website: optional, valid URL if present.
  - Photo: optional for draft; required to publish.
  - At least one program; price or “Contact for quote.”
  - Description: required to publish, max 1,000 chars.
- **Microcopy:**
  - Step 1: “Basic info”
  - Step 2: “Programs & pricing”
  - Step 3: “Describe your school”
  - Buttons: “Save draft” / “Publish profile”
  - Error: “Please fill required fields to publish.”
- **Empty states:** Draft state: “Your profile isn’t live yet. Complete the steps and publish.”

---

### 10. Leads inbox + Lead detail — `/school/leads` and `/school/leads/:id`

**Leads inbox — `/school/leads`**

- **Purpose:** List all leads so school can triage and respond.
- **Components:**
  - Table or list: Date, Student name (or “Prospect”), Message snippet, Status (New / Contacted / Closed); click row → detail.
  - Optional: filter by status.
- **Microcopy:**
  - Headline: “Leads”
  - Empty: “When students request an intro to your school, they’ll show up here.”
- **Empty state:** “No leads yet. Your leads will appear here when students request an intro.”

**Lead detail — `/school/leads/:id`**

- **Purpose:** Full context to respond (message, preferences, contact info).
- **Components:**
  - Student message, onboarding summary (goal, location, timeline if shared).
  - Email and phone; “Mark as contacted” / “Mark as closed” (optional for MVP).
- **Microcopy:**
  - Labels: “Message,” “Contact,” “Goals”
  - Hint: “Reply to the student using the email or phone below.”

---

## E) Data Model (Minimal)

### StudentProfile
```json
{
  "id": "stu_abc123",
  "email": "student@example.com",
  "createdAt": "2025-01-15T10:00:00Z",
  "onboarding": {
    "location": { "zip": "10001", "city": "New York", "state": "NY" },
    "radiusMiles": 50,
    "goals": ["Private Pilot", "Instrument"],
    "partPreference": "no_preference",
    "budgetRange": "mid",
    "timeline": "1-3_months"
  }
}
```
- **Required:** id, email, createdAt, onboarding.location (zip or city), onboarding.radiusMiles, onboarding.goals (min 1).
- **Optional:** onboarding.partPreference, budgetRange, timeline.

### SchoolProfile
```json
{
  "id": "sch_xyz789",
  "name": "Skyline Aviation",
  "address": "123 Airport Rd, Anytown, ST 12345",
  "phone": "+1-555-0100",
  "website": "https://skylineaviation.com",
  "photoUrl": "https://...",
  "programs": ["Part 61", "Part 141"],
  "ratings": ["Private", "Instrument", "Commercial"],
  "aircraftTypes": ["C172", "PA-28"],
  "pricing": { "type": "range", "min": 8000, "max": 12000 },
  "description": "Full-service Part 61 and 141 school...",
  "differentiators": ["Flexible scheduling", "New fleet"],
  "published": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-20T00:00:00Z"
}
```
- **Required:** id, name, address, phone, programs (min 1), description (if published), published.
- **Optional:** website, photoUrl, ratings, aircraftTypes, pricing (or “Contact for quote”), differentiators.

### Lead
```json
{
  "id": "lead_001",
  "schoolId": "sch_xyz789",
  "studentId": "stu_abc123",
  "studentEmail": "student@example.com",
  "studentPhone": "+1-555-0200",
  "message": "Interested in starting in 2 months.",
  "studentGoals": ["Private Pilot"],
  "studentLocation": "10001",
  "status": "new",
  "createdAt": "2025-01-25T14:30:00Z"
}
```
- **Required:** id, schoolId, studentId, studentEmail or studentPhone (at least one), status, createdAt.
- **Optional:** message, studentGoals, studentLocation (from onboarding).

### Review (placeholder for later)
```json
{
  "id": "rev_001",
  "schoolId": "sch_xyz789",
  "studentId": "stu_abc123",
  "rating": 5,
  "comment": "Great instructors.",
  "createdAt": "2025-02-01T00:00:00Z"
}
```
- Not used in MVP; include in schema if needed for Phase 3+.

---

## F) Matching/Ranking (No ML)

### Approach: Weighted score from filters + distance

1. **Eligibility (hard filters):**
   - School within radius of student location (from onboarding).
   - School offers at least one of student’s selected goals (e.g. Private Pilot).
   - If student chose Part 61 or Part 141, school must offer it; “no preference” → no filter.

2. **Score (0–100):**
   - **Distance (e.g. 40%):** Closer = higher. Example: score = max(0, 100 − (distanceMiles / radiusMiles) × 40).
   - **Goal match (e.g. 30%):** 100 if school offers all selected goals; else proportional (e.g. 50 if 1 of 2).
   - **Part match (e.g. 15%):** 100 if student preference matches school; 50 if “no preference”; 0 if mismatch (already filtered out).
   - **Budget (e.g. 15%):** If both have budget/price: 100 if school range overlaps student range; 50 if adjacent; 0 if far off. If either missing, give 50 (neutral).
   - **Timeline / responsiveness (optional, 0% in MVP):** Reserve for “school typically responds in X hours” later.

3. **Data required to compute score:**
   - Student: location (lat/lon from ZIP/city), radiusMiles, goals, partPreference, budgetRange (optional).
   - School: lat/lon (from address), programs/ratings, Part 61/141, pricing range (optional).
   - Geocode student location and school addresses once; cache coordinates.

4. **Sort:** Descending score; tie-break by distance.

---

## G) Accessibility + UX Quality Checklist

1. **Forms:** All inputs have visible labels (or aria-label); required fields indicated; errors announced and associated with fields (aria-describedby / aria-invalid).
2. **Focus:** Logical tab order; no focus traps; “Skip to main content” on multi-step and long pages.
3. **Buttons/CTAs:** Sufficient size (min ~44px touch target); clear label (e.g. “Send request” not “Submit”).
4. **Results/Compare:** Tables use proper `<th>` scope and captions; comparison table responsive (horizontal scroll with sticky first column or card stack on small screens).
5. **Maps:** If embedded, provide “Open in [Google Maps]” link and text address; image alt or live region label.
6. **Trust:** School profile shows real contact info and “Last updated” where relevant; contact confirmation states who will reply and how.
7. **Loading:** Skeleton or spinner on results and profile load; disable submit once during send to prevent double submission.
8. **Empty states:** Every list (results, compare, leads) has a clear empty state and next step (e.g. “Edit preferences,” “Add schools,” “Your leads will appear here”).
9. **Errors:** Network/validation errors in plain language; retry or “Go back” where appropriate.
10. **Contrast:** Text and interactive elements meet WCAG AA (4.5:1 for normal text); focus indicators visible.

---

*End of Phase 2 spec. Ready for Phase 3 implementation.*
