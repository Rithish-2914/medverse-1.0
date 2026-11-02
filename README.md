# 🏥 MedVerse 1.0 — Healthcare Hackathon Platform

> **A full-featured healthcare hackathon management & live judging portal. Built with Next.js 16, Neon Serverless PostgreSQL, Vercel Blob, JWT security, and Tailwind CSS.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Neon-Serverless%20Postgres-00e599.svg)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

**MedVerse 1.0** is an enterprise hackathon platform engineered for medical technology and healthcare innovation events. It coordinates the entire hackathon lifecycle — from participant team registration and problem statement allocation to live dynamic surprise twists, hardware kit inventory drawing, presentation submission uploads, and multi-criteria judge evaluation dashboards.

---

## ✨ Features

- **👥 Multi-Role Portals**: Dedicated authentication flows and role-specific dashboards for **Participants**, **Judges**, and **Admins**.
- **🎲 Dynamic Problem Allocation & "Twist" Engine**: Real-time release of hackathon problem statements and surprise constraints ("Twist Reveals") that push teams to innovate under pressure.
- **📦 Hardware Kit Drawing**: Integrated kit allocation system tracking hardware kits, sensors, and components issued to teams.
- **📤 Submission & Presentation Management**: Vercel Blob cloud storage integration for PPT decks, repository links, and final project deliverables.
- **⚖️ Real-Time Judging & Scoring**: Interactive grading rubrics with weighted scoring criteria, judge feedback notes, and automated leaderboard calculation.
- **⚡ Serverless Architecture**: Ultra-fast response times backed by Neon Serverless PostgreSQL and Next.js 16 App Router.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19, Server Components & App Router)
- **Database**: Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- **Authentication**: JWT (JSON Web Tokens), `bcryptjs` password hashing, secure HTTP-only cookies
- **Cloud Storage**: Vercel Blob (`@vercel/blob`)
- **Styling**: Tailwind CSS v4, modern glassmorphism UI components

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Free [Neon](https://neon.tech) PostgreSQL database instance
- (Optional) [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) storage token

### 1. Clone the Repository
```bash
git clone https://github.com/Rithish-2914/medverse-1.0.git
cd medverse-1.0
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file by copying the template:
```bash
cp .env.example .env.local
```
Add your credentials:
```env
DATABASE_URL="postgresql://neondb_owner:your_password@ep-sample.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key"
BLOB_READ_WRITE_TOKEN="vercel_blob_token"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📂 Project Structure

```
medverse-1.0/
├── public/                 # Static branding assets
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login and authentication views
│   │   ├── admin/          # Admin control panel and leaderboard controls
│   │   ├── judge/          # Live scoring dashboard and rubric evaluator
│   │   ├── participant/    # Team portal, kit requests, submission upload
│   │   ├── problems/       # Problem statements and live twist reveal
│   │   ├── register/       # Team registration flow
│   │   └── api/            # Serverless endpoints (auth, judging, teams, blob)
│   ├── components/         # Reusable UI cards, navbars, modals
│   ├── data/               # Problem statement definitions & track configurations
│   └── lib/                # Database connection, auth helpers, constants
├── .env.example            # Environment variable template
├── LICENSE                 # MIT License
└── README.md               # Project documentation
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
