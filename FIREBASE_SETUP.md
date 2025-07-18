# Firebase Setup Guide for College Canteen

## Quick Setup (5 minutes)

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `college-canteen-orders`
4. Disable Google Analytics (not needed)
5. Click "Create project"

### 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your preferred region
5. Click "Done"

### 3. Get Your Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon `</>`
4. Register your app with name: `college-canteen`
5. Copy the `firebaseConfig` object

### 4. Update Your Code

Replace the demo config in `client/lib/firebase.ts`:

```typescript
// Replace this demo config with your actual Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
};
```

### 5. Run Your App

```bash
npm run dev
```

## Firestore Security Rules (Production)

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to orders collection
    match /orders/{document} {
      allow read, write: if true;
    }
  }
}
```

## Data Structure

Your `orders` collection will store documents with this structure:

```typescript
{
  name: string,           // Student name
  roll: string,           // Roll number
  item: string,           // Menu item
  price: number,          // Item price
  paymentStatus: "Paid" | "Unpaid",
  timestamp: Timestamp,   // Firebase timestamp
  date: string           // YYYY-MM-DD format
}
```

## Features Available

✅ **Real-time updates** - Orders appear instantly on admin dashboard
✅ **Persistent storage** - Data survives browser restarts  
✅ **Filtering** - Filter by date, item, payment status
✅ **Statistics** - Automatic calculation of totals and rankings
✅ **Mobile-friendly** - Responsive design for phones/tablets
✅ **Error handling** - Graceful handling of network issues

## Cost Information

Firebase Firestore has a generous free tier:

- **50,000 reads/day**
- **20,000 writes/day**
- **20,000 deletes/day**
- **1 GB storage**

Perfect for a college canteen with hundreds of daily orders!
