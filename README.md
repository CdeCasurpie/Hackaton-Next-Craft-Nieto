# Atenea - Peer-to-Peer Educational Marketplace & Instant Tutoring

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Convex-Serverless-EA4E43?style=for-the-badge&logo=convex&logoColor=white" alt="Convex" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

Atenea is a real-time, dual-sided marketplace designed to bridge the gap between students needing urgent academic help and qualified peers ready to monetize their knowledge. Built for high-efficiency knowledge transfer, it replaces rigid, traditional tutoring platforms with an agile micro-gig economy for education.

---

## 🚀 Key Features

*   **Live Inquiry Feed ("Muro de Dudas"):** Real-time broadcast of urgent academic questions across categories like Calculus, Physics, and Programming, complete with custom budgets and deadlines.
*   **Instant Mentor Matching:** Mentors can actively monitor the live feed, submit customized proposals (fixed or hourly), and establish immediate contact.
*   **Integrated Real-time Workspaces:** Secure, persistent chat channels tied directly to specific doubts or mentorship requests. Features lifecycle tracking from *Open* to *Resolved*.
*   **Reputation & Verification Engine:** Comprehensive mentor profiles with verified badges, aggregate star ratings, and community-validated reviews to ensure high-quality interactions.
*   **Role-fluid Glassmorphic UI:** A distraction-free, persistent animated environment that seamlessly transitions between "Student" and "Mentor" views without unmounting the core application state.

## 🛠️ Technology Stack

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling & Animation:** Tailwind CSS v4, Framer Motion, Lucide Icons
*   **Backend & Database:** [Convex Cloud Serverless Platform](https://www.convex.dev/) (Native WebSockets, Reactive Document DB)
*   **Authentication:** Convex Auth (`@convex-dev/auth`) via JWT & magic links
*   **CI/CD Deployment:** GitHub Actions pipeline delivering static assets to GitHub Pages.

## ⚙️ Local Development Setup

To run Atenea locally, you need [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cdecasurpie/Hackaton-Next-Craft-Nieto.git
   cd Hackaton-Next-Craft-Nieto/ConvexSrc
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the Convex backend and Vite development server:**
   ```bash
   npm run dev
   ```
   *This command will simultaneously launch the local Vite server (usually on `http://localhost:5173`) and connect to your Convex development cloud environment.*

## 📂 Project Structure

```text
Hackaton-Next-Craft-Nieto/
└── ConvexSrc/
    ├── convex/                 # Convex backend serverless functions & schema
    │   ├── _generated/         # Auto-generated Convex types
    │   ├── auth.ts             # Convex Auth configuration
    │   ├── chats.ts            # Chat & messaging logic
    │   ├── publications.ts     # Dudas & Offers logic
    │   ├── schema.ts           # Database schema definition
    │   └── users.ts            # User profiles & reviews
    ├── src/                    # Frontend React application
    │   ├── components/         # Reusable UI components & Dashboard views
    │   ├── Dashboard.tsx       # Core authenticated layout
    │   ├── index.css           # Global Tailwind & Custom styles
    │   ├── Landing.tsx         # Marketing landing page
    │   └── main.tsx            # React & Convex Client Provider entry point
    └── vite.config.ts          # Vite configuration for GH Pages relative paths
```

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you have ideas for new features, bug fixes, or UI improvements.

## 📄 License

This project is licensed under the MIT License.
