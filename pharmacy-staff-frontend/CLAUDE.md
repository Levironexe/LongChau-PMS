# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
# Development Partnership

We're building production-quality code together. Your role is to create maintainable, efficient solutions while catching potential issues early.

When you seem stuck or overly complex, I'll redirect you - my guidance helps you stay on track.

## 🚨 AUTOMATED CHECKS ARE MANDATORY
No errors. No formatting issues. No linting problems. Zero tolerance.  
These are not suggestions. Fix ALL issues before continuing.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!

### Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:
1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me  
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use **"ultrathink"** to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

### USE MULTIPLE AGENTS!
*Leverage subagents aggressively* for better results:

* Spawn agents to explore different parts of the codebase in parallel
* Use one agent to write tests while another implements features
* Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
* For complex refactors: One agent identifies changes, another implements them

Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

### Reality Checkpoints
**Stop and validate** at these moments:
- After implementing a complete feature
- Before starting a new major component  
- When something feels wrong
- Before declaring "done"

> Why: You can lose track of what's actually working. These checkpoints prevent cascading failures.

This includes:
- Formatting issues (gofmt, black, prettier, etc.)
- Linting violations (golangci-lint, eslint, etc.)
- Forbidden patterns (time.Sleep, panic(), interface{})
- ALL other checks

Your code must be 100% clean. No exceptions.

**Recovery Protocol:**
- After fixing all issues and verifying the fix, continue where you left off
- Use the todo list to track both the fix and your original task

## Working Memory Management

### When context gets long:
- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes

### Maintain TODO.md:
```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed  
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

## Go-Specific Rules

### FORBIDDEN - NEVER DO THESE:
- **NO interface{}** or **any{}** - use concrete types!
- **NO time.Sleep()** or busy waits - use channels for synchronization!
- **NO** keeping old and new code together
- **NO** migration functions or compatibility layers
- **NO** versioned function names (processV2, handleNew)
- **NO** custom error struct hierarchies
- **NO** TODOs in final code

> **AUTOMATED ENFORCEMENT**: The smart-lint hook will BLOCK commits that violate these rules.  
> When you see `❌ FORBIDDEN PATTERN`, you MUST fix it immediately!

### Required Standards:
- **Delete** old code when replacing it
- **Meaningful names**: `userID` not `id`
- **Early returns** to reduce nesting
- **Concrete types** from constructors: `func NewServer() *Server`
- **Simple errors**: `return fmt.Errorf("context: %w", err)`
- **Table-driven tests** for complex logic
- **Channels for synchronization**: Use channels to signal readiness, not sleep
- **Select for timeouts**: Use `select` with timeout channels, not sleep loops

## Implementation Standards

### Our code is complete when:
- ? All linters pass with zero issues
- ? All tests pass  
- ? Feature works end-to-end
- ? Old code is deleted
- ? Godoc on all exported symbols

### Testing Strategy
- Complex business logic ? Write tests first
- Simple CRUD ? Write tests after
- Hot paths ? Add benchmarks
- Skip tests for main() and simple CLI parsing

## Problem-Solving Together

When you're stuck or confused:
1. **Stop** - Don't spiral into complex solutions
2. **Delegate** - Consider spawning agents for parallel investigation
3. **Ultrathink** - For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
4. **Step back** - Re-read the requirements
5. **Simplify** - The simple solution is usually correct
6. **Ask** - "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Performance & Security

### **Measure First**:
- No premature optimization
- Benchmark before claiming something is faster
- Use pprof for real bottlenecks

### **Security Always**:
- Validate all inputs
- Use crypto/rand for randomness
- Prepared statements for SQL (never concatenate!)


### Import Organization
1. **Standard library imports** (grouped and sorted)
2. **Third-party library imports** (grouped and sorted)
3. **Local project imports** (grouped and sorted)

### Progress Updates:
```
✓ Implemented authentication (all tests passing)
✓ Added rate limiting  
✗ Found issue with token expiration - investigating
```

### Suggesting Improvements:
"The current approach works, but I notice [observation].
Would you like me to [specific improvement]?"

## Working Together

- This is always a feature branch - no backwards compatibility needed
- When in doubt, we choose clarity over cleverness
- **REMINDER**: If this file hasn't been referenced in 30+ minutes, RE-READ IT!

Avoid complex abstractions or "clever" code. The simple, obvious solution is probably better, and my guidance helps you stay focused on what matters.

## Project Structure

This is a LongChau Pharmacy Management System (PMS) with three main components:

1. **pharmacy-customer-frontend/**: Next.js customer-facing web application
2. **pharmacy-staff-frontend/**: Next.js staff management interface  
3. **pharmacy_poc_backend/**: Django REST API backend

## Development Commands

### Frontend Applications (Both pharmacy-customer-frontend and pharmacy-staff-frontend)
```bash
# Development server (runs on port 3000 by default)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Backend (pharmacy_poc_backend)
```bash
# Activate virtual environment (if not already active)
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start development server (runs on port 8000)
python manage.py runserver

# Create superuser for admin access
python manage.py createsuperuser
```
# tmux-dev

