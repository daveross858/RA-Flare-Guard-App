# RA Flare-Guard — AI Flare Coach Outline

## 1. Core Purpose
- Serve as an AI-guided wellness companion tailored for people living with Rheumatoid Arthritis (RA).
- Predict daily flare risk by fusing lifestyle, self-reported, and physiological signals.
- Surface likely triggers and personalized interventions to reduce flare frequency and severity.
- Produce clinician-ready summaries to keep care teams informed and aligned.

## 2. High-Level Features

### A. Patient-Facing Mobile or Web App
1. **Onboarding & Profile Setup**
   - Capture medical background: diagnosis date, current symptoms, medication regimen.
   - Collect typical flare triggers, dietary preferences, mobility limitations, and top wellness goals.
   - Optional integrations with Apple Health, Google Fit, Fitbit, and manual wearable uploads.
2. **Daily Flare-Risk Score**
   - Combine self-reported check-ins, sleep, steps, heart rate variability (HRV), and other wearable metrics.
   - Present risk as Low / Medium / High with an estimated probability percentage and key drivers.
3. **Trigger Detection & Logging**
   - Food journaling through quick photo capture or text entry.
   - AI classifies foods (e.g., gluten, fried, high sugar) and correlates with flare history.
   - Track environmental or lifestyle factors such as stress, weather, menstruation, or activity changes.
4. **Daily Guidance & Coaching**
   - Morning briefing with flare-risk summary and daily plan.
   - Evening check-in covering pain, fatigue, mood, medication adherence, and notable events.
   - AI-generated suggestions for meals, joint-friendly mobility routines, mindfulness breaks, and sleep hygiene.
5. **Weekly Reports & Sharing**
   - Auto-generated weekly summary accessible in-app and exportable as PDF.
   - Highlight flares, suspected triggers, adherence trends, and progress toward goals.
   - Shareable securely with clinicians or caregivers via email link or portal access.

### B. Founder / Admin Back Office
1. **User Metrics Dashboard**
   - Monitor active users, retention cohorts, daily check-in completion, and flare-risk distribution.
   - Visualize trigger prevalence and correlations across the user base.
2. **Content & Knowledge Management**
   - Manage the Retrieval-Augmented Generation (RAG) content library with medical guidelines and vetted resources.
   - Configure prompts, templates, and safety guardrails for daily plans and check-in messaging.
3. **Operations Toolkit (Future)**
   - Manage beta invites, clinician partners, and subscription tiers.
   - Review anonymized insights to inform product improvements and clinical research.

## 3. Core Data Model

### `users`
| Column       | Type   | Purpose                                           |
| ------------ | ------ | ------------------------------------------------- |
| `id`         | UUID   | Primary key                                       |
| `email`      | text   | Authentication login                              |
| `name`       | text   | Optional display name                             |
| `condition`  | text   | Primary condition (e.g., "Rheumatoid Arthritis") |
| `goals`      | text[] | List of user-selected wellness goals              |
| `created_at` | ts     | Account creation timestamp                        |

### `daily_logs`
| Column         | Type | Purpose                                     |
| -------------- | ---- | ------------------------------------------- |
| `id`           | UUID | Daily entry ID                              |
| `user_id`      | UUID | Foreign key → `users.id`                    |
| `date`         | date | Log date                                    |
| `sleep`        | int  | Total sleep hours                           |
| `steps`        | int  | Daily step count                            |
| `hrv`          | int  | HRV score or index                          |
| `pain_level`   | int  | Self-reported pain (1–10)                   |
| `stress_level` | int  | Self-reported stress (1–10)                 |
| `risk_score`   | int  | AI-calculated flare probability percentage  |

### `meals`
| Column     | Type   | Purpose                                  |
| ---------- | ------ | ---------------------------------------- |
| `id`       | UUID   | Meal entry ID                            |
| `user_id`  | UUID   | Foreign key → `users.id`                 |
| `date`     | date   | Meal date                                |
| `photo_url`| text   | Stored food image reference              |
| `tags`     | text[] | AI-recognized foods or nutritional tags  |
| `notes`    | text   | User-provided notes or context           |

