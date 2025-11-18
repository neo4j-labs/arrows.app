# SKETCH2AGENT Feature Documentation

## Overview

SKETCH2AGENT is a powerful feature added to arrows.app that enables users to visually design AI agent architectures using the graph canvas, export them to a backend API for deployment, and interact with the agents through an integrated chat interface.

**Key Capabilities:**
- Visual agent architecture design using nodes and relationships
- Export agent definitions with connected tools to a backend API
- Real-time progress monitoring during agent creation
- Built-in chat interface to interact with deployed agents
- Conversation memory support for context-aware interactions

---

## Architecture

### Component Structure

```
ExportModal
└── ExportAgentFrameworkPanel (Main component)
    ├── Agent Detection & Selection
    ├── API Integration (Export & Status Polling)
    ├── Progress UI
    └── ChatInterface (Modal)
        ├── Message History
        ├── Thread Management
        └── Memory Toggle
```

### Data Model

**Graph Structure:**
```
Agent Node (Caption: "Calculator Agent")
  |
  └─[HAS_TOOL]──> Tool Node 1 (Caption: "Add Tool")
  └─[HAS_TOOL]──> Tool Node 2 (Caption: "Multiply Tool")
  └─[HAS_TOOL]──> Tool Node 3 (Caption: "Divide Tool")
```

**Node Properties:**
- **Agent Node:**
  - `caption`: Agent name/identifier
  - `system_prompt`: Agent's system instructions

- **Tool Node:**
  - `caption`: Tool name
  - `description`: Tool functionality description
  - Custom properties: Additional configuration (e.g., API keys, endpoints)

---

## User Workflow

### 1. Design Agent Architecture
1. Open arrows.app
2. Create an agent node (any node that has outgoing HAS_TOOL relationships)
3. Add node properties:
   - Caption: Agent name (e.g., "Calculator Agent")
   - Property: `system_prompt` = "You are a helpful calculator agent..."
4. Create tool nodes connected via HAS_TOOL relationships
5. Add tool properties:
   - Caption: Tool name (e.g., "Add Tool")
   - Property: `description` = "Adds two numbers together"
   - Any other custom config properties

### 2. Export Agent
1. Click the **Export** button (top toolbar)
2. Navigate to the **"Agent Framework"** tab
3. The panel auto-detects agent nodes (nodes with HAS_TOOL relationships)
4. Select an agent from the dropdown
5. Verify the API URL (defaults to `http://localhost:8000`)
6. Click **"Export Agent"**
7. Monitor real-time progress as tools are being built
8. Wait for success message

### 3. Chat with Agent
1. After successful export, click **"Start Chat"**
2. ChatInterface modal opens
3. Toggle "Enable conversation memory" as needed
4. Type messages and interact with the agent
5. View execution times for each response
6. Click "New Chat" to start a fresh conversation thread
7. Close the modal when done

---

## Technical Implementation

### Files Modified/Created

#### 1. **ExportAgentFrameworkPanel.jsx** (Main Component)
**Location:** `apps/arrows-ts/src/components/ExportAgentFrameworkPanel.jsx`

**Key Features:**
- **Agent Detection:** Automatically finds nodes with outgoing HAS_TOOL relationships
- **Data Transformation:** Converts graph nodes to API-compatible format
- **URL Sanitization:** Ensures agent_id and tool names are URL-safe (replaces spaces/special chars)
- **Status Polling:** Checks agent creation progress every 2 seconds
- **State Management:** Handles loading, success, error, and progress states

**Critical Functions:**

