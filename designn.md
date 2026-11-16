# Rajgir Marathon — Design System & UI/UX Guidelines

- **Document:** `design.md`
- **Product:** Rajgir Marathon Platform
- **Brand tagline:** Run Through History
- **Location:** Rajgir, Bihar, India
- **Design mode:** Light / White
- **Design direction:** Premium Sports + Heritage + Community
- **Version:** 1.0

---

## 1. Product Vision

Rajgir Marathon is not just a marathon registration website. It is a digital ecosystem that brings together people, running communities, organizations and businesses through sports and fitness.

The platform should serve:
- Individual runners
- Running clubs
- Running communities
- Team leaders
- Volunteers
- Sponsors and brand partners
- Corporate employees and HR teams
- Schools and colleges
- Fitness influencers
- Event organizers
- Administrators

The platform should provide a unified experience where people can discover events, participate in activities, connect with other runners, build teams, manage communities and collaborate with organizations.

### Core design philosophy

> **Run. Connect. Inspire. Belong.**

The experience must communicate:
- Heritage and identity of Rajgir.
- Energy and excitement of marathon running.
- Inclusiveness and community participation.
- Trust and professionalism.
- Modern digital experiences.

### Brand positioning

Rajgir Marathon should feel like a premium Indian sporting event with a strong regional identity.

Avoid making it look like:
- A generic event registration template.
- A government information portal.
- A conventional fitness tracking application.
- An overly decorative cultural tourism website.

Instead, combine:
- Premium marathon branding.
- Modern community platform design.
- Editorial storytelling.
- Minimalist SaaS dashboard patterns.
- Strong sports photography.

---

## 2. Visual Identity

### 2.1 Brand inspiration

The attached Rajgir Marathon logo is the primary visual reference.

Important visual elements:
- **Red sun:** Energy, ambition and determination.
- **Golden mountains:** Rajgir's natural landscape.
- **Runner silhouette:** Movement, achievement and sports.
- **Heritage monuments:** Cultural and historical significance.
- **Bold typography:** Strength, confidence and athletic spirit.

These elements should influence the design system without being repeated excessively.

### 2.2 Visual language

Use the following visual characteristics:
- Predominantly white backgrounds.
- Large and expressive typography.
- Strong photography.
- Controlled red and saffron accents.
- Subtle warm-gray surfaces.
- Minimal borders.
- Spacious layouts.
- Consistent rounded components.
- Clear content hierarchy.

The visual identity should feel energetic but not aggressive.

### 2.3 White theme

The entire platform must use a light theme by default.

Primary backgrounds must remain white or very light neutral.

Avoid:
- Large black background sections.
- Dark dashboard interfaces.
- Excessive gradients.
- Heavy shadows.
- Bright red backgrounds across entire pages.
- Excessive use of orange and yellow simultaneously.

Dark charcoal is reserved for text, icons and selected high-contrast elements.

---

## 3. Color System — 60/30/10 Rule

Use the 60/30/10 color distribution throughout the interface.

### 3.1 Color distribution

| Distribution | Color family | Usage |
| :--- | :--- | :--- |
| **60%** | White and neutral | Main backgrounds, content areas, cards |
| **30%** | Charcoal and warm gray | Typography, secondary surfaces, borders |
| **10%** | Brand colors | Buttons, highlights, links, active states |

The 10% brand allocation is shared between red, saffron and gold. Do not use 10% of each independently.

### 3.2 Primary brand colors

| Token | HEX | Usage |
| :--- | :--- | :--- |
| **Brand Red** | `#E31B23` | Primary CTA, active states |
| **Deep Red** | `#B5121B` | Hover states and emphasis |
| **Saffron** | `#F5A623` | Secondary highlights |
| **Golden Yellow** | `#FFC928` | Heritage accents |
| **Dark Gold** | `#C78A12` | Small decorative details |

### 3.3 Neutral palette

