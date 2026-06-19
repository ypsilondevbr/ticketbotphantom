# Discord Ticket System

A robust, modular, and professional Discord ticket bot built with discord.js v14 and better-sqlite3.

## Features
- 7 built-in categories (Support, Reports, Partnerships, Influencer, Reseller, UEFI Product, Reservation)
- Modals for complex applications (Influencer, UEFI)
- Staff claim/close mechanics (2-stage close confirmation)
- HTML transcripts generation
- Rating system via DM after close
- Persistent SQLite database (WAL mode)
- Express health check for Railway deployment
- Zero memory-persistence dependency

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill variables.
3. `npm run deploy` to register slash commands.
4. `npm start` to run.

## Usage
- Admin uses `/painel` to spawn the ticket creation embed.
