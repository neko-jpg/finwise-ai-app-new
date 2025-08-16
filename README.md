# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Data Schema

This document outlines the core data schema used in the application's Firestore database.

### Collection Overview

| Collection Path | Description |
| :--- | :--- |
| `/users/{uid}` | Stores user-specific profile information, such as display name and currency preferences. Linked to Firebase Auth UID. |
| `/families/{fid}` | The central document for a family group. Contains a list of members and serves as the root for most subcollections. |
| `/families/{fid}/transactions/{tid}` | Stores all financial transactions for a family. |
| `/families/{fid}/budgets/{bid}` | Defines monthly or yearly budgets for various categories. |
| `/families/{fid}/subscriptions/{sid}` | (Schema TBD) Intended to store recurring subscriptions detected or entered by the user. |
| `/families/{fid}/goals/{gid}` | Tracks financial goals for the family or individuals. |

### Field Specifications

#### `families/{fid}`

The root document for a family group.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | The name of the family group (e.g., "Smith Family"). |
| `members` | `map` | Yes | A map where keys are user UIDs and values are booleans (e.g., `{ "user_uid_1": true, "user_uid_2": true }`). Used for access control. |
| `admins` | `array` | Yes | An array of user UIDs who have admin privileges over the family group. |
| `createdAt` | `timestamp` | Yes | The timestamp when the family document was created. |

#### `families/{fid}/transactions/{tid}`

Represents a single financial transaction.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `amount` | `number` | Yes | The transaction amount. Positive for income, negative for expenses. |
| `bookedAt` | `timestamp` | Yes | The date and time the transaction occurred. |
| `category` | `map` | Yes | Contains the major category (`major`) and an optional `minor` category. |
| `familyId` | `string` | Yes | The ID of the parent family (`fid`). |
| `merchant` | `string` | No | The name of the merchant or a description of the transaction. |
| `source` | `string` | Yes | How the transaction was created (e.g., 'manual', 'ocr', 'plaid'). |
| `createdBy` | `string` | Yes | The UID of the user who created the transaction. |
| `scope` | `string` | No | 'personal' or 'shared'. Defaults to personal. |
| `tags` | `array` | No | An array of strings for custom tagging (e.g., `["vacation", "2024"]`). |

### Example Documents (JSON)

Here are three example documents to illustrate the schema.

**1. A `family` document:**

```json
{
  "name": "田中家",
  "members": {
    "user_abc_123": true,
    "user_def_456": true
  },
  "admins": ["user_abc_123"],
  "createdAt": "2024-08-15T12:00:00Z"
}
```

**2. A `transaction` document:**

```json
{
  "amount": -680,
  "bookedAt": "2024-08-14T09:30:00Z",
  "category": {
    "major": "cafe",
    "minor": "coffee"
  },
  "familyId": "family_xyz_789",
  "merchant": "スターバックス",
  "source": "manual",
  "createdBy": "user_abc_123",
  "scope": "personal",
  "tags": ["morning_routine"]
}
```

**3. A `budget` document:**

```json
{
  "familyId": "family_xyz_789",
  "year": 2024,
  "month": 8,
  "limits": {
    "food": 50000,
    "entertainment": 15000,
    "transport": 10000
  },
  "used": {
    "food": 25000,
    "entertainment": 10000,
    "transport": 5000
  },
  "scope": "shared",
  "createdBy": "user_abc_123",
  "createdAt": "2024-08-01T00:00:00Z",
  "updatedAt": "2024-08-15T12:00:00Z"
}
```
