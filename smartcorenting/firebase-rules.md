# Firebase Security Rules

**Version:** 2.1  
**Last Updated:** February 26, 2026

## Firestore Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read/write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow other authenticated users to read basic info (for user lookup)
      allow read: if request.auth != null;
    }

    // Conversations collection
    match /conversations/{conversationId} {
      // Allow read/write if user is a participant
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      // Allow create if user will be a participant
      allow create: if request.auth != null &&
        request.auth.uid in request.resource.data.participants;

      // Messages subcollection
      match /messages/{messageId} {
        // Allow read/write if user is a participant of the parent conversation
        allow read, write: if request.auth != null &&
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }

    // Meetings collection
    match /meetings/{meetingId} {
      // Allow read if user is creator or invitee
      allow read: if request.auth != null &&
        (request.auth.uid == resource.data.creatorUid ||
         request.auth.uid == resource.data.inviteeUid);

      // Allow create if user is the creator
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.creatorUid;

      // Allow update if user is creator or invitee
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.creatorUid ||
         request.auth.uid == resource.data.inviteeUid);

      // Allow delete only by creator
      allow delete: if request.auth != null &&
        request.auth.uid == resource.data.creatorUid;
    }
  }
}
```

## Collections Overview

### `/users/{userId}`

- **Read:** Any authenticated user
- **Write:** Only the document owner

### `/conversations/{conversationId}`

- **Read/Write:** Only conversation participants
- **Create:** User must be in participants array

### `/conversations/{conversationId}/messages/{messageId}`

- **Read/Write:** Only conversation participants (checked via parent document)

### `/meetings/{meetingId}`

- **Read:** Creator or invitee only
- **Write (Create):** Only the creator can create
- **Write (Update):** Both creator and invitee can update (accept/reject/reschedule)
- **Delete:** Only creator

## Changelog

### v2.1 (February 26, 2026)

- Added `meetings` collection rules for meeting scheduling feature
- Creator and invitee can read their meetings
- Only creator can create and delete meetings
- Both parties can update meeting status (accept/reject/reschedule)

### v2.0 (Initial)

- Users, conversations, and messages collections
- Basic authentication and participant-based access control