| Token | HEX | Usage |
| :--- | :--- | :--- |
| **White** | `#FFFFFF` | Main background |
| **Surface** | `#FFFFFF` | Cards |
| **Surface Soft** | `#F8F8F6` | Alternate sections |
| **Surface Warm** | `#FFF9EF` | Heritage highlights |
| **Gray 50** | `#F9FAFB` | Input backgrounds |
| **Gray 100** | `#F3F4F6` | Subtle surfaces |
| **Gray 200** | `#E5E7EB` | Borders |
| **Gray 300** | `#D1D5DB` | Disabled borders |
| **Gray 500** | `#6B7280` | Secondary text |
| **Gray 600** | `#4B5563` | Supporting text |
| **Gray 700** | `#374151` | Strong secondary text |
| **Gray 800** | `#1F2937` | Headings |
| **Gray 900** | `#111827` | Primary text |

### 3.4 Functional colors

| Token | HEX | Usage |
| :--- | :--- | :--- |
| **Success** | `#15803D` | Registration success |
| **Success Soft** | `#DCFCE7` | Success backgrounds |
| **Warning** | `#D97706` | Pending actions |
| **Warning Soft** | `#FEF3C7` | Warning backgrounds |
| **Error** | `#DC2626` | Validation errors |
| **Error Soft** | `#FEE2E2` | Error backgrounds |
| **Info** | `#2563EB` | Informational messages |
| **Info Soft** | `#DBEAFE` | Informational backgrounds |

Functional colors must not replace the brand palette.

### 3.5 Color usage guidelines

#### Primary red:
- Register now.
- Join community.
- Create team.
- Primary dashboard actions.
- Selected navigation items.

#### Saffron:
- Event highlights.
- Featured content.
- Important statistics.
- Secondary action indicators.

#### Gold:
- Heritage references.
- Medal and achievement highlights.
- Premium badges.
- Special event highlights.

#### Neutral colors:
- Most page backgrounds.
- Navigation.
- Form controls.
- Tables.
- Dashboard content.

Never use yellow text on a white background.

Maintain WCAG AA contrast wherever practical, particularly for body text, controls and interactive elements.

---

## 4. Typography System

### 4.1 Font families

#### Primary font: Manrope
- **Usage:**
  - Body text
  - Navigation
  - Buttons
  - Forms
  - Dashboard
  - Tables
  - Cards
  - General UI
- **Google Fonts:** https://fonts.google.com/specimen/Manrope

#### Secondary font: Barlow Condensed
- **Usage:**
  - Hero headings
  - Marathon campaign headings
  - Event distances
  - Large statistics
  - Athletic display text
  - Promotional banners
- **Google Fonts:** https://fonts.google.com/specimen/Barlow+Condensed

#### Regional font: Noto Sans Devanagari
- **Usage:**
  - Hindi text
  - Regional-language content
  - Bilingual navigation and content
- **Google Fonts:** https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari

### 4.2 Typography weights

| Weight | Usage |
| :--- | :--- |
| **400** | Body text |
| **500** | Navigation and labels |
| **600** | Buttons and card headings |
| **700** | Section headings |
| **800** | Hero headings |
| **900** | Promotional display typography |

### 4.3 Type scale

| Element | Desktop | Mobile | Font |
| :--- | :--- | :--- | :--- |
| **Hero heading** | 64px | 40px | Barlow Condensed |
| **Page heading** | 44px | 32px | Barlow Condensed |
| **Section heading** | 36px | 28px | Barlow Condensed |
| **Card heading** | 22px | 20px | Manrope |
| **Subheading** | 18px | 17px | Manrope |
| **Body** | 16px | 15px | Manrope |
| **Secondary body** | 14px | 14px | Manrope |
| **Caption** | 12px | 12px | Manrope |
| **Large statistics** | 48px | 36px | Barlow Condensed |

### 4.4 Typography guidelines
- Headings should be bold and visually strong.
- Body text must remain highly readable.
- Avoid excessively condensed fonts for paragraphs.
- Avoid uppercase text for long sentences.
- Use uppercase for short labels and promotional headings.
- Use consistent line heights.
- Avoid more than two font families in ordinary UI components, excluding regional-language fallbacks.

---

## 5. Border Radius System

The interface should use moderately rounded corners.

Avoid excessively rounded, pill-shaped cards throughout the application.

| Component | Border radius |
| :--- | :--- |
| **Small badges** | 6px |
| **Input fields** | 8px |
| **Buttons** | 8px |
| **Small cards** | 10px |
| **Standard cards** | 12px |
| **Feature cards** | 16px |
| **Hero containers** | 20px |
| **Modal dialogs** | 16px |
| **Dropdowns** | 10px |
| **Profile images** | 50% |
| **Pills** | 999px |