```javascript
// Detects which nodes are agents
detectAgentNodes = () => {
  const { graph } = this.props;
  const hasToolRelationships = graph.relationships.filter(
    rel => rel.type === 'HAS_TOOL'
  );
  const agentNodeIds = [...new Set(hasToolRelationships.map(rel => rel.fromId))];
  return agentNodeIds.map(id => graph.nodes.find(n => n.id === id)).filter(Boolean);
};

// Transforms graph data to API format
transformToAPIFormat = (agentNode, toolNodes) => {
  const sanitizedLabel = (agentNode.caption || `agent_${agentNode.id}`)
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '_');

  return {
    node_label: sanitizedLabel,
    system_prompt: agentNode.properties?.system_prompt || 'You are a helpful agent.',
    tools: toolNodes.map(toolNode => {
      const { description, ...config } = toolNode.properties || {};
      const sanitizedToolName = (toolNode.caption || `tool_${toolNode.id}`)
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '_');
      return {
        name: sanitizedToolName,
        description: description || 'A tool for the agent.',
        config: Object.keys(config).length > 0 ? config : undefined
      };
    }),
    metadata: {
      created_by: 'arrows_user',
      created_from: 'arrows.app'
    }
  };
};

// Polls backend for agent creation status
pollAgentStatus = async (agentId) => {
  const pollInterval = setInterval(async () => {
    try {
      const response = await fetch(`${this.state.apiUrl}/api/v1/agent/status/${agentId}`);
      const result = await response.json();

      // Update progress
      this.setState({ progress: result });

      // Check if complete
      if (result.status === 'ready') {
        clearInterval(pollInterval);
        this.setState({
          polling: false,
          success: true,
          agentId: agentId
        });
      }
    } catch (error) {
      clearInterval(pollInterval);
      this.setState({ polling: false, error: error.message });
    }
  }, 2000); // Poll every 2 seconds
};
```

#### 2. **ChatInterface.jsx** (New Component)
**Location:** `apps/arrows-ts/src/components/ChatInterface.jsx`

**Key Features:**
- **Thread Management:** Generates unique thread IDs in format `{agent_id}_{uuid}_{timestamp}`
- **Message History:** Maintains conversation state with auto-scroll
- **Memory Toggle:** Enables/disables conversation context retention
- **Execution Metrics:** Displays response time for each message
- **User Experience:** Full-width input, keyboard shortcuts (Enter to send, Shift+Enter for newline)

**Critical Functions:**

```javascript
// Generates unique thread ID
generateThreadId = (agentId) => {
  const uuid = crypto.randomUUID().substring(0, 8);
  const timestamp = Math.floor(Date.now() / 1000);
  return `${agentId}_${uuid}_${timestamp}`;
};

// Sends message to chat API
handleSendMessage = async () => {
  const { message, threadId, memoryEnabled, messages } = this.state;
  const { agentId, apiUrl } = this.props;

  // Add user message to UI
  const userMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };

  this.setState({
    messages: [...messages, userMessage],
    message: '',
    loading: true
  });

  // Call chat API
  const response = await fetch(`${apiUrl}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: agentId,
      thread_id: threadId,
      message: message,
      memory_enabled: memoryEnabled
    })
  });

  const result = await response.json();

  // Add assistant response to UI
  const assistantMessage = {
    role: 'assistant',
    content: result.message.content,
    timestamp: result.message.timestamp,
    execution_time_ms: result.execution_time_ms
  };

  this.setState({
    messages: [...this.state.messages, assistantMessage],
    loading: false
  });
};
```

#### 3. **ExportModal.jsx** (Modified)
**Location:** `apps/arrows-ts/src/components/ExportModal.jsx`

**Changes:** Added new "Agent Framework" tab to existing export modal

```javascript
{
  menuItem: 'Agent Framework',
  render: () => (
    <Tab.Pane attached={false}>
      <ExportAgentFrameworkPanel
        graph={this.props.graph}
        diagramName={this.props.diagramName}
      />
    </Tab.Pane>
  ),
}
```

---

## API Integration

### Backend Endpoints

Based on `sketch2agent-api-spec.md`, the frontend integrates with three endpoints:

#### 1. **POST /api/v1/agent/create**

**Request:**
```json
{
  "node_label": "Calculator_agent_abc123",
  "system_prompt": "You are a helpful calculator agent...",
  "tools": [
    {
      "name": "add_tool",
      "description": "Adds two numbers together",
      "config": {
        "api_key": "optional_config_value"
      }
    }
  ],
  "metadata": {
    "created_by": "arrows_user",
    "created_from": "arrows.app"
  }
}
```

**Response:**
```json
{
  "status": "accepted",
  "agent_id": "Calculator_agent_abc123",
  "message": "Agent creation initiated. Use the agent_id to check status.",
  "status_endpoint": "/api/v1/agent/status/Calculator_agent_abc123"
}
```

#### 2. **GET /api/v1/agent/status/{agent_id}**

**Response (In Progress):**
```json
{
  "agent_id": "Calculator_agent_abc123",
  "status": "building",
  "tools_status": {
    "add_tool": "building",
    "multiply_tool": "ready",
    "divide_tool": "pending"
  },
  "message": "Agent is being built. Tools: 1/3 ready."
}
```

**Response (Ready):**
```json
{
  "agent_id": "Calculator_agent_abc123",
  "status": "ready",
  "tools_status": {
    "add_tool": "ready",
    "multiply_tool": "ready",
    "divide_tool": "ready"
  },
  "message": "Agent is ready to use!"
}
```

#### 3. **POST /api/v1/chat**

**Request:**
```json
{
  "agent_id": "Calculator_agent_abc123",
  "thread_id": "Calculator_agent_abc123_f4a8b2e1_1699564821",
  "message": "Add 5 and 3",
  "memory_enabled": true
}
```

**Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "The sum of 5 and 3 is 8.",
    "timestamp": "2024-11-18T10:30:00Z"
  },
  "thread_id": "Calculator_agent_abc123_f4a8b2e1_1699564821",
  "execution_time_ms": 1250
}
```

