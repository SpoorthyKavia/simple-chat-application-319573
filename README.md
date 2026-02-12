# Simple Chat Application

A simple chat application where users can sign up, log in, and send real-time messages.  
Backend: Express (REST + WebSocket)  
Database: MongoDB  
Frontend: React

## Required environment variables

### backend_server
See `backend_server/.env.example`:
- `MONGODB_URL`, `MONGODB_DB` (from `chat_database` container)
- `JWT_SECRET`

### chat_frontend
See `chat_frontend/.env.example` (optional).

## Endpoints

- REST docs: `/docs`
- WebSocket help: `/ws-help`
- WebSocket endpoint: `/ws?token=<JWT>&roomId=global`