# Secure Student Portal - Cybersecurity Major Project

## 🛡️ Project Overview

The **Secure Student Portal** is a full-stack web application designed with a security-first approach. Built as a Major Project for cybersecurity evaluation, it demonstrates the practical implementation of modern web security principles, defensive programming, and secure architectural design.

This portal provides students with a secure environment to manage their profiles and authenticate, while robustly defending against the OWASP Top 10 vulnerabilities, including SQL Injection, Cross-Site Scripting (XSS), Brute Force attacks, and Session Hijacking.

---

## 🔒 Core Security Features Implemented

### 1. Advanced Authentication & Session Management
- **Stateless JWT Authentication**: JSON Web Tokens are used for secure, stateless session management.
- **Secure Cookie Storage**: JWTs are strictly stored in `HttpOnly`, `Secure`, and `SameSite='strict'` cookies, making them inaccessible to client-side JavaScript (mitigating XSS token theft) and protecting against Cross-Site Request Forgery (CSRF).
- **Cryptographic Password Hashing**: Passwords are never stored in plain text. They are hashed using **bcrypt** (with a work factor/salt rounds of 10) to defend against rainbow table and brute-force database attacks.
- **Strict Password Policies**: Registration enforces strong passwords (minimum 8 characters, uppercase, and numeric requirements) validated server-side.

### 2. Defense Against Brute Force & Account Takeover
- **Intelligent Account Lockout**: The system tracks failed login attempts. If an attacker fails to guess a password 5 consecutive times, the account is temporarily locked for 15 minutes, neutralizing automated credential stuffing.
- **Network Rate Limiting**: The `/api/auth` routes are protected by a strict rate limiter (maximum 5 requests per minute per IP address) to prevent volumetric dictionary attacks.

### 3. Database Security & Injection Prevention
- **Parameterized SQL Queries**: The application completely eliminates SQL Injection (SQLi) vulnerabilities by utilizing parameterized queries (via the `postgres.js` tagged template literals). User input is never concatenated directly into SQL statements.
- **Encrypted Data in Transit**: The connection to the PostgreSQL database (hosted on Supabase) enforces strictly encrypted `ssl: 'require'` connections.

### 4. Cross-Site Scripting (XSS) Mitigation
- **Input Validation**: All incoming requests (registration, login, profile updates) are rigorously validated using the `validator` library before processing.
- **Output Sanitization**: A custom middleware utilizes `DOMPurify` (running server-side via `isomorphic-dompurify`) to recursively sanitize all JSON responses, ensuring malicious payloads are neutralized before reaching the browser.

### 5. Secure HTTP Headers (via Helmet)
The application utilizes the `helmet` middleware to enforce defensive HTTP headers:
- **Content Security Policy (CSP)**: Strictly defines which dynamic resources are allowed to load, severely restricting the vectors for XSS.
- **Clickjacking Protection**: Implements `X-Frame-Options: DENY` to prevent the site from being embedded in malicious iframes.
- **X-XSS-Protection**: Enables the browser's built-in XSS filters.

### 6. Security Auditing & Forensics
- **Comprehensive Activity Logging**: Every critical security event (successful logins, failed passwords, non-existent user attempts, account lockouts, and profile changes) is logged into a dedicated `security_logs` database table along with timestamps and the originating IP address.
- **User Transparency**: Students can view their own recent security logs via the dashboard to monitor their account for unauthorized access.

---

## 💻 Tech Stack

- **Frontend**: React.js (Vite), Bootstrap, React Router
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase)
- **Security Libraries**: `bcrypt`, `jsonwebtoken`, `helmet`, `express-rate-limit`, `isomorphic-dompurify`, `validator`

---

## 🚀 Deployment Architecture

The application is designed for serverless deployment on **Vercel**. 
- The React frontend is statically generated and globally distributed.
- The Node.js Express backend runs as Vercel Serverless Functions, ensuring high availability while restricting persistent server vulnerabilities.
- Environment variables (`JWT_SECRET`, `DB_PASSWORD`) are securely managed via the Vercel infrastructure, keeping secrets entirely out of the source code repository.

---

*Developed as a demonstration of defensive programming and modern web application security standards.*
