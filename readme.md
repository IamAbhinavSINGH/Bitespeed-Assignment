# 🧠 Bitespeed Identity Reconciliation

This project implements the `/identify` API endpoint for Bitespeed’s customer identity reconciliation challenge. It helps consolidate customer contact information (email/phone) and intelligently link them to a single user entity, handling complex linking scenarios.

---

## 🔧 Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Deployment:** [Render](https://render.com) 

---

## 🚀 Hosted API

**Base URL:** [https://bitespeed-assignment-7t6r.onrender.com/](https://bitespeed-assignment-7t6r.onrender.com/)

### 🔍 Endpoint: `POST /identify`

**Request Body:**

```json
{
  "email": "example@example.com", // nullable
  "phoneNumber": "1234567890"     // nullable
}
```
Either email or phoneNumber must be provided (or both).

**Successful Response**

```json
{
  "contact": {
    "primaryContatctId": 1,
    "emails": ["example@example.com", "alt@example.com"],
    "phoneNumbers": ["1234567890", "0987654321"],
    "secondaryContactIds": [2, 3]
  }
}
```

- **primaryContatctId**: The ID of the primary contact record.
- **emails**: Unique set of emails for this user, primary email listed first.
- **phoneNumbers**: Unique set of phone numbers, primary number listed first.
- **secondaryContactIds**: All related secondary contact IDs.

## 🧠 Features

- 👤 Automatically creates a new contact if no match is found.
- 🔗 Links contacts using shared email or phone number.
- 🔄 Reconciles multiple existing primary contacts by assigning the oldest as primary.
- 🔁 Handles updates to ensure only one primary contact exists.
- ✅ Validates input using Zod.
- 📦 Fully typed with TypeScript.

##  🗃️ Database Schema
Defined using Prisma, the Contact model:

```prisma
model Contact{
  id              Int          @id      @default(autoincrement())
  phoneNumber     String?
  email           String?
  linkedID        Int?
  linkPrecedence  Precedence
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?
}

enum Precedence{
  Primary
  Secondary
}
```

## 🛠️ Setup Instructions

1. Clone the repo
```bash
    git clone https://github.com/iamabhinavsingh/bitespeed-assignment.git
    cd bitespeed-assignment
```

2. Install dependencies
```bash
    npm install
```

3. Set up your env

    Create an ```.env``` file

```json
    DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PORT=3000
```

4. Set up the database
```bash
    npx prisma migrate dev --name init
    npx prisma generate
```
5. Start the server
```bash
    npm run dev
```

## 🧪 Example Requests
### 1. **New user (no match)**
```json
POST /identify
{
  "email": "doc@flux.com",
  "phoneNumber": "123456"
}
```
Creates a new contact with linkPrecedence: "primary".

### 2. **Existing user (partial match)**
```json
POST /identify
{
  "email": "newemail@flux.com",
  "phoneNumber": "123456"
}
```
Links new email to existing primary contact with matching phone number.

