# G1: CRUD Data Flow Analysis - Booking System Phase 6

## 📁 Repository Structure
```
BookingSystem/
└── Phase6/
    └── G1_CRUD_DataFlow.md
```

## 🔍 Verification Methodology
- **Browser Developer Tools**: Network tab to capture actual HTTP requests/responses
- **Code Analysis**: Examined `form.js` and `resources.js` for endpoint patterns
- **Database**: PostgreSQL via Adminer at http://localhost:8080

## 1️⃣ CREATE Operation

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Frontend as Frontend (form.js)
    participant Backend as Backend (POST /api/resources)
    participant Service as Service Layer
    participant DB as PostgreSQL

    User->>Frontend: 1. Fill form & click "Create"
    Note over Frontend: Client-side validation<br/>Name: 5-30 chars<br/>Description: 10-50 chars
    
    alt Validation Fails
        Frontend-->>User: Show validation errors (red border)
    else Validation Passes
        Frontend->>Backend: 2. POST /api/resources<br/>Content-Type: application/json<br/>{resourceName, resourceDescription, resourceAvailable, resourcePrice, resourcePriceUnit}
        
        Backend->>Service: 3. createResource(data)
        Note over Service: Server-side validation
        
        alt Validation Fails (400)
            Service-->>Backend: Validation errors
            Backend-->>Frontend: 4. 400 Bad Request<br/>{errors: [...]}
            Frontend-->>User: Show validation error message
        else Duplicate Name (409)
            Service-->>Backend: Duplicate error
            Backend-->>Frontend: 4. 409 Conflict<br/>"A resource with the same name already exists"
            Frontend-->>User: Show "❌ A resource with the same name already exists. 😕"
        else Success (201)
            Service->>DB: 4. INSERT INTO resources<br/>(name, description, available, price, price_unit)
            DB-->>Service: 5. Return new resource with ID
            Service-->>Backend: 6. Resource object
            Backend-->>Frontend: 7. 201 Created<br/>{data: {id, name, description, ...}}
            Frontend-->>User: 8. Show "👍 [name] successfully created! 🥳"
            Note over Frontend: Trigger onResourceActionSuccess<br/>Refresh resource list
        end
    end
```

## 2️⃣ READ Operation

### A. Read All Resources (List View)

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Frontend as Frontend (resources.js)
    participant Backend as Backend (GET /api/resources)
    participant Service as Service Layer
    participant DB as PostgreSQL

    User->>Frontend: 1. Navigate to Resources page
    Note over Frontend: DOMContentLoaded triggers loadResources()
    
    Frontend->>Backend: 2. GET /api/resources
    Note over Frontend: fetch() called in loadResources() line 288
    
    Backend->>Service: 3. getAllResources()
    Service->>DB: 4. SELECT * FROM resources ORDER BY id
    DB-->>Service: 5. Return array of resources
    Service-->>Backend: 6. Resources array
    
    alt Database Error (500)
        DB-->>Service: Error
        Service-->>Backend: Error
        Backend-->>Frontend: 7. 500 Internal Server Error
        Frontend-->>User: Show empty list (renderResourceList([]))
    else Success (200)
        Backend-->>Frontend: 7. 200 OK<br/>{data: [{id, name, description, available, price, price_unit}, ...]}
        Frontend->>Frontend: 8. renderResourceList() - create buttons
        Frontend-->>User: 9. Display clickable resource list
    end
```

### B. Read Single Resource (Select for Edit)

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Frontend as Frontend (resources.js)
    participant Backend as Backend (GET /api/resources/:id)
    participant Service as Service Layer
    participant DB as PostgreSQL

    User->>Frontend: 1. Click on resource button in list
    Note over Frontend: Get resource from cache first (no API call!)
    
    alt Resource in Cache
        Frontend->>Frontend: 2. Find resource by ID in resourcesCache
        Frontend->>Frontend: 3. selectResource(resource) - populate form
        Frontend-->>User: 4. Display form with resource data
    else Resource Not in Cache (rare)
        Frontend->>Backend: 2. GET /api/resources/123
        Backend->>Service: 3. getResourceById(123)
        Service->>DB: 4. SELECT * FROM resources WHERE id = 123
        DB-->>Service: 5. Return resource or empty
        
        alt Resource Not Found (404)
            DB-->>Service: Empty result
            Service-->>Backend: null
            Backend-->>Frontend: 6. 404 Not Found
            Frontend-->>User: Show error
        else Success (200)
            DB-->>Service: Resource data
            Service-->>Backend: Resource object
            Backend-->>Frontend: 6. 200 OK<br/>{data: {id, name, description, ...}}
            Frontend->>Frontend: 7. selectResource() - populate form
            Frontend-->>User: 8. Display form with resource data
        end
    end
