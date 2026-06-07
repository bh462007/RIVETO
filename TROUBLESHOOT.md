# Troubleshooting Guide

This document provides solutions to common issues encountered while setting up, running, and contributing to RIVETO.

## Table of Contents

* Installation Issues
* Frontend Issues
* Backend Issues
* Firebase Issues
* Environment Variables
* Build & Deployment Issues
* Git & Contribution Issues

---

## Installation Issues

### 1. `npm install` Fails

#### Symptoms

```bash
npm ERR! code ERESOLVE
npm ERR! unable to resolve dependency tree
```

#### Solution

Clear npm cache:

```bash
npm cache clean --force
```

Delete existing dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

If the issue persists:

```bash
npm install --legacy-peer-deps
```

---

### 2. Node Version Not Supported

#### Symptoms

```bash
SyntaxError: Unexpected token
```

or

```bash
npm WARN EBADENGINE
```

#### Solution

Check Node version:

```bash
node -v
```

Use Node.js 18+ (recommended):

```bash
nvm install 18
nvm use 18
```

---

## Frontend Issues

### 3. Frontend Not Starting

#### Symptoms

```bash
npm start
```

or

```bash
npm run dev
```

fails.

#### Solution

Ensure dependencies are installed:

```bash
npm install
```

Verify environment variables are configured correctly.

Restart the development server:

```bash
npm run dev
```

---

### 4. Blank Page in Browser

#### Possible Causes

* Missing environment variables
* API URL misconfiguration
* JavaScript runtime errors

#### Solution

Open browser Developer Tools:

```
F12 → Console
```

Check for:

* React errors
* Network request failures
* Missing configuration values

---

### 5. API Requests Failing

#### Symptoms

```bash
404 Not Found
```

or

```bash
500 Internal Server Error
```

#### Solution

Verify backend server is running.

Check API URL configuration:

```env
VITE_API_URL=http://localhost:5000
```

Restart frontend after changing environment variables.

---

## Backend Issues

### 6. Server Won't Start

#### Symptoms

```bash
Error: Cannot find module
```

#### Solution

Install dependencies:

```bash
npm install
```

Check startup command:

```bash
npm run dev
```

or

```bash
npm start
```

---

### 7. Port Already in Use

#### Symptoms

```bash
EADDRINUSE
```

#### Solution

Find process using the port:

Linux/macOS:

```bash
lsof -i :5000
kill -9 <PID>
```

Windows:

```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

### 8. CORS Errors

#### Symptoms

```bash
Access-Control-Allow-Origin
```

error in browser console.

#### Solution

Ensure CORS middleware is configured:

```javascript
app.use(cors());
```

Or whitelist frontend origin:

```javascript
origin: "http://localhost:5173"
```

---

## Firebase Issues

### 9. Firebase Authentication Not Working

#### Symptoms

```bash
FirebaseError
```

#### Solution

Verify:

* Firebase project is active
* Authentication provider is enabled
* API keys are correct

Example:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
```

---

### 10. Firestore Permission Denied

#### Symptoms

```bash
Missing or insufficient permissions
```

#### Solution

Review Firestore security rules.

Example development rule:

```javascript
allow read, write: if request.auth != null;
```

---

## Environment Variables

### 11. Environment Variables Not Loading

#### Symptoms

Values appear as:

```javascript
undefined
```

#### Solution

Ensure:

* `.env` file exists
* Variable names are correct
* Frontend variables use required prefixes

Example:

```env
VITE_API_URL=http://localhost:5000
```

Restart application after changes.

---

## Build Issues

### 12. Production Build Fails

#### Symptoms

```bash
npm run build
```

fails.

#### Solution

Check TypeScript/ESLint errors:

```bash
npm run lint
```

Resolve all reported issues before building.

---

### 13. Deployment Works Locally But Fails Online

#### Solution

Verify:

* Environment variables are configured in hosting platform
* Build command is correct
* Backend URLs are production-ready

Example:

```env
VITE_API_URL=https://api.example.com
```

---

## Git & Contribution Issues

### 14. Unable to Push Changes

#### Symptoms

```bash
failed to push some refs
```

#### Solution

Pull latest changes:

```bash
git pull origin main
```

Resolve merge conflicts and push again.

---

### 15. Merge Conflicts

#### Solution

Update branch:

```bash
git fetch origin
git merge origin/main
```

Resolve conflicts manually.

Then:

```bash
git add .
git commit -m "Resolve merge conflicts"
```

---

## General Debugging Checklist

Before opening an issue:

* Verify Node.js version
* Reinstall dependencies
* Check environment variables
* Restart frontend and backend
* Review browser console logs
* Review terminal logs
* Confirm Firebase configuration
* Ensure backend services are running

---

## Need More Help?

If your issue is not covered:

1. Search existing GitHub Issues.
2. Check README setup instructions.
3. Create a new issue with:

   * Operating System
   * Node.js Version
   * Error Logs
   * Steps to Reproduce
   * Screenshots (if applicable)

Providing detailed information helps maintainers resolve issues faster.
