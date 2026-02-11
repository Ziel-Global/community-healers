# GovernCert-Wise API Documentation

> **Application Type**: Government Certification Management System  
> **Purpose**: Soft Skills Training & CBT (Computer Based Testing) Certification Platform  
> **Version**: 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication APIs](#authentication-apis)
3. [Candidate Portal APIs](#candidate-portal-apis)
4. [Centre Admin Portal APIs](#centre-admin-portal-apis)
5. [Super Admin Portal APIs](#super-admin-portal-apis)
6. [Ministry Portal APIs](#ministry-portal-apis)
7. [Data Models](#data-models)
8. [Error Responses](#error-responses)

---

## Overview

The GovernCert-Wise system is a multi-portal government certification platform designed to manage:
- **Candidates**: Registration, document upload, scheduling, and exam taking
- **Centre Admins**: Candidate verification, exam monitoring, and result management
- **Super Admins**: System configuration, center management, question bank, and user management
- **Ministry Officials**: Certificate review, issuance, and governance oversight

### Base URL
```
Production: https://api.governcert.gov.pk/v1
Development: http://localhost:3000/api/v1
```

### Authentication
All API requests (except authentication endpoints) require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication APIs

### 1. Send OTP

Initiates phone-based OTP authentication for candidates.

```http
POST /auth/send-otp
```

**Request Body:**
```json
{
  "phone": "03001234567",
  "userType": "candidate" | "center_admin" | "super_admin" | "ministry"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your mobile number",
  "otpExpiresIn": 300
}
```

---

### 2. Verify OTP

Verifies the OTP and returns authentication tokens.

```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "phone": "03001234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJI...",
  "refreshToken": "eyJhbGciOiJI...",
  "user": {
    "id": "user-123",
    "phone": "03001234567",
    "role": "candidate",
    "isProfileComplete": false
  }
}
```

---

### 3. Admin Login

Username/password authentication for admin users.

```http
POST /auth/admin/login
```

**Request Body:**
```json
{
  "username": "admin@center.gov.pk",
  "password": "********",
  "portalType": "center_admin" | "super_admin" | "ministry"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJI...",
  "refreshToken": "eyJhbGciOiJI...",
  "user": {
    "id": "admin-123",
    "name": "M. Siddique",
    "role": "center_admin",
    "centerId": "LHR-003"
  }
}
```

---

### 4. Exam Portal Login

Special authentication for exam takers at centers.

```http
POST /auth/exam/login
```

**Request Body:**
```json
{
  "registrationId": "REG-2024-001",
  "cnic": "35201-1234567-1",
  "centerId": "LHR-003"
}
```

**Response:**
```json
{
  "success": true,
  "examToken": "eyJhbGciOiJI...",
  "candidate": {
    "id": "REG-2024-001",
    "name": "Muhammad Ahmed",
    "examDate": "2024-01-25",
    "examTime": "09:00 AM"
  },
  "examStatus": "waiting" | "ready" | "in-progress"
}
```

---

## Candidate Portal APIs

### 1. Get Candidate Profile

Retrieve the current candidate's profile information.

```http
GET /candidates/me
```

**Response:**
```json
{
  "id": "REG-2024-001",
  "fullName": "Muhammad Ahmed",
  "fatherName": "Muhammad Aslam",
  "cnic": "35201-1234567-1",
  "dob": "1995-01-15",
  "phone": "03001234567",
  "email": "ahmed@example.com",
  "city": "lahore",
  "address": "Block 5, Gulberg III, Lahore",
  "registrationStatus": "complete" | "pending" | "incomplete",
  "paymentStatus": "paid" | "unpaid" | "pending",
  "examStatus": "scheduled" | "pending_verification" | "verified" | "completed" | "absent",
  "examScore": 85,
  "certificateNumber": "CERT-2024-12345"
}
```

---

### 2. Update Personal Information

Update candidate personal information.

```http
PUT /candidates/me
```

**Request Body:**
```json
{
  "fullName": "Muhammad Ahmed Khan",
  "fatherName": "Muhammad Aslam",
  "cnic": "35201-1234567-1",
  "dob": "1995-01-15",
  "city": "lahore"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "candidate": { ... }
}
```

---

### 3. Upload Document

Upload a required document for registration.

```http
POST /candidates/me/documents
```

**Request Body (multipart/form-data):**
```
file: <binary>
documentType: "photo" | "cnic_front" | "cnic_back" | "police_clearance" | "medical_certificate" | "passport"
```

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "doc-123",
    "name": "Candidate Photo",
    "type": "Image",
    "fileName": "photo.jpg",
    "uploadDate": "2024-01-20T10:30:00Z",
    "status": "uploaded"
  }
}
```

---

### 4. Get Uploaded Documents

Retrieve all uploaded documents for the candidate.

```http
GET /candidates/me/documents
```

**Response:**
```json
{
  "documents": [
    {
      "id": "doc-1",
      "name": "Candidate Photo",
      "type": "Image",
      "isMandatory": true,
      "status": "complete",
      "fileName": "photo.jpg",
      "fileUrl": "/documents/doc-1",
      "uploadDate": "2024-01-20T10:30:00Z"
    },
    {
      "id": "doc-2",
      "name": "CNIC Front",
      "type": "Image/PDF",
      "isMandatory": true,
      "status": "pending",
      "fileName": null,
      "fileUrl": null,
      "uploadDate": null
    }
  ]
}
```

---

### 5. Delete Document

Remove an uploaded document.

```http
DELETE /candidates/me/documents/:documentId
```

**Response:**
```json
{
  "success": true,
  "message": "Document removed successfully"
}
```

---

### 6. Get Available Exam Centers

Get list of exam centers for scheduling.

```http
GET /centers
```

**Query Parameters:**
- `city` (optional): Filter by city
- `availableFrom` (optional): Date filter

**Response:**
```json
{
  "centers": [
    {
      "id": "LHR-003",
      "name": "Lahore Training Center #3",
      "location": "Model Town, Lahore",
      "address": "123 Main Street, Model Town, Lahore",
      "capacity": 150,
      "status": "active"
    }
  ]
}
```

---

### 7. Get Available Exam Slots

Get available exam time slots for a center.

```http
GET /centers/:centerId/slots
```

**Query Parameters:**
- `date` (required): Date to check availability (YYYY-MM-DD)

**Response:**
```json
{
  "centerId": "LHR-003",
  "date": "2024-01-25",
  "slots": [
    {
      "id": "slot-1",
      "time": "09:00 AM",
      "availableSeats": 25,
      "totalSeats": 50,
      "status": "available"
    },
    {
      "id": "slot-2",
      "time": "11:30 AM",
      "availableSeats": 0,
      "totalSeats": 50,
      "status": "full"
    }
  ]
}
```

---

### 8. Schedule Exam

Book an exam slot for the candidate.

```http
POST /candidates/me/schedule
```

**Request Body:**
```json
{
  "centerId": "LHR-003",
  "date": "2024-01-25",
  "slotId": "slot-1"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "booking-123",
    "registrationId": "REG-2024-001",
    "centerId": "LHR-003",
    "centerName": "Lahore Training Center #3",
    "date": "2024-01-25",
    "time": "09:00 AM",
    "status": "confirmed"
  }
}
```

---

### 9. Get Exam Details

Get scheduled exam details for the candidate.

```http
GET /candidates/me/exam
```

**Response:**
```json
{
  "exam": {
    "id": "exam-123",
    "registrationId": "REG-2024-001",
    "date": "January 25, 2024",
    "time": "09:00 AM",
    "center": "Lahore Training Center #3, Model Town, Lahore",
    "centerId": "LHR-003",
    "status": "pending" | "verified" | "in-progress" | "completed",
    "duration": "20 minutes",
    "totalQuestions": 20,
    "passingScore": 60,
    "verificationStatus": "pending" | "verified"
  }
}
```

---

### 10. Get Exam Questions

Retrieve exam questions (only available during active exam session).

```http
GET /exams/:examId/questions
```

**Headers:**
```
Authorization: Bearer <exam_token>
```

**Response:**
```json
{
  "examId": "exam-123",
  "startTime": "2024-01-25T09:00:00Z",
  "endTime": "2024-01-25T09:20:00Z",
  "questions": [
    {
      "id": 1,
      "text": "Which piece of safety equipment is mandatory when working with high-voltage?",
      "options": [
        "Safety goggles",
        "Insulated gloves",
        "Hard hat",
        "Steel-toed boots"
      ]
    }
  ]
}
```

---

### 11. Submit Exam Answer

Submit answer for a single question.

```http
POST /exams/:examId/answers
```

**Request Body:**
```json
{
  "questionId": 1,
  "selectedOption": "Insulated gloves"
}
```

**Response:**
```json
{
  "success": true,
  "answerId": "ans-123",
  "questionId": 1,
  "savedAt": "2024-01-25T09:05:30Z"
}
```

---

### 12. Submit Exam

Complete and submit the exam.

```http
POST /exams/:examId/submit
```

**Request Body:**
```json
{
  "answers": [
    { "questionId": 1, "selectedOption": "Insulated gloves" },
    { "questionId": 2, "selectedOption": "Evacuate immediately" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "examId": "exam-123",
    "score": 85,
    "total": 100,
    "correctAnswers": 17,
    "totalQuestions": 20,
    "passed": true,
    "passingScore": 60,
    "completedAt": "2024-01-25T09:18:45Z"
  }
}
```

---

### 13. Get Certificates

Get issued certificates for the candidate.

```http
GET /candidates/me/certificates
```

**Response:**
```json
{
  "certificates": [
    {
      "id": "cert-123",
      "certificateNumber": "CERT-2024-12345",
      "issuedDate": "2024-02-01",
      "expiryDate": "2029-02-01",
      "examDate": "2024-01-25",
      "score": 85,
      "downloadUrl": "/certificates/cert-123/download",
      "verificationUrl": "https://verify.governcert.gov.pk/CERT-2024-12345"
    }
  ]
}
```

---

### 14. Download Certificate

Download certificate PDF.

```http
GET /certificates/:certificateId/download
```

**Response:** Binary PDF file

---

### 15. Get Notifications

Get candidate notifications.

```http
GET /candidates/me/notifications
```

**Response:**
```json
{
  "notifications": [
    {
      "id": "notif-1",
      "type": "exam_reminder",
      "title": "Exam Tomorrow",
      "message": "Your exam is scheduled for tomorrow at 9:00 AM",
      "read": false,
      "createdAt": "2024-01-24T10:00:00Z"
    }
  ]
}
```

---

## Centre Admin Portal APIs

### 1. Get Center Info

Get center details for the logged-in admin.

```http
GET /admin/center
```

**Response:**
```json
{
  "center": {
    "id": "LHR-003",
    "name": "Lahore Training Center #3",
    "location": "Model Town, Lahore",
    "address": "123 Main Street, Model Town",
    "adminName": "M. Siddique",
    "contactPerson": "M. Siddique",
    "phone": "042-12345678",
    "email": "center3@training.gov.pk",
    "capacity": 150,
    "status": "active"
  }
}
```

---

### 2. Get Center Statistics

Get center dashboard statistics.

```http
GET /admin/center/stats
```

**Response:**
```json
{
  "stats": {
    "todayCandidates": 45,
    "verified": 32,
    "pending": 8,
    "absent": 5,
    "scheduled": 45,
    "attendanceRate": "92%"
  }
}
```

---

### 3. Get Today's Candidates

Get list of candidates scheduled for today.

```http
GET /admin/center/candidates
```

**Query Parameters:**
- `date` (optional): Date filter (default: today)
- `status` (optional): Filter by status (all, Verified, Pending, Absent, Rejected)
- `search` (optional): Search by name, CNIC, or registration ID

**Response:**
```json
{
  "candidates": [
    {
      "id": "REG-2024-001",
      "name": "Muhammad Ahmed",
      "cnic": "35201-1234567-1",
      "time": "09:00 AM",
      "payment": "Paid",
      "status": "Verified",
      "photo": "https://...",
      "phone": "0300-1234567",
      "email": "ahmed@example.com",
      "address": "Block 5, Gulberg III, Lahore",
      "dob": "January 15, 1995",
      "fatherName": "Muhammad Aslam",
      "documents": [
        {
          "id": "1",
          "name": "Candidate Photo",
          "type": "Image",
          "uploadDate": "Jan 20, 2024",
          "fileUrl": "/documents/1"
        }
      ]
    }
  ]
}
```

---

### 4. Verify Candidate

Verify candidate identity and documents at the center.

```http
POST /admin/center/candidates/:candidateId/verify
```

**Request Body:**
```json
{
  "biometricVerified": true,
  "documentsVerified": true,
  "photoMatches": true,
  "notes": "All documents verified successfully"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Candidate verified successfully",
  "candidate": {
    "id": "REG-2024-001",
    "status": "Verified",
    "verifiedAt": "2024-01-25T08:45:00Z",
    "verifiedBy": "admin-123"
  }
}
```

---

### 5. Mark Candidate Absent

Mark a candidate as absent.

```http
POST /admin/center/candidates/:candidateId/absent
```

**Request Body:**
```json
{
  "reason": "Did not appear for exam"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Candidate marked as absent"
}
```

---

### 6. Start Exam Session

Start the exam session for verified candidates.

```http
POST /admin/center/exam-session/start
```

**Request Body:**
```json
{
  "slotTime": "09:00 AM",
  "candidateIds": ["REG-2024-001", "REG-2024-002"]
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session-123",
    "startTime": "2024-01-25T09:00:00Z",
    "endTime": "2024-01-25T09:20:00Z",
    "candidateCount": 25,
    "status": "in-progress"
  }
}
```

---

### 7. Get Exam Monitoring Data

Get real-time exam monitoring data.

```http
GET /admin/center/exam-session/:sessionId/monitor
```

**Response:**
```json
{
  "session": {
    "id": "session-123",
    "status": "in-progress",
    "timeRemaining": "12:45",
    "candidates": [
      {
        "id": "REG-2024-001",
        "name": "Muhammad Ahmed",
        "progress": 75,
        "currentQuestion": 15,
        "status": "active"
      }
    ]
  }
}
```

---

### 8. Get Daily Results

Get exam results for a specific day.

```http
GET /admin/center/results
```

**Query Parameters:**
- `date` (optional): Date filter (default: today)

**Response:**
```json
{
  "summary": {
    "passed": 24,
    "failed": 8,
    "absent": 13,
    "passRate": "72%"
  },
  "results": [
    {
      "candidateId": "REG-2024-001",
      "name": "Muhammad Ahmed",
      "score": 85,
      "totalQuestions": 20,
      "correctAnswers": 17,
      "status": "passed",
      "completedAt": "2024-01-25T09:18:45Z"
    }
  ]
}
```

---

### 9. Generate Center Report

Generate center performance report.

```http
GET /admin/center/reports
```

**Query Parameters:**
- `startDate` (required): Report start date
- `endDate` (required): Report end date
- `format` (optional): "json" | "pdf" | "excel"

**Response:**
```json
{
  "report": {
    "centerId": "LHR-003",
    "period": "2024-01-01 to 2024-01-31",
    "totalCandidates": 450,
    "examined": 425,
    "passed": 380,
    "failed": 45,
    "absent": 25,
    "passRate": "89.4%",
    "averageScore": 78.5
  }
}
```

---

## Super Admin Portal APIs

### 1. Get Global Statistics

Get system-wide statistics.

```http
GET /admin/global/stats
```

**Response:**
```json
{
  "stats": {
    "totalRegistrations": 12405,
    "activeCenters": 42,
    "questionBankSize": 850,
    "monthlyGrowth": "+4.2%"
  }
}
```

---

### 2. Get Exam Participation Trend

Get exam participation data over time.

```http
GET /admin/analytics/participation
```

**Query Parameters:**
- `period` (required): "days" | "months" | "years"

**Response:**
```json
{
  "data": [
    { "period": "Jan", "candidates": 850 },
    { "period": "Feb", "candidates": 920 },
    { "period": "Mar", "candidates": 1150 }
  ],
  "growth": "+24.5%"
}
```

---

### 3. Get All Centers

Get list of all centers.

```http
GET /admin/centers
```

**Response:**
```json
{
  "centers": [
    {
      "id": "LHR-003",
      "name": "Lahore Training Center #3",
      "location": "Lahore",
      "capacity": 150,
      "status": "Active",
      "attendance": "92%",
      "address": "Model Town, Lahore",
      "contactPerson": "M. Siddique",
      "phone": "042-12345678",
      "email": "center3@training.gov.pk",
      "established": "2020-05-15"
    }
  ]
}
```

---

### 4. Create Center

Create a new examination center.

```http
POST /admin/centers
```

**Request Body:**
```json
{
  "name": "Karachi Training Center #5",
  "location": "Karachi",
  "address": "Block 10, DHA Phase 6, Karachi",
  "capacity": 120,
  "contactPerson": "Ahmed Khan",
  "phone": "021-12345678",
  "email": "center5@training.gov.pk"
}
```

**Response:**
```json
{
  "success": true,
  "center": {
    "id": "KHI-005",
    "name": "Karachi Training Center #5",
    "status": "Active"
  }
}
```

---

### 5. Update Center

Update center information.

```http
PUT /admin/centers/:centerId
```

**Request Body:**
```json
{
  "name": "Karachi Training Center #5",
  "capacity": 150,
  "status": "Active"
}
```

---

### 6. Get Question Bank

Get all questions from the question bank.

```http
GET /admin/questions
```

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in question text

**Response:**
```json
{
  "questions": [
    {
      "id": 1,
      "text": "Which piece of safety equipment is mandatory when working with high-voltage?",
      "category": "Safety",
      "options": [
        "Safety goggles",
        "Insulated gloves",
        "Hard hat",
        "Steel-toed boots"
      ],
      "correctAnswer": "Insulated gloves",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ],
  "total": 850,
  "categories": ["Safety", "General", "Technical", "Ethics"]
}
```

---

### 7. Create Question

Add a new question to the bank.

```http
POST /admin/questions
```

**Request Body:**
```json
{
  "text": "What is the primary purpose of a safety harness?",
  "category": "Safety",
  "options": [
    "Protection from falls",
    "Protection from electricity",
    "Protection from chemicals",
    "Protection from noise"
  ],
  "correctAnswer": "Protection from falls"
}
```

**Response:**
```json
{
  "success": true,
  "question": {
    "id": 851,
    "text": "What is the primary purpose of a safety harness?",
    "category": "Safety"
  }
}
```

---

### 8. Update Question

Update an existing question.

```http
PUT /admin/questions/:questionId
```

---

### 9. Delete Question

Remove a question from the bank.

```http
DELETE /admin/questions/:questionId
```

---

### 10. Get Admin Users

Get list of all admin users.

```http
GET /admin/users
```

**Response:**
```json
{
  "users": [
    {
      "id": "admin-123",
      "name": "M. Siddique",
      "email": "siddique@center.gov.pk",
      "role": "center_admin",
      "centerId": "LHR-003",
      "status": "active",
      "lastLogin": "2024-01-25T08:00:00Z"
    }
  ]
}
```

---

### 11. Create Admin User

Create a new admin user.

```http
POST /admin/users
```

**Request Body:**
```json
{
  "name": "Ahmed Khan",
  "email": "ahmed@center.gov.pk",
  "role": "center_admin",
  "centerId": "KHI-005",
  "password": "********"
}
```

---

### 12. Get Exam Configuration

Get current exam configuration.

```http
GET /admin/config/exam
```

**Response:**
```json
{
  "config": {
    "examDuration": 20,
    "totalQuestions": 20,
    "passingScore": 60,
    "randomizeQuestions": true,
    "randomizeOptions": true,
    "showResultImmediately": true,
    "allowReattempt": true,
    "reattemptFee": 0
  }
}
```

---

### 13. Update Exam Configuration

Update exam settings.

```http
PUT /admin/config/exam
```

**Request Body:**
```json
{
  "examDuration": 25,
  "passingScore": 65
}
```

---

### 14. Get Audit Logs

Get system audit logs.

```http
GET /admin/audit-logs
```

**Query Parameters:**
- `startDate` (optional): Filter start date
- `endDate` (optional): Filter end date
- `action` (optional): Filter by action type
- `userId` (optional): Filter by user

**Response:**
```json
{
  "logs": [
    {
      "id": "log-123",
      "action": "CANDIDATE_VERIFIED",
      "userId": "admin-123",
      "userName": "M. Siddique",
      "details": "Verified candidate REG-2024-001",
      "timestamp": "2024-01-25T08:45:00Z",
      "ipAddress": "192.168.1.100"
    }
  ]
}
```

---

## Ministry Portal APIs

### 1. Get Ministry Statistics

Get ministry dashboard statistics.

```http
GET /ministry/stats
```

**Response:**
```json
{
  "stats": {
    "pendingReview": 156,
    "issuedThisMonth": 374,
    "totalIssued": 8420,
    "activeCenters": 42
  }
}
```

---

### 2. Get Certificate Issuance Trend

Get certificate issuance data over time.

```http
GET /ministry/analytics/issuance
```

**Query Parameters:**
- `period` (required): "days" | "months" | "years"

**Response:**
```json
{
  "data": [
    { "period": "Jan", "certificates": 520 },
    { "period": "Feb", "certificates": 610 },
    { "period": "Mar", "certificates": 780 }
  ],
  "growth": "+12%"
}
```

---

### 3. Get Candidates for Review

Get list of passed candidates pending certificate issuance.

```http
GET /ministry/review/candidates
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected)
- `centerId` (optional): Filter by center
- `search` (optional): Search by name, CNIC, or registration ID

**Response:**
```json
{
  "candidates": [
    {
      "id": "REG-2024-001",
      "name": "Muhammad Ahmed",
      "cnic": "35201-1234567-1",
      "score": "85%",
      "date": "Jan 25, 2024",
      "center": "Lahore Training Center #3",
      "status": "Pending Review",
      "phone": "0300-1234567",
      "email": "ahmed@example.com",
      "photo": "https://...",
      "documents": [...]
    }
  ]
}
```

---

### 4. Approve Certificate Issuance

Approve a candidate for certificate issuance.

```http
POST /ministry/review/candidates/:candidateId/approve
```

**Request Body:**
```json
{
  "notes": "All criteria met, approved for certificate"
}
```

**Response:**
```json
{
  "success": true,
  "certificate": {
    "id": "cert-123",
    "certificateNumber": "CERT-2024-12345",
    "issuedTo": "Muhammad Ahmed",
    "issuedDate": "2024-02-01",
    "expiryDate": "2029-02-01"
  }
}
```

---

### 5. Bulk Approve Certificates

Approve multiple candidates for certificate issuance.

```http
POST /ministry/review/bulk-approve
```

**Request Body:**
```json
{
  "candidateIds": ["REG-2024-001", "REG-2024-002", "REG-2024-003"]
}
```

**Response:**
```json
{
  "success": true,
  "approved": 3,
  "certificates": [
    { "candidateId": "REG-2024-001", "certificateNumber": "CERT-2024-12345" },
    { "candidateId": "REG-2024-002", "certificateNumber": "CERT-2024-12346" }
  ]
}
```

---

### 6. Reject Certificate Issuance

Reject a candidate for certificate issuance.

```http
POST /ministry/review/candidates/:candidateId/reject
```

**Request Body:**
```json
{
  "reason": "Document verification failed"
}
```

---

### 7. Get Certificate Registry

Get list of all issued certificates.

```http
GET /ministry/certificates
```

**Query Parameters:**
- `search` (optional): Search by certificate number, name, or CNIC
- `startDate` (optional): Filter by issue date
- `endDate` (optional): Filter by issue date

**Response:**
```json
{
  "certificates": [
    {
      "id": "cert-123",
      "certificateNumber": "CERT-2024-12345",
      "holderName": "Muhammad Ahmed",
      "cnic": "35201-1234567-1",
      "issuedDate": "2024-02-01",
      "expiryDate": "2029-02-01",
      "score": 85,
      "center": "Lahore Training Center #3",
      "status": "valid" | "expired" | "revoked"
    }
  ]
}
```

---

### 8. Verify Certificate

Public endpoint to verify certificate authenticity.

```http
GET /verify/:certificateNumber
```

**Response:**
```json
{
  "valid": true,
  "certificate": {
    "certificateNumber": "CERT-2024-12345",
    "holderName": "Muhammad Ahmed",
    "issuedDate": "2024-02-01",
    "expiryDate": "2029-02-01",
    "status": "valid",
    "issuingAuthority": "Ministry of Skill Development"
  }
}
```

---

### 9. Revoke Certificate

Revoke an issued certificate.

```http
POST /ministry/certificates/:certificateId/revoke
```

**Request Body:**
```json
{
  "reason": "Fraudulent documents discovered"
}
```

---

### 10. Get Issuance Logs

Get certificate issuance audit logs.

```http
GET /ministry/logs
```

**Query Parameters:**
- `startDate` (optional): Filter start date
- `endDate` (optional): Filter end date
- `action` (optional): Filter by action (issued, revoked)

**Response:**
```json
{
  "logs": [
    {
      "id": "log-456",
      "action": "CERTIFICATE_ISSUED",
      "certificateNumber": "CERT-2024-12345",
      "candidateName": "Muhammad Ahmed",
      "issuedBy": "ministry-user-123",
      "timestamp": "2024-02-01T10:30:00Z"
    }
  ]
}
```

---

### 11. Get Center Oversight Data

Get center performance data for oversight.

```http
GET /ministry/centers/oversight
```

**Response:**
```json
{
  "centers": [
    {
      "id": "LHR-003",
      "name": "Lahore Training Center #3",
      "totalExams": 1250,
      "passRate": "89%",
      "averageScore": 78.5,
      "attendanceRate": "92%",
      "issues": 0,
      "lastInspection": "2024-01-15"
    }
  ]
}
```

---

## Data Models

### Candidate
```typescript
interface Candidate {
  id: string;                    // Registration ID (e.g., "REG-2024-001")
  fullName: string;
  fatherName: string;
  cnic: string;                  // CNIC format: 35201-1234567-1
  dob: string;                   // ISO date
  phone: string;
  email?: string;
  city: string;
  address?: string;
  registrationStatus: "incomplete" | "pending" | "complete";
  paymentStatus: "unpaid" | "pending" | "paid";
  examStatus: "not_scheduled" | "scheduled" | "pending_verification" | "verified" | "in_progress" | "completed" | "absent";
  examScore?: number;
  certificateNumber?: string;
  photo?: string;                // URL or base64
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}
```

### Document
```typescript
interface Document {
  id: string;
  name: string;                  // e.g., "Candidate Photo", "CNIC Front"
  type: string;                  // e.g., "Image", "PDF", "Image/PDF"
  isMandatory: boolean;
  status: "pending" | "uploading" | "complete" | "error";
  fileName?: string;
  fileUrl?: string;
  fileData?: string;             // Base64 encoded (for local storage)
  fileType?: string;             // MIME type
  uploadDate?: string;
}
```

### Center
```typescript
interface Center {
  id: string;                    // e.g., "LHR-003"
  name: string;
  location: string;              // City
  address: string;
  capacity: number;
  status: "active" | "inactive" | "maintenance";
  contactPerson: string;
  phone: string;
  email: string;
  established: string;           // ISO date
  attendance?: string;           // Percentage
}
```

### Question
```typescript
interface Question {
  id: number;
  text: string;
  category: string;              // e.g., "Safety", "General", "Technical"
  options: string[];             // Array of 4 options
  correctAnswer: string;
  createdAt: string;
  updatedAt: string;
}
```

### ExamSession
```typescript
interface ExamSession {
  id: string;
  centerId: string;
  date: string;
  slotTime: string;
  candidates: string[];          // Candidate IDs
  status: "waiting" | "ready" | "in_progress" | "completed";
  startTime?: string;
  endTime?: string;
}
```

### ExamResult
```typescript
interface ExamResult {
  id: string;
  candidateId: string;
  examSessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  completedAt: string;
  answers: {
    questionId: number;
    selectedOption: string;
    isCorrect: boolean;
  }[];
}
```

### Certificate
```typescript
interface Certificate {
  id: string;
  certificateNumber: string;     // e.g., "CERT-2024-12345"
  candidateId: string;
  holderName: string;
  cnic: string;
  examDate: string;
  score: number;
  issuedDate: string;
  expiryDate: string;
  issuedBy: string;              // Ministry user ID
  status: "valid" | "expired" | "revoked";
  revokedAt?: string;
  revokedReason?: string;
  downloadUrl: string;
  verificationUrl: string;
}
```

### AdminUser
```typescript
interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "center_admin" | "super_admin" | "ministry";
  centerId?: string;             // Only for center_admin
  status: "active" | "inactive" | "suspended";
  lastLogin?: string;
  createdAt: string;
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Insufficient permissions for this action |
| `NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body or parameters |
| `DUPLICATE_ENTRY` | 409 | Resource already exists (e.g., duplicate CNIC) |
| `EXAM_NOT_STARTED` | 400 | Exam session has not been started by center admin |
| `EXAM_ALREADY_COMPLETED` | 400 | Candidate has already completed the exam |
| `SLOT_FULL` | 400 | No available seats in the selected exam slot |
| `DOCUMENTS_INCOMPLETE` | 400 | Required documents not uploaded |
| `PAYMENT_REQUIRED` | 402 | Payment not completed for registration |
| `SESSION_EXPIRED` | 401 | Exam session has expired |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid CNIC format",
    "details": {
      "field": "cnic",
      "expected": "XXXXX-XXXXXXX-X",
      "received": "35201123456"
    }
  }
}
```

---

## Rate Limiting

API requests are rate-limited based on the user role:

| Role | Requests/Minute | Requests/Hour |
|------|-----------------|---------------|
| Candidate | 60 | 1000 |
| Center Admin | 120 | 2000 |
| Super Admin | 300 | 5000 |
| Ministry | 300 | 5000 |
| Public (verification) | 30 | 500 |

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1706234400
```

---

## Webhooks (Optional)

The system can send webhooks for important events:

### Event Types
- `candidate.registered` - New candidate registration
- `exam.completed` - Candidate completed exam
- `exam.passed` - Candidate passed exam
- `certificate.issued` - Certificate issued
- `certificate.revoked` - Certificate revoked

### Webhook Payload
```json
{
  "event": "certificate.issued",
  "timestamp": "2024-02-01T10:30:00Z",
  "data": {
    "certificateNumber": "CERT-2024-12345",
    "candidateId": "REG-2024-001",
    "candidateName": "Muhammad Ahmed"
  }
}
```

---

*Document Version: 1.0*  
*Last Updated: January 2024*
