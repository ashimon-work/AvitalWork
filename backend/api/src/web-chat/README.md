# WhatsApp Bot Developer Simulator

This module provides a web-based simulator for testing the WhatsApp bot without sending actual messages to WhatsApp. The simulator uses the same state machine and business logic as the production bot, ensuring identical behavior.

## Accessing the Simulator

Once your backend is running, access the simulator at:

**Production:**
```
https://smartyapp.co.il/api/web-chat/simulator
```

**Local Development:**
```
http://localhost:3000/api/web-chat/simulator
```

## Getting a JWT Token

You need a valid JWT token to use the simulator. Here are several ways to obtain one:

### Method 1: Using curl (Command Line)

**For regular users:**
```bash
curl -X POST https://smartyapp.co.il/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' | jq -r '.access_token'
```

**For managers:**
```bash
curl -X POST https://smartyapp.co.il/api/auth/manager/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}' | jq -r '.access_token'
```

### Method 2: Using Browser Console

1. Open your browser's developer console (F12)
2. Navigate to `https://smartyapp.co.il`
3. Run this JavaScript:

```javascript
fetch('https://smartyapp.co.il/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'your-email@example.com',
    password: 'your-password'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Your JWT token:', data.access_token);
  // Copy this token to use in the simulator
});
```

### Method 3: Using Postman or Similar Tools

1. Create a POST request to `https://smartyapp.co.il/api/auth/login`
2. Set headers: `Content-Type: application/json`
3. Body (raw JSON):
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```
4. Send the request and copy the `access_token` from the response

## Test Accounts (From Seed Data)

If you're using the seeded database, you can use these test accounts:

### Regular Users (password: `password123`)
- `john.doe@example.com` / `password123`
- `jane.smith@example.com` / `password123`
- `A@A.com` / `password123` (Manager)

### Green Jewelry Users (password: `passwordGJ123`)
- `yael.cohen@example.co.il` / `passwordGJ123`
- `moshe.levi@example.co.il` / `passwordGJ123`
- `manager.gj@example.co.il` / `passwordGJ123` (Manager)
- `test.user@example.com` / `passwordGJ123`
- `test.user2@example.com` / `passwordGJ123`

**Quick token for manager account:**
```bash
curl -X POST https://smartyapp.co.il/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"A@A.com","password":"password123"}' | jq -r '.access_token'
```

## Using the Simulator

1. Navigate to the simulator URL (see above)
2. When prompted, paste your JWT token
3. Start chatting with the bot simulator
4. The bot will respond exactly as it would in WhatsApp, but without sending messages to Meta's API

## Features

- **Secure**: Protected by JWT authentication
- **Isolated**: Uses prefixed user IDs (`web-{developerId}`) to prevent collisions with real WhatsApp users
- **Non-destructive**: Messages are intercepted and returned as JSON, not sent to WhatsApp
- **Reusable**: Uses existing state machine and business logic without modifications
- **User-friendly**: WhatsApp-style chat interface

## Token Expiration

JWT tokens expire based on your `JWT_EXPIRATION_TIME` environment variable (default is `1d`). If your token expires:

1. Log in again using one of the methods above
2. Get a new token
3. Refresh the simulator page and enter the new token

## API Endpoints

- `GET /api/web-chat/simulator` - Serves the HTML chat interface
- `POST /api/web-chat/message` - Handles messages from the simulator (requires JWT authentication)

## Architecture

The simulator works by:
1. Creating a proxy of the `WhatsappService` that intercepts outgoing messages
2. Capturing bot responses instead of sending them to Meta's API
3. Returning captured responses as JSON to the web client
4. Using the same state machine and business logic as the production bot

This ensures the simulator behaves identically to the real WhatsApp bot while keeping it completely isolated from production.