```

## 3️⃣ UPDATE Operation

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Frontend as Frontend (form.js)
    participant Backend as Backend (PUT /api/resources/:id)
    participant Service as Service Layer
    participant DB as PostgreSQL

    User->>Frontend: 1. Select resource, modify form & click "Update"
    Note over Frontend: Check if any fields changed (originalStateChanged)
    Note over Frontend: Client-side validation
    
    alt No Changes Made
        Frontend-->>User: Update button disabled
    else Validation Fails
        Frontend-->>User: Show validation errors (red border)
    else Changes Made & Valid
        Frontend->>Backend: 2. PUT /api/resources/123<br/>Content-Type: application/json<br/>{resourceName, resourceDescription, ...}
        
        Backend->>Service: 3. updateResource(123, data)
        Note over Service: Server-side validation
        
        alt Resource Not Found (404)
            Service->>DB: Check if resource exists
            DB-->>Service: No resource found
            Service-->>Backend: null
            Backend-->>Frontend: 4. 404 Not Found<br/>"Not found (404): The resource no longer exists."
            Frontend-->>User: Show "Not found (404): The resource no longer exists. Refresh the list and try again."
        else Validation Fails (400)
            Service-->>Backend: Validation error
            Backend-->>Frontend: 4. 400 Bad Request<br/>{errors: [...]}
            Frontend-->>User: Show validation error message
        else Duplicate Name (409)
            Service->>DB: Check for duplicate name
            DB-->>Service: Existing resource with same name
            Service-->>Backend: Conflict error
            Backend-->>Frontend: 4. 409 Conflict<br/>"A resource with the same name already exists"
            Frontend-->>User: Show "❌ A resource with the same name already exists. 😕"
        else Success (200)
            Service->>DB: 4. UPDATE resources<br/>SET name=?, description=?, available=?, price=?, price_unit=?<br/>WHERE id = 123
            DB-->>Service: 5. Update confirmation
            Service-->>Backend: 6. Updated resource object
            Backend-->>Frontend: 7. 200 OK<br/>{data: {id, name, description, ...}}
            Frontend-->>User: 8. Show "👍 [name] successfully updated! 🥳"
            Note over Frontend: Trigger onResourceActionSuccess<br/>Refresh resource list
        end
    end
```

## 4️⃣ DELETE Operation

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Frontend as Frontend (form.js)
    participant Backend as Backend (DELETE /api/resources/:id)
    participant Service as Service Layer
    participant DB as PostgreSQL

    User->>Frontend: 1. Select resource & click "Delete"
    
    alt No Resource Selected
        Frontend-->>User: Show "Delete failed: missing resource ID. Select a resource first."
    else Resource Selected
        Note over Frontend: No confirmation dialog in code? (UI may have one)
        
        Frontend->>Backend: 2. DELETE /api/resources/123
        Note over Frontend: No request body sent
        
        Backend->>Service: 3. deleteResource(123)
        Service->>DB: 4. DELETE FROM resources WHERE id = 123
        
        alt Resource Not Found (404)
            DB-->>Service: No rows affected
            Service-->>Backend: Resource not found
            Backend-->>Frontend: 5. 404 Not Found<br/>"Not found (404): The resource no longer exists."
            Frontend-->>User: Show "Not found (404): The resource no longer exists. Refresh the list and try again."
        else Foreign Key Constraint (409)
            DB-->>Service: Foreign key violation (has reservations)
            Service-->>Backend: Constraint error
            Backend-->>Frontend: 5. 409 Conflict<br/>{error: "Cannot delete: resource has existing reservations"}
            Frontend-->>User: Show error message
        else Success (204)
            DB-->>Service: 5. Delete confirmation (1 row affected)
            Service-->>Backend: 6. Success
            Backend-->>Frontend: 7. 204 No Content (no response body)
            Frontend-->>User: 8. Show "👍 [name] successfully deleted! 🥳"
            Note over Frontend: Trigger onResourceActionSuccess<br/>Clear form<br/>Refresh resource list
        end
    end
```

## 📊 Summary Table

| Operation | Method | URL Pattern | Success Status | Error Statuses |
|-----------|--------|-------------|----------------|----------------|
| Create | POST | `/api/resources` | 201 Created | 400, 409, 500 |
| Read (all) | GET | `/api/resources` | 200 OK | 500 |
| Read (one) | GET | `/api/resources/:id` | 200 OK | 404, 500 |
| Update | PUT | `/api/resources/:id` | 200 OK | 400, 404, 409, 500 |
| Delete | DELETE | `/api/resources/:id` | 204 No Content | 404, 409, 500 |

## 🔐 Validation Rules (from code)

| Field | Rules |
|-------|-------|
| resourceName | 5-30 chars, allowed: a-z A-Z 0-9 äöå ÄÖÅ space , . - |
| resourceDescription | 10-50 chars, allowed: a-z A-Z 0-9 äöå ÄÖÅ space , . - |