Manage development servers running in tmux sessions. This workflow helps monitor long-running processes without blocking the terminal.

## Start Development Server

To start a development server in a tmux session:

```
Please start the development server in a new tmux session named [session-name]:
- Navigate to the project directory
- Create tmux session: tmux new-session -d -s [session-name] '[command]'
- Verify it's running with tmux list-sessions
```

Example: "Start the Next.js dev server in tmux session 'my-app'"

## Check Logs

To view logs from a running tmux session without attaching:

```
Show me the last [N] lines of logs from tmux session [session-name]:
- Use: tmux capture-pane -t [session-name] -p | tail -[N]
```

Example: "Show me the last 50 lines from the insta-admin tmux session"

## Monitor in Real-time

To attach and monitor logs interactively:

```
Attach me to the tmux session [session-name] to see real-time logs:
- Use: tmux attach -t [session-name]
- Note: User can detach with Ctrl+B then D
```

## List Sessions

To see all running tmux sessions:

```
Show me all running tmux sessions:
- Use: tmux list-sessions
```

## Stop Server

To stop a development server:

```
Stop the tmux session [session-name]:
- Use: tmux kill-session -t [session-name]
```

## Common Patterns

### Quick Status Check
"Is the insta-admin server still running? Show me the last 20 lines of logs"

### Debugging
"Show me the last 100 lines from the backend session, I think there's an error"

### Multiple Servers
"Start frontend on port 3000 and backend on port 8000 in separate tmux sessions"
## Architecture Overview

### Backend API Structure
- **Core Models**: Product, Inventory, Customer, Order management
- **API Endpoints**: RESTful APIs at `/api/` with full CRUD operations
- **Database**: PostgreSQL (Supabase hosted)
- **Key Features**: VIP customer upgrades, low stock alerts, automatic discounts

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with Radix UI components
- **State Management**: React Query (@tanstack/react-query) for server state
- **API Communication**: Axios with base URL configuration
- **UI Components**: Shared component library in `components/ui/`

### API Integration
Both frontends connect to the Django backend at `https://longchau-pms.onrender.com/api` by default. The API URL is configurable via `NEXT_PUBLIC_API_URL` environment variable.

### Key API Endpoints
- `/api/products/` - Product management
- `/api/inventory/` - Stock tracking with `/low_stock/` endpoint
- `/api/customers/` - Customer management
- `/api/orders/` - Order processing

## Development Workflow

1. Frontend connects to deployed backend at `https://longchau-pms.onrender.com/api`
2. Run frontend(s) in terminals: `cd pharmacy-*-frontend && npm run dev`
3. Access admin interface at `https://longchau-pms.onrender.com/admin/`
4. Customer frontend typically runs on `http://localhost:3000`
5. Staff frontend runs on a different port (configure in package.json if needed)

## Important Notes

- Both frontends share similar tech stacks but serve different user roles
- Backend uses CORS_ALLOW_ALL_ORIGINS for development (should be restricted in production)
- Database contains hardcoded credentials (should use environment variables in production)
- No authentication implemented currently - uses AllowAny permissions