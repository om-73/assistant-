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

*Note: This version uses MySQL (`mysql2`). To securely connect to your database on Render, generate a free MySQL instance (or use an add-on like PlanetScale/Aiven), copy the Database URL, and paste it as the `DATABASE_URL` environment variable for your Web Service.*

## Live Deployment URL
*(Add your Render.com URL here)*