### Radius principles
- **Buttons:** 8px.
- **Inputs:** 8px.
- **Standard cards:** 12px.
- **Larger promotional cards:** 16px.
- **Large hero image containers:** 20px.

Keep border radius consistent across desktop and mobile.

---

## 6. Layout and Spacing

Use a consistent 4px spacing base.

| Token | Value |
| :--- | :--- |
| **space-1** | 4px |
| **space-2** | 8px |
| **space-3** | 12px |
| **space-4** | 16px |
| **space-5** | 20px |
| **space-6** | 24px |
| **space-8** | 32px |
| **space-10** | 40px |
| **space-12** | 48px |
| **space-16** | 64px |
| **space-20** | 80px |
| **space-24** | 96px |

### Container widths

| Layout | Maximum width |
| :--- | :--- |
| **Main website** | 1280px |
| **Wide marketing sections** | 1440px |
| **Dashboard** | 1440px |
| **Reading content** | 800px |
| **Form containers** | 640px |

Use centered containers with responsive side padding.

### Section spacing

#### Desktop:
- Standard section padding: 72px vertical.
- Hero section: 80–100px vertical.
- Card grid gap: 24px.

#### Tablet:
- Section padding: 56px vertical.
- Card grid gap: 20px.

#### Mobile:
- Section padding: 40px vertical.
- Card grid gap: 16px.

---

## 7. Shadows and Borders

Use subtle elevation.

| Token | Value |
| :--- | :--- |
| **Shadow XS** | `0 1px 2px rgba(17,24,39,0.04)` |
| **Shadow SM** | `0 2px 8px rgba(17,24,39,0.05)` |
| **Shadow MD** | `0 8px 24px rgba(17,24,39,0.08)` |
| **Shadow LG** | `0 16px 40px rgba(17,24,39,0.10)` |

### Border:
- **Default:** 1px solid `#E5E7EB`.
- **Hover:** 1px solid `#D1D5DB`.
- **Active:** 1px solid `#E31B23`.

Do not apply large shadows to every card.

Cards should primarily be separated through whitespace and subtle borders.

---

## 8. Brand Graphics and Photography

### 8.1 Photography direction

Photography is a major part of the brand.

Prioritize:
- Real runners.
- Rajgir hills and landscapes.
- Heritage monuments.
- Marathon starting lines.
- Community runs.
- Volunteers.
- Schools and corporate running groups.
- Finish-line celebrations.
- Local culture and experiences.

Images should feel authentic and documentary-oriented.

Avoid:
- Excessively artificial fitness stock photos.
- Overly staged corporate photographs.
- Generic international marathon visuals when Rajgir-specific images are available.

### 8.2 Heritage design language

Use subtle visual motifs inspired by:
- Rajgir hills.
- Ancient stone architecture.
- Buddhist and Jain heritage.
- Pagoda silhouettes.
- Historical pathways.
- Mountain contours.

Use these elements as:
- Section separators.
- Small background patterns.
- Hero illustrations.
- Decorative icons.
- Event graphics.

Do not make the interface look like a historical museum website.

### 8.3 Logo usage

Use the attached Rajgir Marathon logo as the official brand asset.

Guidelines:
- Preserve the original aspect ratio.
- Never stretch or distort it.
- Maintain clear space around the logo.
- Prefer the full-color logo on white backgrounds.
- Use a simplified brand mark for compact mobile navigation.
- Do not recreate the logo using ordinary text.

Recommended assets:
- Full logo.
- Horizontal logo.
- Compact logo.
- Favicon.
- Monochrome logo for permitted special applications.

---

## 9. Buttons and Interactive Elements

### 9.1 Primary button
- **Background:** `#E31B23`
- **Text:** `#FFFFFF`
- **Radius:** 8px
- **Height:** 48px
- **Font:** Manrope 600
- **Horizontal padding:** 24px

#### Hover:
- **Background:** `#B5121B`

#### Use for:
- Register now.
- Join community.
- Create account.
- Create team.
- Submit important forms.