---

## Setup and Running

### Prerequisites
- Node.js and npm installed
- Nx CLI (comes with the monorepo)
- Backend API running on `http://localhost:8000` (or configure custom URL)

### Starting the Frontend

```bash
# Navigate to project root
cd arrows.app

# Start the development server
npx nx serve arrows-ts

# The application will be available at:
# http://localhost:4200
```

### Backend Configuration

The API URL can be configured in the ExportAgentFrameworkPanel UI:
- Default: `http://localhost:8000`
- Can be changed via the input field before exporting

---

## Bug Fixes and Troubleshooting

### Critical Bugs Fixed During Development

#### 1. **URL-Safe Agent ID Generation**
**Problem:** Agent captions with spaces (e.g., "Calculator Agent") created invalid URLs
```
/api/v1/agent/status/Calculator Agent_abc123  ❌ (contains space)
```

**Solution:** Added sanitization to replace spaces and special characters
```javascript
const sanitizedLabel = (agentNode.caption || `agent_${agentNode.id}`)
  .replace(/\s+/g, '_')
  .replace(/[^a-zA-Z0-9_]/g, '_');
// Result: Calculator_Agent_abc123 ✅
```

**Files:** `ExportAgentFrameworkPanel.jsx:84-86`

#### 2. **Model Field Removal**
**Problem:** Frontend was sending `model: "claude-sonnet-4"` but backend wanted to use its own default

**Solution:** Removed model field from API request payload

**Files:** `ExportAgentFrameworkPanel.jsx:transformToAPIFormat()`

#### 3. **Page Refresh Bug (Critical)**
**Problem:** Clicking "Export Agent" appeared to refresh the page, losing all UI state

**Initial Diagnosis:** Thought it was HTML form submission behavior

**Attempts Made:**
1. Added `type="button"` to Export button
2. Added `type="button"` to Start Chat button
3. Added form `onSubmit` preventDefault
4. Added comprehensive debug logging

**Root Cause Found:** NOT a page refresh! It was a JavaScript crash due to missing variable in state destructuring

**Console Evidence:**
```
🟢 ExportAgentFrameworkPanel MOUNTED
🔴 ExportAgentFrameworkPanel UNMOUNTING
🟢 ExportAgentFrameworkPanel MOUNTED      ← Component crash/remount
🔥 exportToAgentFramework called
ExportAgentFrameworkPanel.jsx:479 Uncaught ReferenceError: agentId is not defined
🔴 ExportAgentFrameworkPanel UNMOUNTING
```

**The Bug:**
```javascript
// Line 479: Using agentId in render
{success && agentId && (
  <ChatInterface agentId={agentId} ... />
)}

// Line 257-268: agentId NOT destructured from state ❌
const {
  selectedAgentId,
  loading,
  polling,
  success,
  error,
  response,
  progress,
  apiUrl  // agentId was MISSING!
} = this.state;
```

**Solution:**
```javascript
const {
  selectedAgentId,
  loading,
  polling,
  success,
  error,
  response,
  progress,
  apiUrl,
  agentId  // ✅ FIXED: Added missing agentId
} = this.state;
```

