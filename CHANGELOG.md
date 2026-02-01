# Changelog

Summary of changes made to My Flight School (formerly Flight School Finder).

---

## Tabs: Home, Schools, Study Guide, Blogs (new version)

- Replaced **Results** and **Compare** nav links with four tabs: **Home**, **Schools**, **Study Guide**, **Blogs**.
- **Home tab (Dashboard):** Search bar for finding flight schools (runs search and switches to Schools tab), user profile overview (email, location, radius, goals, part preference + link to Update preferences), and recommended flight schools as before.
- **Schools tab:** Advanced search (ZIP/city, radius, goals, Part 61/141, budget, timeline), Update preferences link, sort (Best match / Closest / Price), school list with Add to compare and View profile; Compare button in header when schools are in compare.
- **Study Guide tab:** Basic notetaking in a textarea; notes saved automatically in browser (`localStorage` per user).
- **Blogs tab:** Sample blog post “Welcome to My Flight School” (placeholder for future posts).
- **/results** now redirects to **/home?tab=schools**. Compare page “Back” and empty-state link go to **/home?tab=schools**.
- **Clear compare:** Option to clear the compare list is inside the Compare page content (button next to “Compare schools” title); clears list and `localStorage`.

---

## Branding & naming

- Renamed the app from **"Flight School Finder"** to **"My Flight School"** everywhere (browser title, headers, login back links).
- Added the **MYFLIGHTSCHOOL logo** (`public/logo.png`) to the landing page, Home, Results, School leads, and login pages. Logo and name link to home without logging out.

---

## Navigation

- Logo and "My Flight School" text now link to **/home** (students) or **/school/profile** (schools) when logged in, and to **/** when not logged in.

---

## My Profile (upper right)

- **My Profile** dropdown in the header when logged in on: Home, Results, Compare, School leads, School profile.
- **Change password**: modal with current password, new password, confirm; APIs: `PUT /api/students/[id]/password`, `PUT /api/schools/[id]/password`; store: `updateStudentPassword`, `updateSchoolPassword`.
- **Log out**: clears session and redirects to `/`.
- New component: `src/components/UserMenu.tsx`.

---

## Recommended schools

- **Recommended flight schools** section on Home: list in boxes, ordered by **distance** from preferred location (if set) or by **state then name**.
- API: `GET` and `POST /api/recommended` (POST sends current onboarding so results update when location changes).
- Store: `getRecommendedSchools(onboarding)`, `stateFromAddress`, `RecommendedSchool` type.
- If the student is not in the store (e.g. after server restart), the API still returns schools with default ordering.

---

## Advanced search

- **Advanced search** panel on Results: location (ZIP/city), radius, goals, Part 61/141, budget, timeline (same as onboarding).
- **Fuzzy location**: close spellings suggest matches; "Did you mean?" suggestions; "Showing results for X" when matched.
- Store: `geocodeWithSuggestions`, `stringSimilarity`, `rankSchoolsForStudentWithMeta`; Results API returns `matchedLocation` and `locationSuggestions`.

---

## Flight schools added

- **Centennial Aviation Academy** – https://www.centennialaviationacademy.com/ – Atlanta, GA.
- **Skybound Aviation** – https://www.skybnd.com/ – 2000 Airport Rd, Atlanta, GA 30341, (678) 691-3283.
- **Faithful Guardian Aviation** – https://faithfulguardianaviation.com/ – 3956 Aviation Circle, Atlanta, GA 30336, (770) 462-0049.

---

## Other

- Removed duplicate `partPref` / `budgetRange` declarations in store; recommended search uses POST with onboarding to avoid double-fetch; recommended list refetches when location/radius change after save.
- Styling/readability tweaks (e.g. `globals.css`, palette) and white background where applicable.