### 9.2 Secondary button
- **Background:** `#FFFFFF`
- **Text:** `#1F2937`
- **Border:** `#D1D5DB`
- **Radius:** 8px
- **Height:** 48px

#### Hover:
- **Background:** `#F9FAFB`.

### 9.3 Tertiary button
- Transparent background.
- Brand-red text.
- No prominent border.

#### Use for:
- View details.
- Learn more.
- Explore events.

### 9.4 Button sizes

| Size | Height |
| :--- | :--- |
| **Small** | 36px |
| **Medium** | 44px |
| **Large** | 48px |
| **Extra large** | 52px |

Buttons must have clear hover, focus, disabled and loading states.

---

## 10. Input and Form Design

All forms must be simple, clean and easy to complete.

### Input specifications:
- **Height:** 46–48px.
- **Radius:** 8px.
- **Border:** `#D1D5DB`.
- **Background:** `#FFFFFF`.
- **Font size:** 14–16px.

### Focus:
- **Border:** `#E31B23`.
- Visible focus ring.
- No layout shifts.

### Labels:
- 14px.
- Weight 600.
- Dark gray.

### Validation:
- Inline error messages.
- Clear success indicators.
- Helpful instructions.
- Preserve user-entered data when validation fails.

Form design should support:
- Individual registration.
- Group registration.
- School registration.
- Corporate registration.
- Volunteer applications.
- Sponsorship enquiries.
- Club creation.

For lengthy registration processes, use a step-based form with a visible progress indicator.

---

## 11. Public Website Information Architecture

### Primary navigation

Recommended navigation:
- Home
- About Rajgir
- Race Information
- Explore
- Communities
- Stories
- Sponsors
- Contact

Right-side actions:
- Login
- Register

Use a sticky navigation bar.

#### Desktop:
- White background.
- Subtle bottom border.
- Full navigation.
- Primary registration CTA.

#### Mobile:
- Compact header.
- Logo.
- Hamburger menu.
- Prominent registration action.

---

### 11.1 Homepage

The homepage should be designed as an editorial marathon landing page.

#### Section 1: Hero

##### Visual direction:
- Large cinematic Rajgir landscape.
- Runner photography.
- Mountain and heritage imagery.
- Strong headline.
- Event details.
- Clear registration actions.

##### Suggested headline:
> "Where Every Step Tells a Story."

##### Supporting text:
"Experience the spirit of running through the heritage, hills and history of Rajgir, Bihar."

- **Primary CTA:** REGISTER NOW
- **Secondary CTA:** EXPLORE RAJGIR

##### Display relevant event information:
- Event date.
- Location.
- Race categories.
- Registration status.

Avoid excessive overlays that compromise image visibility.

#### Section 2: Event statistics

Show:
- Expected participants.
- Race categories.
- Participating communities.
- Volunteers.
- Event partners.

Use large Barlow Condensed numerals.

Only display verified statistics. Use placeholders until actual numbers are available.

#### Section 3: Choose your experience

Display the different participation opportunities:
- Run.
- Volunteer.
- Join a community.
- Become a sponsor.
- Register as a corporate.
- Participate as a school.

Use six visually consistent cards.

#### Section 4: Race categories

Display the official event categories as separate cards.

Each card should include:
- Distance.
- Short description.
- Eligibility.
- Registration status.
- Registration CTA.

#### Section 5: Discover Rajgir

A photography-focused section.

Include:
- Scenic destinations.
- Heritage locations.
- Cultural experiences.
- Local experiences.

Use wide image cards.

#### Section 6: Running communities

Highlight the community aspect.

Show:
- Featured running clubs.
- Popular teams.
- Community events.
- Upcoming group runs.

- **CTA:** EXPLORE COMMUNITIES

#### Section 7: Event experience

Show:
- Route.
- Race village.
- Hydration.
- Medical support.
- Timing.
- Finisher experience.

#### Section 8: Sponsors and partners

Use a clean logo grid.

Categorize:
- Title sponsor.
- Associate sponsor.
- Event partners.
- Supporting partners.
- Community partners.

#### Section 9: Stories and updates

Editorial card layout featuring:
- Runner stories.
- Training tips.
- Community achievements.
- Event announcements.
- Rajgir heritage.