**Files:** `ExportAgentFrameworkPanel.jsx:268`

#### 4. **Agent Avatar Not Rendering**
**Problem:** Agent messages showed no avatar image

**Cause:** Using non-existent image URL
```javascript
src='https://react.semantic-ui.com/images/avatar/small/bot.png' // ❌ 404
```

**Solution:** Changed to valid Semantic UI avatar
```javascript
src='https://react.semantic-ui.com/images/avatar/small/elliot.jpg' // ✅
```

**Files:** `ChatInterface.jsx:178`

#### 5. **Chat Input Width Too Narrow**
**Problem:** Message input box was side-by-side with Send button, wasting space

**Solution:** Restructured to stack vertically with full-width components
```javascript
// Before: Form.Group with TextArea + Button side-by-side
<Form.Group>
  <Form.TextArea style={{ flex: 1 }} />
  <Button style={{ alignSelf: 'flex-end' }} />
</Form.Group>

// After: Full-width TextArea stacked above full-width Button
<Form.TextArea style={{ width: '100%' }} />
<Button fluid />
```

**Files:** `ChatInterface.jsx:218-239`

---

## Common Issues and Solutions

### Issue: "No agent nodes detected"
**Cause:** No nodes have outgoing HAS_TOOL relationships
**Solution:** Create at least one relationship from an agent node to a tool node with type "HAS_TOOL"

### Issue: "Failed to create agent" error
**Cause:** Backend API not running or wrong URL
**Solution:**
1. Check backend is running on `http://localhost:8000`
2. Verify API URL in the panel
3. Check browser console for CORS errors

### Issue: Status polling never completes
**Cause:** Backend agent creation failed or stuck
**Solution:** Check backend logs for errors in tool building process

### Issue: Chat messages don't send
**Cause:** Agent not in "ready" status
**Solution:** Wait for all tools to be "ready" before opening chat interface

---

## Data Flow Diagram

```
User Draws Graph
      ↓
[Agent Node] ─HAS_TOOL→ [Tool Node 1]
             ─HAS_TOOL→ [Tool Node 2]
      ↓
User Clicks "Export Agent"
      ↓
detectAgentNodes() → Finds nodes with HAS_TOOL relationships
      ↓
transformToAPIFormat() → Converts to API JSON
      ↓
POST /api/v1/agent/create
      ↓
Backend Returns: { status: "accepted", agent_id: "..." }
      ↓
pollAgentStatus() → GET /api/v1/agent/status/{agent_id} (every 2s)
      ↓
Progress UI Updates: "Building tools: 1/3 ready..."
      ↓
Backend Returns: { status: "ready" }
      ↓
"Start Chat" Button Appears
      ↓
User Clicks "Start Chat"
      ↓
ChatInterface Opens
      ↓
User Types Message → POST /api/v1/chat
      ↓
Backend Returns: { message: { content: "..." }, execution_time_ms: 1250 }
      ↓
Message Displayed in Chat History
```

---

## State Management

### ExportAgentFrameworkPanel State

```javascript
state = {
  selectedAgentId: null,      // Currently selected agent node ID
  loading: false,             // True during API call
  polling: false,             // True during status polling
  success: false,             // True when agent is ready
  error: null,                // Error message if failed
  response: null,             // API response data
  progress: null,             // Status polling data
  apiUrl: 'http://localhost:8000',  // Backend API URL
  chatOpen: false,            // Chat modal visibility
  agentId: null              // Created agent ID (for chat)
};
```

### ChatInterface State

```javascript
state = {
  message: '',               // Current input message
  messages: [],              // Chat history [{ role, content, timestamp }]
  loading: false,            // True during API call
  error: null,               // Error message if failed
  threadId: '...',          // Unique conversation thread ID
  memoryEnabled: true        // Whether to use conversation memory
};
```

---

## Future Enhancements

### Potential Improvements
1. **Agent Editing:** Allow updating existing agents without recreating
2. **Tool Library:** Pre-built tool templates users can drag-and-drop
3. **Multi-Agent Workflows:** Support agent-to-agent communication
4. **Version Control:** Track agent versions and rollback capability
5. **Analytics Dashboard:** Monitor agent usage, response times, error rates
6. **Custom Avatars:** Let users upload custom agent avatars
7. **Export History:** List of previously exported agents
8. **Bulk Export:** Export multiple agents at once
9. **Agent Testing:** Built-in test suite before deployment
10. **Advanced Memory:** Configure memory persistence (Redis, DB, etc.)

