# Gaming Platform Notification System

A real-time notification system for an online gaming platform that handles in-game events and social interactions.

## Overview

This system processes events from a gaming platform and delivers notifications to players based on their preferences. It supports six types of events across two categories: game events and social events.

## Features

### Supported Event Types

**Game Events:**
1. **Level Up** - When a player reaches a new level
2. **Item Acquired** - When a player obtains a rare or valuable item
3. **Challenge Completed** - When a player completes a quest or achievement
4. **PvP Event** - When a player is attacked or defeated by another player

**Social Events:**
5. **Friend Request** - When another player sends a friend request
6. **Friend Accepted** - When a friend request is accepted
7. **New Follower** - When another player starts following

### User Preferences

Users can enable or disable notifications by category:
- **Game Events** - All in-game notifications (level up, items, challenges, PvP)
- **Social Events** - All social notifications (friend requests, follows)

**Default Behavior:** If a user has no preferences set, all notifications are enabled by default.

## Setup

### Prerequisites

- Node.js 18.0.0 or higher (LTS version recommended)
- No external dependencies required

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. No npm install needed - uses only Node.js built-in modules

### Verify Installation

```bash
npm run build
```

This runs a syntax check on all JavaScript files to ensure everything is valid.

## Usage

### Run Demo

```bash
npm start
```

This runs a demonstration showing all six notification types and preference filtering in action.

### Run Tests

```bash
npm test
```

Runs the complete test suite using Node.js built-in test runner. Tests cover:
- Notification class creation
- Preference handling and defaults
- Event type categorization
- All game and social event triggers
- Integration scenarios with multiple users

## Architecture

### Core Components

#### 1. **Notification Class**
Simple data structure holding:
- `userId` - The recipient of the notification
- `type` - Event type (e.g., "level_up", "friend_request")
- `message` - Human-readable notification content
- `timestamp` - When the notification was created

#### 2. **NotificationService**
The central coordinator that:
- Manages user preferences
- Categorizes notification types
- Checks permissions before sending
- Delegates delivery to the notification client

#### 3. **NotificationClient Interface**
Pluggable delivery mechanism:
- `InAppNotificationClient` - Console logging for demo/production
- `MockNotificationClient` - Records notifications for testing

#### 4. **Event Sources**
- **GameEngine** - Simulates game events (leveling, items, challenges, PvP)
- **SocialSystem** - Simulates social events (friends, followers)

### Design Patterns

**Observer Pattern (Event-Driven)**
- Game and social systems emit events
- NotificationService observes and processes them
- Decouples event sources from notification logic

**Strategy Pattern (Delivery)**
- NotificationClient interface allows swapping delivery mechanisms
- Console logging for demo, mock recording for tests
- Easy to add email, push, SMS, or WebSocket delivery

**Dependency Injection**
- Services receive their dependencies via constructor
- Makes testing easier (inject mocks)
- Reduces coupling between components

### Key Design Decisions

