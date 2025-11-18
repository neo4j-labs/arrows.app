# SKETCH2AGENT API Specification

**Version:** 1.0.0
**Sprint:** Sprint 1 - ReAct Agents
**Last Updated:** 2025-01-18

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Agent Lifecycle](#agent-lifecycle)
5. [API Endpoints](#api-endpoints)
6. [Data Models](#data-models)
7. [Thread ID Conventions](#thread-id-conventions)
8. [Error Handling](#error-handling)
9. [Complete Workflows](#complete-workflows)
10. [Frontend Implementation Guide](#frontend-implementation-guide)

---

## Overview

This document defines the API contract between:
- **Backend**: Neoagents framework (this repo)
- **Frontend**: arrows.app fork (SKETCH2AGENT UI)

### Key Concepts

- **AgentDefinition**: Metadata about an agent (tools, prompts, status)
- **ExecutionThread**: A conversation/chat instance with an agent
- **thread_id**: Unique identifier for a conversation (enables memory)
- **memory_enabled**: Flag to enable/disable conversation history
- **Async Creation**: Agent creation is asynchronous (tools take time to build)
- **Generic Tool Generation**: 🔥 **CRITICAL** - Backend has NO hardcoded tool types! LLM generates Python code for ANY tool based on description + config. Just provide what the tool does and its credentials/config.

---

## Base URL

```
Development: http://localhost:8000
Production: https://api.sketch2agent.com
```

All endpoints are prefixed with `/api/v1`

---

## Authentication

### Sprint 1 (MVP)
No authentication required for development.

### Future Sprints
```http
Authorization: Bearer <jwt_token>
```

Include in all requests once auth is implemented.

---

## Agent Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  1. USER CLICKS "EXPORT AGENT" IN CANVAS                    │
│     Frontend sends: node properties, tools, system prompt   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  2. BACKEND CREATES AgentDefinition (status: "creating")    │
│     Returns: agent_id, status, estimated_time              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  3. ASYNC JOB BUILDS TOOLS                                  │
│     - Python code tools: 10-30s (LLM generation)           │
│     - Vector KB tools: 2-10min (document ingestion)        │
│     - API tools: 5-10s (validation)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  4. FRONTEND POLLS STATUS                                   │
│     GET /api/v1/agent/status/{agent_id} every 2s           │
│     Shows progress: "Creating tools... 2/3 complete"       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  5. STATUS = "ready" → ENABLE CHAT INTERFACE                │
│     Show "Ready to chat!" and enable message input         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  6. USER SENDS MESSAGES                                     │
│     POST /api/v1/chat with thread_id for memory           │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### 1. Create Agent

**Endpoint:** `POST /api/v1/agent/create`

**Purpose:** Create a new ReAct agent from canvas node export. Returns immediately while tools are built asynchronously.

**Frontend Trigger:** User clicks "Export Agent" button in arrows.app canvas.

#### Request

```http
POST /api/v1/agent/create
Content-Type: application/json

{
  "node_label": "customer_support",
  "system_prompt": "You are a helpful customer support assistant.",
  "model": "claude-sonnet-4",
  "tools": [
    {
      "name": "search_customers",
      "description": "Search PostgreSQL customer database by name or email",
      "config": {
        "db_connection": "postgresql://localhost:5432/customers",
        "db_user": "admin",
        "db_password": "secret"
      }
    },
    {
      "name": "get_weather",
      "description": "Get current weather for a city using WeatherAPI",
      "config": {
        "api_url": "https://api.weatherapi.com/v1/current.json",
        "api_key": "demo_key_123"
      }
    },
    {
      "name": "send_email",
      "description": "Send email via SMTP to customer",
      "config": {
        "smtp_host": "smtp.gmail.com",
        "smtp_port": 587,
        "smtp_user": "support@example.com",
        "smtp_password": "app_password_here"
      }
    }
  ],
  "metadata": {
    "created_by": "user_123"
  }
}
```

#### Request Schema

```typescript
interface CreateAgentRequest {
  node_label: string;              // Required: Agent identifier (e.g., "customer_support")
  system_prompt: string;           // Required: System instructions for the agent
  model: string;                   // Required: Model identifier (e.g., "claude-sonnet-4")
  tools: Tool[];                   // Required: Array of tool definitions
  metadata?: {                     // Optional: Additional metadata
    created_by?: string;
    [key: string]: any;
  };
}

interface Tool {
  name: string;                    // Required: Tool function name (snake_case)
  description: string;             // Required: What the tool does (used by LLM for code generation)
  config?: {                       // Optional: Credentials, URLs, DB connections, etc.
    [key: string]: any;            // Any config the tool needs (flexible!)
  };
}

// IMPORTANT: NO hardcoded tool types!
// Backend uses LLM to generate Python code based on description + config
// Examples of what you can put in config:
//   - Database: {db_connection, db_user, db_password}
//   - API: {api_url, api_key, headers}
//   - SMTP: {smtp_host, smtp_port, smtp_user, smtp_password}
//   - S3: {s3_bucket, s3_prefix, aws_access_key_id}
//   - Anything else the LLM needs to generate working code!
```

#### Response (Immediate)

```json
{
  "agent_id": "customer_support_a1b2c3d4",
  "status": "creating",
  "message": "Agent creation started. Tools are being built...",
  "estimated_time_seconds": 120,
  "progress": {
    "total_tools": 3,
    "completed_tools": 0,
    "current_task": "Initializing agent..."
  },
  "created_at": "2025-01-18T10:30:00Z"
}
```

#### Response Schema

```typescript
interface CreateAgentResponse {
  agent_id: string;                // Unique agent identifier
  status: "creating";              // Always "creating" on create
  message: string;                 // Human-readable status message
  estimated_time_seconds: number;  // Estimated completion time
  progress: AgentProgress;
  created_at: string;              // ISO 8601 timestamp
}

interface AgentProgress {
  total_tools: number;
  completed_tools: number;
  current_task: string;
}
```

#### Error Responses

**400 Bad Request**
```json
{
  "error": "Invalid request",
  "details": "node_label is required",
  "code": "VALIDATION_ERROR"
}
```

**409 Conflict**
```json
{
  "error": "Agent already exists",
  "details": "An agent with node_label 'customer_support' already exists",
  "code": "AGENT_EXISTS",
  "existing_agent_id": "customer_support_a1b2c3d4"
}
```

**500 Internal Server Error**
```json
{
  "error": "Internal server error",
  "details": "Failed to create agent",
  "code": "INTERNAL_ERROR"
}
```

---

### 2. Get Agent Status

**Endpoint:** `GET /api/v1/agent/status/{agent_id}`

**Purpose:** Poll agent creation progress and check if agent is ready for chat.

**Frontend Trigger:** Called every 2 seconds after agent creation until status is "ready" or "failed".

#### Request

```http
GET /api/v1/agent/status/customer_support_a1b2c3d4
```

#### Response (Creating)

```json
{
  "agent_id": "customer_support_a1b2c3d4",
  "status": "creating",
  "progress": {
    "total_tools": 3,
    "completed_tools": 2,
    "current_task": "Ingesting vector KB documents... (1500/2000 docs)"
  },
  "estimated_remaining_seconds": 45,
  "updated_at": "2025-01-18T10:31:30Z"
}
```

#### Response (Ready)

```json
{
  "agent_id": "customer_support_a1b2c3d4",
  "status": "ready",
  "progress": {
    "total_tools": 3,
    "completed_tools": 3,
    "current_task": "Agent ready"
  },
  "tools_built": [
    {
      "name": "search_knowledge_base",
      "status": "ready"
    },
    {
      "name": "calculator",
      "status": "ready"
    },
    {
      "name": "get_order_status",
      "status": "ready"
    }
  ],
  "created_at": "2025-01-18T10:30:00Z",
  "ready_at": "2025-01-18T10:32:15Z",
  "build_duration_seconds": 135
}
```

#### Response (Failed)

```json
{
  "agent_id": "customer_support_a1b2c3d4",
  "status": "failed",
  "error": "Failed to ingest vector KB",
  "error_details": "S3 bucket 's3://my-bucket/docs/' not found",
  "progress": {
    "total_tools": 3,
    "completed_tools": 2,
    "current_task": "Failed at tool: search_knowledge_base"
  },
  "failed_at": "2025-01-18T10:31:45Z"
}
```

#### Response Schema

```typescript
interface AgentStatusResponse {
  agent_id: string;
  status: "creating" | "ready" | "failed";
  progress: AgentProgress;
  estimated_remaining_seconds?: number;  // Only when creating
  tools_built?: ToolStatus[];            // Only when ready
  error?: string;                         // Only when failed
  error_details?: string;                 // Only when failed
  created_at: string;
  ready_at?: string;                      // Only when ready
  failed_at?: string;                     // Only when failed
  build_duration_seconds?: number;        // Only when ready
  updated_at: string;
}

interface ToolStatus {
  name: string;
  status: "creating" | "ready" | "failed";
  error?: string;
}
```

#### Error Responses

**404 Not Found**
```json
{
  "error": "Agent not found",
  "details": "No agent with id 'customer_support_a1b2c3d4'",
  "code": "AGENT_NOT_FOUND"
}
```

---

### 3. Chat with Agent

**Endpoint:** `POST /api/v1/chat`

**Purpose:** Send a message to an agent and get a response. Supports conversation memory via thread_id.

**Frontend Trigger:** User sends a message in the chat interface.

#### Request

```http
POST /api/v1/chat
Content-Type: application/json

{
  "agent_id": "customer_support_a1b2c3d4",
  "thread_id": "customer_support_a1b2c3d4_e5f6g7h8_1705593600",
  "message": "What's the status of my order #12345?",
  "memory_enabled": true
}
```

#### Request Schema

```typescript
interface ChatRequest {
  agent_id: string;        // Required: Which agent to use
  thread_id: string;       // Required: Conversation identifier (for memory)
  message: string;         // Required: User's message
  memory_enabled: boolean; // Required: Enable conversation history (default: true)
}
```

**Thread ID Format:**
```
{agent_id}_{uuid_8chars}_{unix_timestamp}

Example: customer_support_a1b2c3d4_e5f6g7h8_1705593600
```

**Frontend Generation (JavaScript):**
```javascript
const thread_id = `${agent_id}_${crypto.randomUUID().slice(0, 8)}_${Date.now()}`;
```

#### Response

```json
{
  "thread_id": "customer_support_a1b2c3d4_e5f6g7h8_1705593600",
  "response": "Let me check the status of order #12345 for you...\n\nYour order #12345 is currently in transit and expected to arrive on January 20th. The tracking number is 1Z999AA10123456784.",
  "message_count": 4,
  "tools_used": [
    {
      "name": "get_order_status",
      "input": {"order_id": "12345"},
      "result": "success"
    }
  ],
  "duration_ms": 2341,
  "timestamp": "2025-01-18T10:35:00Z"
}
```

#### Response Schema

```typescript
interface ChatResponse {
  thread_id: string;           // Same as request (for frontend to store)
  response: string;            // Agent's response message
  message_count: number;       // Total messages in this thread
  tools_used?: ToolExecution[]; // Tools called during this turn
  duration_ms: number;         // Response time
  timestamp: string;           // ISO 8601
}

interface ToolExecution {
  name: string;
  input: Record<string, any>;
  result: "success" | "error";
  error?: string;
}
```

#### Error Responses

**400 Bad Request - Agent Not Ready**
```json
{
  "error": "Agent not ready",
  "details": "Agent is still being created. Current status: creating",
  "code": "AGENT_NOT_READY",
  "agent_status": "creating",
  "retry_after_seconds": 45
}
```

**404 Not Found - Agent Not Found**
```json
{
  "error": "Agent not found",
  "details": "No agent with id 'invalid_agent_id'",
  "code": "AGENT_NOT_FOUND"
}
```

**500 Internal Server Error - Execution Failed**
```json
{
  "error": "Agent execution failed",
  "details": "Tool 'search_knowledge_base' returned error",
  "code": "EXECUTION_ERROR",
  "thread_id": "customer_support_a1b2c3d4_e5f6g7h8_1705593600"
}
```

---

### 4. Get Conversation History

**Endpoint:** `GET /api/v1/chat/history/{thread_id}`

**Purpose:** Retrieve full message history for a conversation thread.

**Frontend Trigger:** When user selects a past conversation from the history list.

#### Request

```http
GET /api/v1/chat/history/customer_support_a1b2c3d4_e5f6g7h8_1705593600
```

#### Query Parameters

- `limit` (optional, default: 100): Max messages to return
- `offset` (optional, default: 0): Pagination offset

#### Response

```json
{
  "thread_id": "customer_support_a1b2c3d4_e5f6g7h8_1705593600",
  "agent_id": "customer_support_a1b2c3d4",
  "status": "completed",
  "created_at": "2025-01-18T10:33:00Z",
  "last_message_at": "2025-01-18T10:35:00Z",
  "message_count": 4,
  "messages": [
    {
      "role": "user",
      "content": "Hello, I need help with my order.",
      "timestamp": "2025-01-18T10:33:00Z"
    },
    {
      "role": "assistant",
      "content": "Hello! I'd be happy to help you with your order. Could you please provide your order number?",
      "timestamp": "2025-01-18T10:33:05Z"
    },
    {
      "role": "user",
      "content": "What's the status of my order #12345?",
      "timestamp": "2025-01-18T10:34:00Z"
    },
    {
      "role": "assistant",
      "content": "Let me check the status of order #12345 for you...\n\nYour order #12345 is currently in transit and expected to arrive on January 20th.",
      "timestamp": "2025-01-18T10:35:00Z",
      "tools_used": ["get_order_status"]
    }
  ]
}
```

#### Response Schema

```typescript
interface ConversationHistory {
  thread_id: string;
  agent_id: string;
  status: "running" | "completed" | "failed";
  created_at: string;
  last_message_at: string;
  message_count: number;
  messages: Message[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tools_used?: string[];  // Only for assistant messages
}
```

---

### 5. List Conversations for Agent

**Endpoint:** `GET /api/v1/agent/{agent_id}/threads`

**Purpose:** Get all conversation threads for an agent (for "Past Conversations" list in UI).

**Frontend Trigger:** When user opens chat interface or clicks "Past Conversations".

#### Request

```http
GET /api/v1/agent/customer_support_a1b2c3d4/threads?limit=20&offset=0
```

#### Query Parameters

- `limit` (optional, default: 20): Max threads to return
- `offset` (optional, default: 0): Pagination offset
- `status` (optional): Filter by status ("running", "completed", "failed")

#### Response

```json
{
  "agent_id": "customer_support_a1b2c3d4",
  "total_threads": 45,
  "threads": [
    {
      "thread_id": "customer_support_a1b2c3d4_e5f6g7h8_1705593600",
      "status": "completed",
      "message_count": 4,
      "created_at": "2025-01-18T10:33:00Z",
      "last_message_at": "2025-01-18T10:35:00Z",
      "preview": "What's the status of my order #12345?"
    },
    {
      "thread_id": "customer_support_a1b2c3d4_abc123de_1705500000",
      "status": "completed",
      "message_count": 8,
      "created_at": "2025-01-17T14:20:00Z",
      "last_message_at": "2025-01-17T14:25:00Z",
      "preview": "I need to return an item"
    }
  ]
}
```

#### Response Schema

```typescript
interface ThreadListResponse {
  agent_id: string;
  total_threads: number;
  threads: ThreadSummary[];
}

interface ThreadSummary {
  thread_id: string;
  status: "running" | "completed" | "failed";
  message_count: number;
  created_at: string;
  last_message_at: string;
  preview: string;  // First user message (truncated to 100 chars)
}
```

---

### 6. Delete Thread

**Endpoint:** `DELETE /api/v1/chat/thread/{thread_id}`

**Purpose:** Delete a conversation thread and all its messages.

**Frontend Trigger:** User clicks "Delete" on a conversation in the history list.

#### Request

```http
DELETE /api/v1/chat/thread/customer_support_a1b2c3d4_e5f6g7h8_1705593600
```

#### Response

```json
{
  "thread_id": "customer_support_a1b2c3d4_e5f6g7h8_1705593600",
  "deleted": true,
  "message": "Thread and all messages deleted successfully"
}
```

---

## Data Models

### Complete Data Model Reference

```typescript
// ============================================================================
// AGENT MODELS
// ============================================================================

interface Agent {
  agent_id: string;                    // Format: {node_label}_{uuid}
  node_label: string;                  // User-defined label from canvas
  status: AgentStatus;
  system_prompt: string;
  tools: Tool[];
  metadata: Record<string, any>;
  created_at: string;
  ready_at?: string;
  failed_at?: string;
  build_duration_seconds?: number;
}

type AgentStatus = "creating" | "ready" | "failed";

interface Tool {
  name: string;
  description: string;
  type: ToolType;
  code?: string;                       // For python_code
  config?: Record<string, any>;        // For vector_kb, api
  status?: ToolStatus;
}

type ToolType = "vector_kb" | "python_code" | "api" | "web_search";
type ToolStatus = "creating" | "ready" | "failed";

// ============================================================================
// CHAT MODELS
// ============================================================================

interface Thread {
  thread_id: string;                   // Format: {agent_id}_{uuid}_{timestamp}
  agent_id: string;
  status: ThreadStatus;
  message_count: number;
  created_at: string;
  last_message_at: string;
}

type ThreadStatus = "running" | "completed" | "failed";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  tools_used?: string[];
}

// ============================================================================
// REQUEST/RESPONSE MODELS (see above sections)
// ============================================================================
```

---

## Thread ID Conventions

### Format

```
{agent_id}_{uuid_8chars}_{unix_timestamp}
```

### Components

1. **agent_id**: The agent being used (e.g., `customer_support_a1b2c3d4`)
2. **uuid_8chars**: First 8 characters of UUID v4 for uniqueness
3. **unix_timestamp**: Current Unix timestamp (milliseconds or seconds)

### Examples

```
customer_support_a1b2c3d4_e5f6g7h8_1705593600
research_agent_xyz789ab_abc123de_1705600000
```

### Why This Format?

1. **Human-readable**: Can see which agent and when created
2. **Unique**: UUID ensures no collisions
3. **Sortable**: Timestamp allows chronological ordering
4. **Queryable**: Can filter by agent_id prefix

### Frontend Implementation

**JavaScript:**
```javascript
function generateThreadId(agentId) {
  const uuid = crypto.randomUUID().slice(0, 8);
  const timestamp = Math.floor(Date.now() / 1000);  // Unix seconds
  return `${agentId}_${uuid}_${timestamp}`;
}

// Usage
const threadId = generateThreadId("customer_support_a1b2c3d4");
// Result: "customer_support_a1b2c3d4_e5f6g7h8_1705593600"
```

**TypeScript:**
```typescript
function generateThreadId(agentId: string): string {
  const uuid = crypto.randomUUID().substring(0, 8);
  const timestamp = Math.floor(Date.now() / 1000);
  return `${agentId}_${uuid}_${timestamp}`;
}
```

### When to Generate

- **New Chat Button**: Generate new thread_id
- **Continue Conversation**: Reuse existing thread_id
- **Memory Disabled**: Can reuse same thread_id (no history loaded)

---

## Error Handling

### Standard Error Response Format

All errors follow this structure:

```json
{
  "error": "Short error message",
  "details": "Detailed explanation of what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-18T10:35:00Z",
  "request_id": "req_abc123"
}
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful request |
| 201 | Created | Agent created successfully |
| 400 | Bad Request | Invalid input, validation error |
| 404 | Not Found | Agent or thread not found |
| 409 | Conflict | Agent already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Backend error |
| 503 | Service Unavailable | Backend overloaded |

### Error Codes

| Code | Description | Frontend Action |
|------|-------------|-----------------|
| `VALIDATION_ERROR` | Invalid request data | Show error message, highlight fields |
| `AGENT_NOT_FOUND` | Agent ID doesn't exist | Show "Agent not found" |
| `AGENT_NOT_READY` | Agent still creating | Show progress, retry after N seconds |
| `AGENT_EXISTS` | Duplicate agent_id | Prompt user to choose different name |
| `THREAD_NOT_FOUND` | Thread ID doesn't exist | Show "Conversation not found" |
| `EXECUTION_ERROR` | Agent execution failed | Show error, offer retry |
| `TOOL_ERROR` | Tool execution failed | Show which tool failed |
| `RATE_LIMIT` | Too many requests | Show "Please wait" with countdown |
| `INTERNAL_ERROR` | Backend error | Show generic error, log details |

### Retry Logic

**Frontend should implement exponential backoff for:**

1. **Agent Status Polling** (while creating):
   - Start: Every 2 seconds
   - After 1 min: Every 5 seconds
   - After 5 min: Every 10 seconds
   - Timeout: 15 minutes

2. **Failed Requests**:
   - 429 (Rate Limit): Wait for `retry_after_seconds` from response
   - 500/503: Retry with exponential backoff (2s, 4s, 8s)
   - Max retries: 3

---

## Complete Workflows

### Workflow 1: Create Agent and Start Chatting

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: User exports agent from canvas                    │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ POST /api/v1/agent/create                                    │
│ {                                                            │
│   "node_label": "customer_support",                         │
│   "system_prompt": "...",                                   │
│   "tools": [...]                                            │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND RESPONDS (immediate):                                │
│ {                                                            │
│   "agent_id": "customer_support_a1b2c3d4",                  │
│   "status": "creating",                                     │
│   "estimated_time_seconds": 120                             │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Show progress UI                                   │
│ "Creating agent... Estimated 2 minutes"                     │
│                                                              │
│ Start polling every 2s:                                     │
│ GET /api/v1/agent/status/customer_support_a1b2c3d4         │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND RESPONDS (polling):                                  │
│ {                                                            │
│   "status": "creating",                                     │
│   "progress": {                                             │
│     "completed_tools": 2,                                   │
│     "total_tools": 3,                                       │
│     "current_task": "Ingesting KB..."                       │
│   }                                                         │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Update progress                                    │
│ "Creating tools... 2/3 complete"                            │
│ "Ingesting KB..."                                           │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND RESPONDS (after tools complete):                     │
│ {                                                            │
│   "status": "ready",                                        │
│   "tools_built": [...],                                     │
│   "ready_at": "2025-01-18T10:32:15Z"                        │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Enable chat interface                              │
│ - Stop polling                                              │
│ - Show "✅ Ready to chat!"                                   │
│ - Enable message input                                      │
│ - Generate thread_id for new conversation                   │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ USER: Sends first message                                    │
│ "Hello, I need help with my order"                          │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Generate thread_id                                 │
│ thread_id = generateThreadId(agent_id)                      │
│ // "customer_support_a1b2c3d4_e5f6_1705593600"             │
│                                                              │
│ POST /api/v1/chat                                           │
│ {                                                            │
│   "agent_id": "customer_support_a1b2c3d4",                  │
│   "thread_id": "customer_support_a1b2c3d4_e5f6_1705593600", │
│   "message": "Hello, I need help with my order",            │
│   "memory_enabled": true                                    │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND RESPONDS:                                            │
│ {                                                            │
│   "thread_id": "customer_support_a1b2c3d4_e5f6_1705593600", │
│   "response": "Hello! I'd be happy to help...",             │
│   "message_count": 2                                        │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Display response                                   │
│ - Store thread_id for this conversation                     │
│ - Show assistant message                                    │
│ - User can continue chatting                                │
└──────────────────────────────────────────────────────────────┘
```

### Workflow 2: Continue Existing Conversation (Memory)

```
┌──────────────────────────────────────────────────────────────┐
│ USER: Opens past conversation                                │
│ Clicks on thread in "Past Conversations" list               │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Load conversation history                          │
│ GET /api/v1/chat/history/customer_support_a1b2c3d4_e5f6_... │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND RESPONDS:                                            │
│ {                                                            │
│   "thread_id": "customer_support_a1b2c3d4_e5f6_1705593600", │
│   "messages": [                                             │
│     {"role": "user", "content": "Hello..."},                │
│     {"role": "assistant", "content": "Hi..."},              │
│     ...                                                     │
│   ]                                                         │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Display conversation                               │
│ - Show all previous messages                                │
│ - Enable new message input                                  │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ USER: Sends new message                                      │
│ "What's the order status now?"                              │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Use SAME thread_id                                 │
│ POST /api/v1/chat                                           │
│ {                                                            │
│   "agent_id": "customer_support_a1b2c3d4",                  │
│   "thread_id": "customer_support_a1b2c3d4_e5f6_1705593600", │
│   "message": "What's the order status now?",                │
│   "memory_enabled": true  ← CRITICAL for memory            │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: Loads previous messages from thread                 │
│ - Finds existing ExecutionThread with this thread_id        │
│ - Merges new message with previous messages                 │
│ - Agent sees FULL conversation history                      │
│ - Responds with context                                     │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND RESPONDS:                                            │
│ {                                                            │
│   "thread_id": "customer_support_a1b2c3d4_e5f6_1705593600", │
│   "response": "Your order #12345 is now delivered!",        │
│   "message_count": 6  ← Includes all previous messages     │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
```

### Workflow 3: Memory Disabled (Stateless)

```
┌──────────────────────────────────────────────────────────────┐
│ USER: Toggles "Memory" checkbox OFF                          │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND: Set memory_enabled = false                         │
│ POST /api/v1/chat                                           │
│ {                                                            │
│   "agent_id": "customer_support_a1b2c3d4",                  │
│   "thread_id": "customer_support_a1b2c3d4_e5f6_1705593600", │
│   "message": "Hello",                                       │
│   "memory_enabled": false  ← Memory disabled                │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND: Does NOT load previous messages                     │
│ - Ignores existing thread history                           │
│ - Treats as fresh conversation                              │
│ - Agent only sees this single message                       │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND RESPONDS:                                            │
│ {                                                            │
│   "thread_id": "customer_support_a1b2c3d4_e5f6_1705593600", │
│   "response": "Hello! How can I help?",                     │
│   "message_count": 2  ← Only this exchange                  │
│ }                                                            │
└──────────────────────────────────────────────────────────────┘
```

---

## Frontend Implementation Guide

### State Management (React Example)

```typescript
// Store/Context structure
interface AgentState {
  agentId: string | null;
  status: "idle" | "creating" | "ready" | "failed";
  progress: {
    totalTools: number;
    completedTools: number;
    currentTask: string;
  };
  error: string | null;
}

interface ChatState {
  threadId: string | null;
  messages: Message[];
  memoryEnabled: boolean;
  isLoading: boolean;
}
```

### Key Frontend Functions

```typescript
// 1. Export agent from canvas
async function exportAgent(
  nodeLabel: string,
  systemPrompt: string,
  tools: Tool[]
): Promise<string> {
  const response = await fetch('/api/v1/agent/create', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({node_label: nodeLabel, system_prompt: systemPrompt, tools})
  });

  const data = await response.json();

  // Start polling
  startStatusPolling(data.agent_id);

  return data.agent_id;
}

// 2. Poll agent status
function startStatusPolling(agentId: string) {
  const interval = setInterval(async () => {
    const response = await fetch(`/api/v1/agent/status/${agentId}`);
    const data = await response.json();

    updateProgress(data.progress);

    if (data.status === 'ready') {
      clearInterval(interval);
      enableChatInterface(agentId);
    } else if (data.status === 'failed') {
      clearInterval(interval);
      showError(data.error);
    }
  }, 2000);
}

// 3. Send chat message
async function sendMessage(
  agentId: string,
  threadId: string,
  message: string,
  memoryEnabled: boolean
): Promise<ChatResponse> {
  const response = await fetch('/api/v1/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      agent_id: agentId,
      thread_id: threadId,
      message: message,
      memory_enabled: memoryEnabled
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details);
  }

  return await response.json();
}

// 4. Generate thread ID
function generateThreadId(agentId: string): string {
  const uuid = crypto.randomUUID().substring(0, 8);
  const timestamp = Math.floor(Date.now() / 1000);
  return `${agentId}_${uuid}_${timestamp}`;
}

// 5. Load conversation history
async function loadConversationHistory(threadId: string): Promise<Message[]> {
  const response = await fetch(`/api/v1/chat/history/${threadId}`);
  const data = await response.json();
  return data.messages;
}

// 6. List past conversations
async function listConversations(agentId: string): Promise<ThreadSummary[]> {
  const response = await fetch(`/api/v1/agent/${agentId}/threads?limit=20`);
  const data = await response.json();
  return data.threads;
}
```

### UI Components Checklist

- [ ] **Agent Creation Panel**
  - [ ] Progress bar showing tool creation
  - [ ] Current task display
  - [ ] Estimated time remaining
  - [ ] Cancel button (optional)

- [ ] **Chat Interface**
  - [ ] Message input field
  - [ ] Send button (disabled until agent ready)
  - [ ] Message history display
  - [ ] Memory toggle checkbox
  - [ ] "New Chat" button (generates new thread_id)

- [ ] **Past Conversations Sidebar**
  - [ ] List of previous threads
  - [ ] Conversation preview
  - [ ] Timestamp
  - [ ] Delete button
  - [ ] Click to load conversation

- [ ] **Status Indicators**
  - [ ] Agent status badge (Creating/Ready/Failed)
  - [ ] Loading spinner during chat
  - [ ] Typing indicator
  - [ ] Error messages

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-18 | Initial Sprint 1 API specification |

---

## Support

For questions or issues:
- **Backend**: GitHub issues in Neoagents repo
- **Frontend**: GitHub issues in arrows.app fork
- **Integration**: Reference this document as the contract

---

**End of API Specification**