#### Section 10: Newsletter and footer
- Email subscription.
- Quick links.
- Social links.
- Contact information.
- Organizing partner information.

---

## 12. Community Platform

The community experience is one of Rajgir's most important differentiators.

The platform must allow users to discover people, join groups, create communities and participate in activities.

### 12.1 Community discovery page

Display:
- Featured running clubs.
- Nearby communities.
- Popular groups.
- New communities.
- Corporate running groups.
- School running communities.
- Public group runs.

Each community card should contain:
- Community name.
- Cover image.
- Profile image.
- Location.
- Number of members.
- Community type.
- Short description.
- Join button.

Provide filters:
- Location.
- Community type.
- Distance or activity preference.
- Membership type.

### 12.2 Community profile

Every community should have its own profile page.

Include:
- Cover image.
- Community logo.
- Name.
- Description.
- Location.
- Member count.
- Leader details.
- Upcoming activities.
- Past events.
- Member list.
- Community posts.
- Join or request access action.

### 12.3 Create community

Provide a straightforward creation flow.

Fields:
- Community name.
- Description.
- Location.
- Category.
- Cover image.
- Logo.
- Public/private visibility.
- Membership settings.

Community leaders should have access to member management and community activities.

---

## 13. User Roles and Dashboards

Use a consistent dashboard design system across all user types.

Each role should have relevant functionality rather than showing the same dashboard to everyone.

### 13.1 Runner dashboard

#### Sidebar:
- Overview.
- My registrations.
- My running profile.
- My communities.
- My teams.
- Events.
- Connections.
- Achievements.
- Notifications.
- Settings.

#### Overview:
- Upcoming events.
- Registered race details.
- Community activities.
- Suggested running clubs.
- Personal achievements.
- Recent updates.

### 13.2 Volunteer dashboard

#### Sidebar:
- Overview.
- My applications.
- Available opportunities.
- Assigned duties.
- Event schedule.
- Training and instructions.
- Certificates.
- Notifications.

#### Overview:
- Application status.
- Upcoming assignments.
- Duty location.
- Reporting time.
- Volunteer announcements.

### 13.3 Team leader dashboard

#### Sidebar:
- Overview.
- My team.
- Members.
- Invitations.
- Team registrations.
- Team activities.
- Performance.
- Announcements.
- Settings.

#### Overview:
- Team member count.
- Pending invitations.
- Upcoming activities.
- Team registration progress.
- Team achievements.

### 13.4 Corporate dashboard

#### Sidebar:
- Overview.
- Organization profile.
- Employee registrations.
- Corporate teams.
- Challenges.
- Participation reports.
- Event participation.
- Billing.
- Settings.

#### Overview:
- Registered employees.
- Participating teams.
- Registration completion.
- Upcoming challenges.
- Employee participation statistics.

### 13.5 School and college dashboard

#### Sidebar:
- Overview.
- Institution profile.
- Student registrations.
- Faculty and coordinators.
- Teams.
- Permissions.
- Event schedules.
- Reports.

Include group registration and authorized student-management workflows.

### 13.6 Sponsor dashboard

#### Sidebar:
- Overview.
- Brand profile.
- Sponsorship packages.
- Partnership enquiries.
- Deliverables.
- Event visibility.
- Campaign performance.
- Reports.

Show sponsorship opportunities and agreed deliverables clearly.

### 13.7 Admin dashboard

#### Sidebar:
- Overview.
- Users.
- Organizations.
- Communities.
- Events.
- Registrations.
- Volunteers.
- Teams.
- Sponsors.
- Content management.
- Reports.
- Settings.

Administrative interfaces should prioritize clarity, operational efficiency and data management.

---

## 14. Dashboard Layout System

### Desktop layout

Use:
- Fixed or collapsible sidebar.
- Top navigation bar.
- Main content area.
- Breadcrumb navigation.
- Page title.
- Contextual actions.
- Responsive card grid.

#### Recommended sidebar width:
- **Expanded:** 248px.
- **Collapsed:** 76px.

#### Top bar:
- **Height:** 68px.

#### Main content:
- **Maximum width:** 1440px.
- **Padding:** 32px.

### Dashboard cards

