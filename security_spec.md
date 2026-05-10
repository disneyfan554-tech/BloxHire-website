# Security Spec

## Data Invariants
1. A job post cannot exist without a valid author.
2. Only admins can close a job post.
3. Job posts must have a valid type ('scripting' or 'building').

## The "Dirty Dozen" Payloads
1. Create job with invalid type: `{ "title": "...", "description": "...", "type": "foo", "status": "open", "authorId": "..." }`
2. Update job status with non-admin: `{ "status": "closed" }` (by non-admin)
3. Inject script in description: `{ "description": "<script>alert(1)</script>" }`
4. Set negative budget: `{ "budget": -100 }`
5. Overly long title: `{ "title": "A".repeat(1000) }`

...plus 7 more.

## Test Runner
(To be implemented in firestore.rules.test.ts)
