# Identity Reconciliation Service

A Node.js web service that links and reconciles contact data across multiple purchases or interactions.

## Endpoint

**POST** `/identify`

Accepts a JSON payload with an `email` and/or `phoneNumber`.

```json
{
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456"
}
```

The service will link overlapping contacts into a consolidated identity profile.
It will prioritize the oldest record as the "primary" contact and demote others to "secondary".

Returns:
```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@bttf.com"],
    "phoneNumbers": ["123456", "123457"],
    "secondaryContactIds": [2, 3]
  }
}
```

## Setup & Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server (runs on port 3000):
   ```bash
   npm start
   ```

*Note: This version uses `better-sqlite3` which requires a local filesystem to persist `contacts.db`. When deploying to Render.com, you should attach a persistent Disk to your web service to retain the database file, or switch the DB adapter to a hosted PostgreSQL/MySQL instance.*

## Live Deployment URL
*(Add your Render.com URL here)*
