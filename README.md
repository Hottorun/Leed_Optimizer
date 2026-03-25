# Leed_Optimizer

api:
## JSON Request Structure (from your backend to this platform)

**POST to `/api/leads`:**

```json
{
  "name": "Customer Name",
  "phone": "+1234567890",
  "email": "customer@email.com",
  "location": "City, State",
  "workType": "Type of work",
  "conversationSummary": "AI summary",
  "approveMessage": "Pre-crafted approval",
  "declineMessage": "Pre-crafted decline",
  "rating": 4,
  "ratingReason": "Good fit - in our service area with matching work type"
}
```

## Response Structure (sent to your chatbot when user clicks Send)

**Sent to `CHATBOT_WEBHOOK_URL` environment variable:**

```json
{
  "leadId": "lead-123456789",
  "action": "approve" | "decline",
  "message": "The edited message content",
  "phone": "+1234567890"
}
```


Set the `CHATBOT_WEBHOOK_URL` environment variable to configure where responses are sent.


to run:
- pnpm install
- pnpm dev

create .env file
into it put:
`NEXT_PUBLIC_SUPABASE_URL`
`NEXT_PUBLIC_SUPABASE_ANON_KEY`
