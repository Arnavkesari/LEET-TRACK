# LeetCode Friends Tracker

A full-stack web application to track LeetCode progress, compete with friends, and participate in coding challenges.

## Features

- User authentication (Email/Password & Google OAuth)
- Dashboard with real-time stats
- Friend management system
- LeetCode profile scraping
- Leaderboard rankings
- Friend profiles

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Framer Motion, React Icons  
**Backend:** Node.js, Express, MongoDB, Mongoose, Puppeteer  
**Authentication:** JWT, Google OAuth

## Setup

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Create `.env` files in both frontend and backend directories with required credentials.

## Future Work

- Complete implementation of Challenges page functionality
- Real-time challenge notifications
- Challenge progress tracking with LeetCode API integration
- Challenge history analytics and statistics
- Automated challenge completion detection