### `reports`
| Column       | Type  | Purpose                               |
| ------------ | ----- | ------------------------------------- |
| `id`         | UUID  | Report ID                             |
| `user_id`    | UUID  | Foreign key → `users.id`              |
| `week_start` | date  | Week the report summarizes             |
| `summary`    | jsonb | AI-generated insights and trend data   |
| `pdf_url`    | text  | Location of exported clinician report |

## 4. AI / ML System Overview
- **Inputs:** Self-reported pain and stress scores, sleep duration, steps, HRV, medication adherence, and food log classifications.
- **Risk Model:** Rule-based baseline (e.g., heuristics on sleep deficit + pain trend) enhanced with ML models trained on historical logs to predict flare probability.
- **Trigger Analysis:** Correlation engine linking foods, activities, and environmental factors to flare events, with statistical significance filters and user-specific personalization.
- **Guidance Generator:** LLM orchestrated via RAG pulling from vetted rheumatology guidelines, nutrition advice, and PT/OT recommendations; includes safety checks and human-in-the-loop review workflows.
- **Learning Loop:** Feedback from user ratings and clinician comments refine prompts, adjust risk thresholds, and inform future model training datasets.

## 5. End-to-End User Flow
1. **Signup & Onboarding**
   - User creates account, confirms diagnosis, sets goals, and optionally connects wearables.
   - Guided tutorial highlights privacy, data usage, and value proposition.
2. **Daily Routine**
   - Morning: Receive flare-risk score, explanation of drivers, and tailored action plan.
   - Throughout the day: Capture meals via camera or quick log, receive nudges for hydration, movement, or rest.
   - Evening: Complete reflective check-in covering symptoms, mood, triggers, and medication adherence.
3. **Real-Time Support**
   - High-risk alerts trigger push notifications with mitigation suggestions and escalation pathways.
   - Trigger insights appear when new patterns are detected (e.g., "Three recent flares followed high-sodium meals").
4. **Weekly Wrap-Up**
   - Automated report summarizes flare frequency, trigger correlations, adherence stats, and suggested focus areas.
   - User can export PDF for clinicians or sync with patient portals.

## 6. Technical Stack & Infrastructure
- **Frontend:** React Native for cross-platform mobile or React PWA leveraging Tailwind CSS.
- **Backend:** Supabase for authentication, database, file storage (meal photos), and edge functions.
- **AI Layer:**
  - OpenAI/GPT for natural-language coaching content with RAG context.
  - Custom ML microservices for flare-risk scoring and trigger analytics.
  - Food image recognition via Replicate-hosted models or similar APIs.
- **Reporting:** Serverless functions on Vercel/Cloudflare to assemble PDFs with embedded charts.
- **Analytics & Monitoring:** Segment or PostHog for product analytics; Sentry for error monitoring.

## 7. Roadmap
- **MVP (First 90 Days):**
  - Guided onboarding with manual data entry and basic waitlist management.
  - Rule-based flare-risk scoring and simple trigger tagging.
  - Meal/photo logging pipeline with lightweight AI classification.
  - Weekly PDF report generation and email export.
  - Collect beta feedback and iterate on UI flows.
- **Future Enhancements:**
  - Deep wearable integrations and continuous data syncing.
  - Push notifications, habit streaks, and gamified adherence.
  - Tiered subscriptions, clinician dashboards, and EMR-friendly exports.
  - Partnerships with healthcare providers and insurers for reimbursement pathways.
  - Advanced ML personalization leveraging federated learning and privacy-preserving analytics.

## 8. Success Metrics & Considerations
- Reduction in self-reported flare frequency or intensity over 90 days.
- Daily check-in completion rate and active user retention (D30/D90).
- Accuracy and user trust in flare-risk predictions (surveyed confidence, reported correctness).
- Clinician adoption: number of shared reports and qualitative feedback.
- Compliance with medical device regulations, HIPAA/GDPR readiness, and ethical AI guidelines.