#### Standard cards:
- White background.
- 1px solid `#E5E7EB`.
- 12px radius.
- 20–24px padding.

#### Statistic cards:
- Large numerical value.
- Supporting label.
- Small icon.
- Optional trend indicator.

#### Tables:
- Clear headers.
- Light dividers.
- Consistent row height.
- Search and filter controls.
- Pagination.
- Responsive horizontal scrolling when necessary.

---

## 15. Social and Networking Features

Rajgir should gradually introduce social features to encourage repeat engagement.

### Recommended features:
- User profiles.
- Follow connections.
- Community membership.
- Team invitations.
- Activity announcements.
- Group-run discovery.
- Achievement sharing.
- Event updates.
- Notifications.
- Moderated community discussions.

### Profile design

Each profile should display:
- Profile image.
- Full name.
- Location.
- Running interests.
- Preferred distances.
- Associated communities.
- Associated teams.
- Marathon participation history.
- Achievements.
- Public profile settings.

Privacy controls must allow users to decide what information is visible.

---

## 16. Event Discovery and Registration

### Event listing

Use a card-based event discovery experience.

Each card:
- Event image.
- Event title.
- Location.
- Date.
- Event type.
- Registration status.
- View details CTA.

### Event detail page

Include:
- Hero section.
- Event description.
- Race categories.
- Registration information.
- Route details.
- Event schedule.
- Eligibility.
- Rules and regulations.
- Facilities.
- FAQs.
- Sponsors.
- Registration CTA.

### Registration experience

Use a step-based process:
1. Select participant type.
2. Choose race category.
3. Enter participant details.
4. Add emergency contact details.
5. Review registration.
6. Complete payment where applicable.
7. Display confirmation.

Provide a downloadable confirmation and clear registration status.

---

## 17. Navigation and Information Hierarchy

The platform must distinguish between public navigation and authenticated navigation.

Public visitors should be able to explore the event and communities without needing to log in.

Authentication should only be required when a user wants to perform restricted actions such as:
- Registering.
- Joining a private community.
- Creating a team.
- Sending invitations.
- Managing an organization.

Keep the navigation consistent across all authenticated user roles.

---

## 18. Responsive Design

Mobile-first responsive design is mandatory.

### Breakpoints:

| Device | Width |
| :--- | :--- |
| **Small mobile** | 360px–480px |
| **Large mobile** | 481px–767px |
| **Tablet** | 768px–1023px |
| **Laptop** | 1024px–1279px |
| **Desktop** | 1280px–1535px |
| **Large desktop** | 1536px+ |

### Mobile requirements
- Collapsible navigation.
- Single-column cards where appropriate.
- Large touch targets.
- Simplified tables.
- Sticky primary action where useful.
- Readable typography.
- Optimized image sizes.
- No horizontal overflow.
- Easy-to-use registration forms.

Dashboard sidebars should convert into a mobile drawer.

Important actions must remain easy to reach.

---

## 19. Iconography

Use a consistent outline icon system.

- **Recommended library:** Lucide Icons
- **URL:** https://lucide.dev/

### Guidelines:
- Standard icon size: 20px.
- Small icon size: 16px.
- Large feature icon: 24–32px.
- Use consistent stroke weight.
- Avoid mixing different icon families.

Icons should generally use charcoal or gray.

Use red only for active or important actions.

---

## 20. Component Library

Build reusable components for:

### Global components
- Header.
- Footer.
- Navigation.
- Breadcrumb.
- Page heading.
- Section heading.
- Search bar.
- Notifications.
- User profile menu.

### Marketing components
- Hero banner.
- Event statistics.
- Race category cards.
- Community cards.
- Sponsor logo grid.
- Story cards.
- Gallery.
- Testimonial cards.
- Newsletter section.

### Dashboard components
- Sidebar.
- Topbar.
- Statistics cards.
- Activity feed.
- Data tables.
- Filters.
- Tabs.
- Charts.
- Empty states.

### Form components
- Text input.
- Select.
- Multi-select.
- Date picker.
- File upload.
- Radio buttons.
- Checkboxes.
- Step progress.
- Validation messages.

### Feedback components
- Toast notifications.
- Confirmation dialogs.
- Loading states.
- Skeleton loaders.
- Success screens.
- Error states.

