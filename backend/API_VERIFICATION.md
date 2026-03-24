# API Verification & End-to-End Flow

This assumes the backend is running locally on `http://localhost:5000`.

## 1. Setup & Seeding

First, seed the database with mock data. Ensure MongoDB Atlas URI is in your `.env`.

```bash
cd backend
npm run seed
```

## 2. Default Test Accounts

All accounts use the password: `password123`

- **Admin**: `admin@socialreward.com`
- **Brand**: `nike@brand.com`
- **Creator**: `creator1@tiktok.com`

---

## 3. End-to-End Verification Flow

You can use Postman, Thunder Client, or the React Frontend.
If using an API client, keep track of the `accessToken` returned from login and attach it as a Bearer token in the `Authorization` header for protected routes.

### Step 1: Login
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Body**: 
  ```json
  { "email": "creator1@tiktok.com", "password": "password123" }
  ```
- *Extract `accessToken` from the response.*

### Step 2: Browse Public Campaigns
- **Method**: `GET`
- **URL**: `/api/public/campaigns`
- *Find a campaign `_id` to join.*

### Step 3: Join Campaign (Creator)
- **Method**: `POST`
- **URL**: `/api/creator/campaigns/<CAMPAIGN_ID>/join`
- **Headers**: `Authorization: Bearer <accessToken>`

### Step 4: Submit Work (Creator)
- **Method**: `POST`
- **URL**: `/api/creator/campaigns/<CAMPAIGN_ID>/submit`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Body**:
  ```json
  {
    "submissionType": "url",
    "contentUrl": "https://tiktok.com/@creator1/video/123",
    "notes": "Here is my submission"
  }
  ```

### Step 5: Review Submission (Brand)
- *Login as Brand (`nike@brand.com`) and get new token*
- **Method**: `GET`
- **URL**: `/api/brand/campaigns/<CAMPAIGN_ID>/submissions`
- *Find the submission `_id`.*
- **Method**: `POST`
- **URL**: `/api/brand/submissions/<SUBMISSION_ID>/approve`

### Step 6: Verify Admin Dashboard
- *Login as Admin (`admin@socialreward.com`) and get new token*
- **Method**: `GET`
- **URL**: `/api/admin/dashboard`
- *Verify the numbers have incremented.*
