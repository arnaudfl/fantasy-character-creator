# Architectural Diagrams for Fantasy Character Creator

## 1. High-Level System Architecture

```mermaid
graph TD
    A[User Browser] -->|HTTP/HTTPS| B[Frontend: React TypeScript]
    B --> |API Calls| C[Backend: Express.js Node.js]
    C --> |ORM Queries| D[Database: PostgreSQL]
    C --> |AI Generation| E[Hugging Face API]
    C --> |Caching| F[Redis Cache]
    D --> |Authentication| G[JWT Token Service]
    E --> |Avatar Generation| H[AI Image Storage]
```

## 2. Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant J as JWT Service

    U->>F: Login Credentials
    F->>B: Send Credentials
    B->>D: Validate User
    D-->>B: User Validation
    B->>J: Generate Access Token
    J-->>B: JWT Token
    B-->>F: Return Token
    F-->>U: Authenticated Access
```

## 3. Character Creation Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant AI as Hugging Face API
    participant D as Database

    U->>F: Start Character Creation
    F->>B: Submit Character Details
    B->>AI: Request Avatar Generation
    AI-->>B: Generated Avatar
    B->>D: Save Character Data
    D-->>B: Save Confirmation
    B-->>F: Character Creation Success
    F-->>U: Display New Character
```

## 4. Data Model Relationships

```mermaid
erDiagram
    USER ||--|| CHARACTER : creates
    CHARACTER ||--|| AVATAR : has
    USER {
        int id PK
        string username
        string email
        string role
    }
    CHARACTER {
        int id PK
        string name
        string race
        string class
        json attributes
    }
    AVATAR {
        int id PK
        int character_id FK
        string image_url
        string generation_prompt
    }
```

## 5. Deployment Architecture

```mermaid
graph TD
    subgraph Cloud Provider
        A[Load Balancer]
        A --> B1[Backend Instance 1]
        A --> B2[Backend Instance 2]
        B1 --> D1[Database Replica 1]
        B2 --> D2[Database Replica 2]
        B1 --> C[Redis Cache Cluster]
        B2 --> C
    end
    
    U[Users] -->|HTTPS| A
    AI[Hugging Face API] -->|External API| B1
```

## 6. Technology Stack Overview

| Layer | Technology | Key Responsibilities |
|-------|------------|---------------------|
| Frontend | React TypeScript | User Interface, State Management |
| Backend | Node.js, Express.js | Business Logic, API Endpoints |
| Database | PostgreSQL, Prisma ORM | Data Persistence, Querying |
| Caching | Redis | Performance Optimization |
| Authentication | JWT, Passport.js | Secure User Access |
| AI Integration | Hugging Face API | Dynamic Avatar Generation |

## 7. Security Architecture

```mermaid
graph TD
    A[Incoming Request] --> B{Rate Limiter}
    B --> |Allowed| C{CORS Validation}
    C --> |Passed| D{JWT Verification}
    D --> |Valid Token| E{Role-Based Access Control}
    E --> |Authorized| F[Process Request]
    
    B --> |Blocked| G[Reject Request]
    C --> |Rejected| G
    D --> |Invalid Token| G
    E --> |Unauthorized| G
```

## Architectural Principles

1. Modularity
2. Scalability
3. Security
4. Performance
5. Maintainability

---

**Note:** These architectural diagrams represent the current state of the Fantasy Character Creator project, showcasing its technical design, data flow, and architectural decisions.
