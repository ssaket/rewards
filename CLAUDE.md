# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Deployment
- `npm run deploy` - Deploy to GitHub Pages (runs build then gh-pages deployment)

## Project Architecture

This is a React + TypeScript task reward application built with Vite. The app helps users track completed tasks and earn points/coins based on task difficulty.

### Key Components Structure

**Core Data Flow:**
- `App.tsx` is the main orchestrator that manages task state via React hooks
- Tasks are persisted to localStorage and loaded on app initialization
- State flows down through props, callbacks flow up to modify state

**Component Hierarchy:**
```
App.tsx (state management, localStorage persistence)
├── BackgroundAnimation.tsx (D3-powered animated background)
├── AddTask.tsx (modal form for adding completed tasks)
├── TaskList.tsx (displays today's tasks + collapsible previous tasks)
├── ProgressChart.tsx (D3 bar chart showing weekly points)
└── AchievementBadge.tsx (milestone badges and streak tracking)
```

**Task System:**
- Tasks have: `id`, `name`, `timestamp`, `points` (defined in `types.ts`)
- Points awarded: Easy (5), Medium (10), Hard (20)
- UI refers to points as "coins" for gamification
- Tasks are completed items, not todo items

### Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling with glassmorphism effects
- **D3.js** for animations and charts (BackgroundAnimation, ProgressChart)
- **localStorage** for client-side data persistence

### Key Implementation Details

**State Management:**
- Single source of truth in App.tsx via useState
- localStorage integration with JSON serialization/deserialization
- Date objects require special handling in localStorage persistence

**D3 Integration:**
- D3 is used for DOM manipulation in specific components only
- BackgroundAnimation: SVG-based falling leaves and swaying trees
- ProgressChart: Bar chart with scales and axes for weekly points visualization
- Both components use useRef + useEffect pattern for D3 lifecycle management

**Styling Approach:**
- Tailwind utility classes throughout
- Backdrop blur effects (`backdrop-blur-sm`) for glassmorphism
- Responsive design with mobile-first approach
- Custom animations via Tailwind transitions

### Development Guidelines

**Component Patterns:**
- Functional components with TypeScript interfaces for props
- useEffect for side effects, useState for local state
- Detailed JSDoc comments explaining component purpose and props

**Data Handling:**
- Tasks are always completed items (past tense naming)
- Points/coins terminology: internal code uses "points", UI shows "coins"
- Date calculations for "today" vs "previous" task segregation
- Streak calculation based on consecutive days with tasks

**GitHub Pages Deployment:**
- Configured for `rewards` repository path
- Vite base path set to `/rewards/` in vite.config.ts
- Uses gh-pages package for automated deployment