All components must use the defined color, typography, radius and spacing tokens.

---

## 21. Accessibility

Target WCAG 2.2 AA.

### Requirements:
- Keyboard navigation.
- Visible focus states.
- Appropriate contrast.
- Semantic headings.
- Accessible form labels.
- Descriptive image alt text.
- Accessible modal behavior.
- Screen-reader-friendly notifications.
- Touch targets of approximately 44px or larger.
- Do not communicate status through color alone.

---

## 22. Animation and Interaction

Animations should be subtle and purposeful.

### Recommended:
- 150–200ms button transitions.
- 200–250ms card hover transitions.
- Gentle image zoom on hover.
- Smooth accordion transitions.
- Subtle page transitions.
- Small loading indicators.

### Avoid:
- Excessive parallax.
- Continuous background animations.
- Flashing elements.
- Large bouncing animations.
- Slow transitions that delay navigation.

Respect reduced-motion preferences.

---

## 23. Technical Design Tokens

Suggested CSS variables:

```css
:root {
  /* Brand */
  --brand-red: #E31B23;
  --brand-red-dark: #B5121B;
  --brand-saffron: #F5A623;
  --brand-gold: #FFC928;
  --brand-gold-dark: #C78A12;

  /* Background */
  --background: #FFFFFF;
  --surface: #FFFFFF;
  --surface-soft: #F8F8F6;
  --surface-warm: #FFF9EF;

  /* Typography */
  --text-primary: #111827;
  --text-secondary: #4B5563;
  --text-muted: #6B7280;

  /* Borders */
  --border: #E5E7EB;
  --border-strong: #D1D5DB;

  /* Status */
  --success: #15803D;
  --warning: #D97706;
  --error: #DC2626;
  --info: #2563EB;

  /* Typography */
  --font-body: "Manrope", sans-serif;
  --font-display: "Barlow Condensed", sans-serif;
  --font-devanagari: "Noto Sans Devanagari", sans-serif;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-card: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Shadows */
  --shadow-sm:
    0 2px 8px rgba(17, 24, 39, 0.05);

  --shadow-md:
    0 8px 24px rgba(17, 24, 39, 0.08);
}
```

---

## 24. Homepage Design Personality

The homepage should be visually distinct from the authenticated dashboard.

### Public website:
- Large photography.
- Strong display headings.
- Heritage-inspired design.
- Event-focused storytelling.
- Community discovery.
- Prominent CTAs.

### Authenticated application:
- Clean white background.
- Compact navigation.
- Structured cards.
- Data visualization.
- Practical forms.
- Functional interactions.

Both should share the same typography, color palette, buttons, icons and brand identity.

---

## 25. What to Avoid

Do not:
- Use red as the entire page background.
- Use gradients as the dominant design language.
- Use too many different font families.
- Use inconsistent card radii.
- Use excessive shadows.
- Use giant pill-shaped buttons everywhere.
- Make every section visually identical.
- Use decorative heritage graphics excessively.
- Mix unrelated icon styles.
- Overload the homepage with information.
- Make the dashboard look like a marketing landing page.
- Make every user role use the same dashboard content.

---

## 26. Final Design Direction

The final Rajgir Marathon experience should communicate three things immediately:

### 1. Sporting excellence
A premium marathon identity with confident typography, strong event imagery and professional registration experiences.

### 2. Cultural identity
Rajgir's hills, heritage and architecture should create a distinctive identity that cannot be confused with another Indian marathon.

### 3. Community belonging
The platform should make it easy for runners, schools, corporates, volunteers, clubs and sponsors to find one another and participate.

### Final visual recommendation
- 60% white and neutral backgrounds.
- 30% charcoal typography and neutral surfaces.
- 10% red, saffron and gold brand accents.
- Manrope for the interface.
- Barlow Condensed for sporting headlines.
- Noto Sans Devanagari for Hindi.
- 8px button radius.
- 12px standard card radius.
- 16px feature card radius.
- 20px hero container radius.
- Strong authentic photography.
- Minimal heritage-inspired graphics.
- Consistent responsive layouts.

The desired outcome: A premium, modern Indian marathon and community platform that celebrates Rajgir's heritage while building a year-round running ecosystem.

---
*End of design specification.*