**1. Category-Based Preferences**
- Simplified from per-event preferences
- Reduces user configuration complexity
- Easier to maintain as new event types are added
- Trade-off: Less granular control (can't disable just "level up" while keeping "item acquired")

**2. Default-Enabled Notifications**
- Assumption: Users want to be notified by default
- Rationale: Better user engagement for a gaming platform
- Documented clearly for interview discussion

**3. Single-File Implementation**
- All logic in `main.js` for simplicity
- Appropriate for a coding challenge
- In production, would split into modules:
  - `models/Notification.js`
  - `services/NotificationService.js`
  - `clients/InAppNotificationClient.js`
  - `systems/GameEngine.js`
  - `systems/SocialSystem.js`

**4. No External Dependencies**
- Uses only Node.js built-in modules
- Reduces complexity and setup time
- Shows understanding of core JavaScript

**5. Synchronous Delivery**
- Notifications are sent immediately
- Appropriate for in-app notifications
- In production, would use message queue (Redis, RabbitMQ) for:
  - Reliability (retry failed deliveries)
  - Scalability (handle burst traffic)
  - Multiple channels (email, push, SMS)

## Assumptions & Limitations

### Assumptions

1. **User IDs are numeric** - Simplified for the demo
2. **In-app delivery only** - No email, push notifications, or SMS
3. **No persistence** - Notifications aren't stored in a database
4. **Synchronous processing** - Events are handled immediately
5. **No authentication** - Anyone can trigger events (would need auth in production)
6. **No rate limiting** - Could spam users with notifications
7. **Friend request logic is simplified** - No validation that users exist or requests are valid

### Limitations

1. **No notification history** - Users can't view past notifications
2. **No read/unread state** - Can't mark notifications as seen
3. **No notification priority** - All notifications are equal importance
4. **No batching** - Each event = one notification (could be overwhelming)
5. **No localization** - Messages are English-only
6. **No error handling** - Assumes all operations succeed
7. **No concurrency control** - Not thread-safe for concurrent requests

## Future Enhancements

If building this for production, consider adding:

1. **Persistence Layer**
   - Store notifications in database (PostgreSQL, MongoDB)
   - Allow users to view notification history
   - Track read/unread status

2. **Message Queue**
   - Use Redis/RabbitMQ for reliable delivery
   - Handle retries for failed deliveries
   - Support burst traffic without blocking

3. **Multiple Channels**
   - Email notifications
   - Push notifications (mobile/web)
   - SMS for critical events
   - In-game UI components

4. **Advanced Preferences**
   - Per-event type granularity
   - Quiet hours / Do Not Disturb
   - Notification frequency limits
   - Priority levels

5. **Real-Time Delivery**
   - WebSocket connections for instant delivery
   - Server-Sent Events (SSE) as fallback
   - Polling for older clients

6. **Analytics & Monitoring**
   - Track notification delivery rates
   - Measure user engagement
   - Identify notification fatigue
   - A/B test notification content

7. **Scalability**
   - Horizontal scaling with load balancers
   - Dedicated notification service
   - Caching for user preferences
   - CDN for static notification assets

## Testing

The test suite covers:

- ✅ Notification object creation
- ✅ Preference storage and retrieval
- ✅ Default preferences (all enabled)
- ✅ Category-based filtering
- ✅ All six event types
- ✅ Correct recipient identification
- ✅ Multiple users with different preferences
- ✅ Integration scenarios

All tests use a mock notification client that records deliveries instead of printing to console.

## Code Structure

```
main.js              # All application logic
main.test.js         # Comprehensive test suite
package.json         # Project metadata and scripts
README.md            # This file
AI_PROCESS.md        # Development process documentation
```

## Interview Discussion Points

Be prepared to discuss:

1. **Why category-based preferences vs per-event?**
   - Balance between simplicity and control
   - Easier to scale as events are added
   - Reduces decision fatigue for users

2. **Why default to enabled?**
   - Gaming platforms benefit from high engagement
   - Users expect to be notified about achievements
   - Can always opt out if overwhelming

3. **How would you add email notifications?**
   - Create `EmailNotificationClient` implementing same interface
   - Add email addresses to user preferences
   - Use external service (SendGrid, AWS SES)
   - Handle async delivery with callbacks/promises

4. **How would you scale this to millions of users?**
   - Message queue (Kafka, RabbitMQ) for event processing
   - Separate notification service (microservice architecture)
   - Cache user preferences (Redis)
   - Database partitioning/sharding
   - Load balancing across multiple servers

5. **How would you prevent notification spam?**
   - Rate limiting per user
   - Batching similar notifications
   - Importance/priority scoring
   - User-defined quiet hours
   - Adaptive delivery (reduce frequency for inactive users)

6. **What happens if notification delivery fails?**
   - Currently: silent failure (limitation)
   - Production: Retry with exponential backoff
   - Dead letter queue for permanently failed notifications
   - Alerting for delivery issues

7. **How would you test this in production?**
   - Feature flags for gradual rollout
   - Synthetic monitoring (send test notifications)
   - Track delivery metrics
   - User feedback mechanisms
   - A/B testing for notification content

## License

This is a coding challenge submission - no license specified.