### Backend Improvements
1. **WebSocket Support:** Real-time status updates instead of polling
2. **Streaming Responses:** Stream agent responses token-by-token
3. **Tool Marketplace:** Share and discover community-built tools
4. **Agent Templates:** Pre-configured agent architectures
5. **Cost Tracking:** Monitor API usage and costs per agent

---

## Testing Checklist

### Manual Testing Steps

- [ ] **Agent Detection**
  - [ ] Create agent node with HAS_TOOL relationships
  - [ ] Verify it appears in dropdown
  - [ ] Create node without HAS_TOOL, verify it doesn't appear

- [ ] **Export Flow**
  - [ ] Select agent from dropdown
  - [ ] Click "Export Agent"
  - [ ] Verify loading state appears
  - [ ] Verify progress updates every 2 seconds
  - [ ] Verify success message when ready
  - [ ] Check "Start Chat" button appears

- [ ] **Chat Interface**
  - [ ] Click "Start Chat"
  - [ ] Verify modal opens
  - [ ] Type message and press Enter
  - [ ] Verify message appears in history
  - [ ] Verify agent response appears
  - [ ] Verify execution time displays
  - [ ] Toggle memory on/off
  - [ ] Click "New Chat"
  - [ ] Verify new thread ID generated
  - [ ] Test Shift+Enter for multiline input

- [ ] **Error Handling**
  - [ ] Stop backend, verify error message
  - [ ] Use invalid API URL, verify error
  - [ ] Send empty message, verify Send button disabled

- [ ] **Edge Cases**
  - [ ] Agent name with spaces → verify URL sanitization
  - [ ] Tool name with special chars → verify sanitization
  - [ ] No system_prompt property → verify default used
  - [ ] No tool description → verify default used
  - [ ] Close chat modal mid-conversation → verify state preserved

---

## Code Style and Conventions

### Component Structure
- React class components (not hooks)
- Redux for global state (graphs, diagrams)
- Local state for UI-specific data (loading, errors)
- Semantic UI React for all UI components

### Naming Conventions
- **Components:** PascalCase (e.g., `ExportAgentFrameworkPanel`)
- **Functions:** camelCase (e.g., `detectAgentNodes`)
- **State variables:** camelCase (e.g., `selectedAgentId`)
- **Constants:** UPPER_SNAKE_CASE (if any)

### Event Handlers
```javascript
// Always prevent default for buttons in forms
<Button type="button" onClick={this.handleClick} />

// Always prevent default in form submission
<Form onSubmit={(e) => e.preventDefault()}>
```

### Error Handling
```javascript
try {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  // Process data
} catch (error) {
  console.error('Descriptive error:', error);
  this.setState({ error: error.message });
}
```

---

## Git Commits History

Key commits in chronological order:

1. **Initial Implementation** - Sprint 1: Agent + Tools export functionality
2. **Fix: URL-safe agent_id generation** - Sanitize spaces and special chars
3. **Fix: Remove model field** - Let backend use default model
4. **Debug: Add console logging** - Diagnose page refresh issue
5. **Fix: Comprehensive form submission prevention** - Multiple button type fixes
6. **Fix: Add missing agentId to state destructuring** - CRITICAL bug fix
7. **Fix: Agent avatar rendering and widen chat message input** - UI improvements

---

## Acknowledgments

This feature was developed as an integration between:
- **Frontend:** arrows.app (Neo4j Labs) - Graph visualization canvas
- **Backend:** SKETCH2AGENT API - Agent deployment and runtime

**Key Technologies:**
- React 18
- Redux with redux-thunk
- Semantic UI React
- Nx monorepo
- Vite build system

---

## License

This feature follows the same license as the arrows.app project (check root LICENSE file).

---

## Contact and Support

For issues or questions:
1. Check this documentation first
2. Review the API spec: `sketch2agent-api-spec.md`
3. Check browser console for error messages
4. Verify backend logs for API errors

**Happy Agent Building!** 🚀
