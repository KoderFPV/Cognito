# AI Agents Architecture

This document describes the LangGraph-based AI agents architecture for the Cognito e-commerce platform.

## Architecture Overview

![LangGraph Architecture](graph.png)

The Cognito platform uses LangGraph to implement an agentic architecture where autonomous AI agents handle different aspects of the e-commerce workflow. The system is built around a central router that directs user requests to specialized agents.

## Core Components

### Router Agent

The **router** is the central orchestration component that:
- Receives incoming user requests
- Analyzes intent and context
- Routes requests to appropriate specialized agents
- Manages conversation flow between agents

### Specialized Agents

Each agent is responsible for a specific domain of the e-commerce system:

#### 1. Registration Agent
**Node**: `registration` → `registration_tools`

Handles user account creation:
- Collects user information (email, password, personal details)
- Validates registration data
- Creates new user accounts
- Sends verification emails

**Tools**:
- User data validation
- Email verification
- Password hashing
- Account creation

#### 2. Activation Agent
**Node**: `activation` → `activation_tools`

Manages account activation:
- Verifies activation tokens
- Activates user accounts
- Handles activation errors and retries

**Tools**:
- Token verification
- Account status updates
- Activation email resending

#### 3. Login Agent
**Node**: `login` → `login_tools`

Handles user authentication:
- Validates credentials
- Creates user sessions
- Manages authentication errors

**Tools**:
- Credential validation
- Session management
- Password reset initiation

#### 4. Product Agent
**Node**: `product` → `product_tools`

Provides detailed product information:
- Retrieves product details
- Answers product-specific questions
- Provides recommendations based on product features

**Tools**:
- Product database queries
- Vector search for product features
- Product comparison
- Specification retrieval

#### 5. Products Agent (Catalog)
**Node**: `products` → `products_tools`

Manages product catalog browsing:
- Product search and filtering
- Category browsing
- Product recommendations
- Price comparison

**Tools**:
- Catalog search
- Faceted filtering
- Recommendation engine
- Price queries

#### 6. Cart Agent
**Node**: `cart` → `cart_tools`

Manages shopping cart operations:
- Add/remove products
- Update quantities
- Calculate totals
- Apply discounts

**Tools**:
- Cart state management
- Price calculations
- Discount validation
- Inventory checks

#### 7. Checkout Agent
**Node**: `checkout` → `checkout_tools`

Handles the checkout process:
- Collects shipping information
- Processes payment
- Creates orders
- Sends order confirmations

**Tools**:
- Shipping address validation
- Payment gateway integration
- Order creation
- Email notifications

#### 8. Info Agent
**Node**: `info` → `info_tools`

Provides general information:
- Store policies (shipping, returns, privacy)
- FAQ responses
- Store information
- Help and support

**Tools**:
- Knowledge base queries
- Policy document retrieval
- Contact information

#### 9. Chat Agent
**Node**: `chat`

General conversational agent:
- Natural language understanding
- Context-aware responses
- Delegates to specialized agents when needed

## Agent Workflow

### 1. Request Flow

```
User Input → Router → Specialized Agent → Tools → Response → __end__
```

### 2. Router Decision Making

The router analyzes user intent using:
- Natural language understanding
- Context from conversation history
- Current application state (logged in, cart items, etc.)
- User preferences and behavior

### 3. Agent Collaboration

Agents can work together in sequence:
- User searches for products → **products agent**
- User asks about specific product → **product agent**
- User adds to cart → **cart agent**
- User checks out → **checkout agent**

### 4. State Management

The system maintains shared state across agents:
- User session data
- Shopping cart contents
- Conversation history
- User preferences

## Tools Architecture

Each agent has access to a specific set of tools (functions) that interact with:
- **Database**: MongoDB for transactional data
- **Vector Store**: Weaviate for semantic search
- **External APIs**: Payment gateways, shipping providers
- **Internal Services**: Authentication, email, inventory
