# Resource Integration Report — UnInstitutional

This document summarizes the resources integrated into the database for the Information Engine and Quiz Engine to prepare the platform for the June 14 demo.

## Information Engine Seeding Summary

All data has been integrated using the idempotent seeding script `prisma/seed-information.ts` which populates the tables with official, verified, and structured entries.

### 1. Exam Events (7 Entries)
* **UKPSC Combined State / Upper PCS — Latest Cycle** (Official Portal: psc.uk.gov.in)
* **UKPSC Lower PCS — Latest Cycle** (Official Portal: psc.uk.gov.in)
* **UKSSSC / UKSSC Group C Recruitment — Latest Cycle** (Official Portal: sssc.uk.gov.in)
* **UKSSSC / UKSSC Forest Guard Recruitment — Latest Cycle** (Official Portal: sssc.uk.gov.in)
* **SSC CGL (Combined Graduate Level) — Latest Cycle** (Official Portal: ssc.nic.in)
* **UPSC Civil Services Examination (CSE) — Latest Cycle** (Official Portal: upsc.gov.in)
* **UPSC CAPF (Central Armed Police Forces AC) — Latest Cycle** (Official Portal: upsc.gov.in)

### 2. Official Links (12 Entries)
All external links lead to verified government portals and resources, ensuring security and authenticity:
* UKPSC Official Website: `https://psc.uk.gov.in`
* UKPSC Online Application / Notice Board: `https://ukpsc.net.in`
* UKSSSC / UKSSC: `https://sssc.uk.gov.in`
* UPSC: `https://upsc.gov.in`
* SSC: `https://ssc.nic.in`
* Uttarakhand Government Portal: `https://uk.gov.in`
* NCERT Textbook Portal: `https://ncert.nic.in`
* NCERT Free Textbooks (Class 6-12): `https://ncert.nic.in/textbook.php`
* SWAYAM (Ministry of Education): `https://swayam.gov.in`
* NPTEL (IITs/IISc): `https://nptel.ac.in`
* PIB (Press Information Bureau): `https://pib.gov.in`
* eDistrict Uttarakhand: `https://edistrict.uk.gov.in`

### 3. Notifications (5 Entries)
Real platform notifications and exam update advisories:
* Welcome to UnInstitutional (UKPSC Platform guide)
* UKPSC Notice Board updates
* NCERT Free Textbooks online announcement
* SWAYAM free online courses guidelines
* UKSSSC Recruitment Portal announcements

### 4. Answer Keys (5 Entries)
Official answer keys pointing directly to the respective official portal notice boards, with PDF download links shown as "PDF Pending" fallback states (as no local PDFs are hosted):
* UKPSC Combined State Civil Services Prelims
* UKPSC Lower PCS Prelims
* UKSSSC Forest Guard Examination
* UKSSSC Group C Recruitment
* SSC CGL Tier-I Reference Key

### 5. Maps (6 Entries)
Uttarakhand-specific geographical resources with Wikimedia Commons attributes:
* Political Map of Uttarakhand
* District Map of Uttarakhand (13 districts)
* River and Drainage Map of Uttarakhand
* Physical / Relief Map of Uttarakhand
* Forest and Wildlife Areas Map of Uttarakhand
* India Locator Map (Uttarakhand Highlighted)
* *Note: All maps currently render a clean, high-quality SVG placeholder (`public/resources/maps/placeholder.svg`) indicating that the maps will render real images upon final deployment uploads.*

### 6. Govt Learning Links (8 Entries)
Portal-level links pointing directly to course directories on SWAYAM/NPTEL for core syllabus areas:
* Indian Polity & Governance (SWAYAM)
* Indian Geography & Environment (NPTEL)
* Modern Indian History (SWAYAM)
* Indian Economy & Development (SWAYAM)
* Environmental Science & Ecology (NPTEL)
* General Science & Technology (SWAYAM)
* Disaster Management (SWAYAM)
* NCERT Textbooks (All Subjects)

### 7. PYQ Papers (8 Entries)
Previous Year Question entries containing official external notice board links and marked with clean "PDF Pending" state indicators:
* UKPSC Combined State Civil Services Prelims (2023, 2022, 2021)
* UKPSC Lower PCS Prelims (2023, 2022)
* UKSSSC Forest Guard Recruitment (2023)
* UKSSSC Group C Recruitment (2022)
* UPSC CSE Prelims Reference Paper (2023)

### 8. Current Affairs (12 Entries)
High-quality, realistic current affairs events compiled from Press Information Bureau (PIB) and official government announcements, including:
* Uttarakhand uniform civil code passage (2024)
* Silkyara tunnel rescue operations
* Lakhwar multipurpose project developments
* Traditional Aipan art promotion initiatives
* Vibrant Villages Programme in Uttarakhand border regions
* Digital India Land Records Modernization

### 9. Magazine Resources (4 Entries)
Links to government publication portals:
* Yojana Magazine (Ministry of Information)
* Kurukshetra Magazine
* PIB Monthly Digest
* Science Reporter

---

## Quiz Engine Seeding Summary

All quiz content is seeded using the idempotent `prisma/seed-ukpsc-quiz-expansion.ts` script.

### Expanded Quiz Coverage
* **Total Subjects**: 5 (Uttarakhand GK, Geography, Polity, Current Affairs, Basic Hindi)
* **Total Topics**: 15 (5 original MVP + 10 new expansion topics)
* **Total Questions**: 75 MCQs (5 per topic, fully bilingual English/Hindi, with detailed explanations in both languages)

### New Topics Added
* **Uttarakhand GK**:
  * Geography and Environment of Uttarakhand (Nanda Devi peak, Valley of Flowers, glaciers)
  * Polity and Districts of Uttarakhand (renaming history, High Court location, seat counts)
* **Geography**:
  * Indian Drainage System and Rivers (Ganga basin, Dakshin Ganga, confluences)
  * Soil and Vegetation of India (alluvial, black cotton, evergreen, Sundari trees)
* **Polity**:
  * Directive Principles and Fundamental Duties (Articles 36-51, 51A, Swaran Singh Committee)
  * Union Parliament and State Legislature (ex-officio chairmen, age eligibility, money bills)
* **Current Affairs**:
  * Uttarakhand Current Affairs (UCC Bill 2024, Silkyara tunnel rescue, Lakhwar project)
  * Central Government Schemes (PMJDY, PMUY, PM-JAY, PM Vishwakarma, Jal Jeevan Mission)
* **Basic Hindi**:
  * Hindi Grammar: Sandhi and Samas (Sandhi types, Vidyalaya, Lambodar, Dwandwa Samas)
  * Hindi Grammar: Muhavare and Lokoktiyan (coal dealership, Angootha dikhana, courtyard proverb)
