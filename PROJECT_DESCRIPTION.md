# Atenea - Peer-to-Peer Educational Marketplace and Instant Tutoring

## Problem Statement
University and high school students routinely face acute academic bottlenecks, ranging from imminent homework deadlines to complex programming bugs and advanced mathematical concepts. Traditional tutoring platforms are rigid, cost-prohibitive, and necessitate booking days in advance for fixed, prolonged sessions. Simultaneously, qualified university students and independent educators lack an agile, transparent mechanism to monetize their domain expertise through on-demand micro-consultations or tailored long-term mentorships.

## Architecture and System Workflow
Atenea establishes a two-sided educational marketplace designed for high-efficiency knowledge transfer:
1. **Demand Generation (Doubt & Mentorship Inquiries):** Students publish specific academic challenges or structured tutoring requests, defining custom budgets, urgency deadlines, and subject classifications (such as Calculus, Physics, Web Development, and UX Design).
2. **Real-time Proposal and Matching Engine:** Mentors review the live open inquiries feed and submit customized proposals specifying either fixed-price deliverables or hourly compensation models.
3. **Integrated Collaboration and Resolution Lifecycle:** Upon bid acceptance, a dedicated communication channel opens. After resolution, the student executes a multi-point evaluation covering methodology, timeliness, and domain mastery.

## Key Capabilities and Technical Innovations
- **Live Inquiry Feed:** Real-time stream of academic inquiries ordered by urgency indices and budget parameters.
- **Bi-directional Discovery Infrastructure:** Dual discovery paradigm supporting both student-driven broadcasts and direct mentor profile exploration through searchable directory indexes.
- **Persistent Glassmorphic Interface:** Low-latency, distraction-free visual environment utilizing continuous reactive canvas layouts that preserve runtime animation states across role transitions.
- **Reputation and Credibility Engine:** Transparent metric evaluation incorporating verified mentor credentials, weighted aggregate ratings, and community-validated review usefulness scoring.
- **Stateful Interaction Tracking:** Real-time state machine governing the lifecycle of each engagement (Open, In Progress, Resolved, Closed).

## Rationale and Motivation
The platform was conceived to eliminate friction in academic assistance, ensuring that students never remain blocked due to inaccessible support. By transforming peer knowledge sharing into a streamlined micro-economy, Atenea provides immediate academic relief while offering competitive economic incentives for high-performing student mentors.

## Technology Stack
- **Frontend Architecture:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React.
- **Backend and Persistence:** Convex Cloud Serverless Platform (Reactive Document Database, Serverless Mutations and Queries, Native WebSocket synchronization).
- **Authentication Infrastructure:** Convex Auth with asymmetric JWT and JWKS cryptographic validation.
- **Continuous Integration and Deployment:** GitHub Actions pipeline targeting GitHub Pages for static bundle hosting and Convex Cloud for backend synchronization.

## Engineering Challenges Overcome
- **Real-time Synchronization Across Heterogeneous Roles:** Coordinating multi-user state changes between student inquiry submissions, mentor bidding queues, and private messaging channels without polling overhead.
- **Base Path Resolution in Sub-directory Static Deployments:** Managing relative asset resolution and SPA state transitions within GitHub Pages hosting constraints while maintaining uninterrupted WebSocket sessions to cloud backends.
- **Interface State Continuity:** Engineering an ambient viewport layout that retains visual and functional continuity during role switching (Student to Mentor) without tearing or re-mounting the rendering tree.

## Metrics and Platform Viability
- **Resolution Latency:** Substantially reduces matching time from multiple days to under ten minutes for urgent inquiries.
- **Zero-Cold-Start Performance:** Edge-deployed architecture ensuring near-zero initialization times across global distribution endpoints.
- **Scalable Document Model:** Normalized schema capable of scaling query execution across thousands of concurrent real-time transactions with minimal latency.
