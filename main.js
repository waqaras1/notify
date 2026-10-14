/**
 * Real-Time Notification System for Gaming Platform
 * Globalli Coding Challenge
 */

// ============================================================================
// CORE NOTIFICATION CLASS
// ============================================================================

class Notification {
  constructor(userId, type, message) {
    this.userId = userId;
    this.type = type;
    this.message = message;
    this.timestamp = new Date();
  }
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

class NotificationService {
  constructor(notificationClient) {
    this.notificationClient = notificationClient;
    this.userPreferences = new Map();
  }

  /**
   * Set user preferences for notification categories
   * @param {number} userId - The user ID
   * @param {Object} preferences - { game: boolean, social: boolean }
   */
  setUserPreferences(userId, preferences) {
    this.userPreferences.set(userId, preferences);
  }

  /**
   * Get user preferences with defaults
   * @param {number} userId - The user ID
   * @returns {Object} - { game: boolean, social: boolean }
   */
  getUserPreferences(userId) {
    const defaults = { game: true, social: true };
    const userPrefs = this.userPreferences.get(userId);
    
    // Merge with defaults to handle partial preferences
    if (!userPrefs) return defaults;
    return { ...defaults, ...userPrefs };
  }

  /**
   * Determine category for notification type
   * @param {string} type - Notification type
   * @returns {string} - "game" or "social"
   */
  getCategory(type) {
    const gameTypes = ['level_up', 'item_acquired', 'challenge_completed', 'pvp_event'];
    return gameTypes.includes(type) ? 'game' : 'social';
  }

  /**
   * Send a notification if user preferences allow it
   * @param {Notification} notification - The notification to send
   */
  send(notification) {
    const preferences = this.getUserPreferences(notification.userId);
    const category = this.getCategory(notification.type);

    if (preferences[category]) {
      this.notificationClient.deliver(notification);
    }
  }
}

// ============================================================================
// NOTIFICATION CLIENT (MOCK)
// ============================================================================

class InAppNotificationClient {
  deliver(notification) {
    console.log(`[${notification.timestamp.toISOString()}] User ${notification.userId}: ${notification.message}`);
  }
}

// ============================================================================
// GAME ENGINE (SIMULATOR)
// ============================================================================

class GameEngine {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  playerLeveledUp(userId, level) {
    const message = `Congratulations! You've reached level ${level}!`;
    const notification = new Notification(userId, 'level_up', message);
    this.notificationService.send(notification);
  }

  itemAcquired(userId, itemName) {
    const message = `You've acquired the legendary ${itemName}!`;
    const notification = new Notification(userId, 'item_acquired', message);
    this.notificationService.send(notification);
  }

  challengeCompleted(userId, challengeName) {
    const message = `Achievement unlocked! You've completed ${challengeName}!`;
    const notification = new Notification(userId, 'challenge_completed', message);
    this.notificationService.send(notification);
  }

  pvpEvent(userId, eventType, opponentName) {
    const message = eventType === 'attacked' 
      ? `You are under attack by ${opponentName}!`
      : `You were defeated by ${opponentName}.`;
    const notification = new Notification(userId, 'pvp_event', message);
    this.notificationService.send(notification);
  }
}

// ============================================================================
// SOCIAL SYSTEM (SIMULATOR)
// ============================================================================

class SocialSystem {
  constructor(notificationService) {
    this.notificationService = notificationService;
  }

  friendRequestSent(fromUserId, toUserId) {
    const message = `Player '${fromUserId}' has sent you a friend request.`;
    const notification = new Notification(toUserId, 'friend_request', message);
    this.notificationService.send(notification);
  }

  friendRequestAccepted(accepterUserId, originalRequesterId) {
    const message = `Player '${accepterUserId}' has accepted your friend request!`;
    const notification = new Notification(originalRequesterId, 'friend_accepted', message);
    this.notificationService.send(notification);
  }

  newFollower(followerId, followedUserId) {
    const message = `Player '${followerId}' is now following you!`;
    const notification = new Notification(followedUserId, 'new_follower', message);
    this.notificationService.send(notification);
  }
}

// ============================================================================
// DEMO / EXAMPLE USAGE
// ============================================================================

function runDemo() {
  console.log('='.repeat(70));
  console.log('GAMING NOTIFICATION SYSTEM DEMO');
  console.log('='.repeat(70));
  console.log();

  // Setup
  const client = new InAppNotificationClient();
  const notificationService = new NotificationService(client);
  const gameEngine = new GameEngine(notificationService);
  const socialSystem = new SocialSystem(notificationService);

  // Configure user preferences (user 2 has game notifications disabled)
  notificationService.setUserPreferences(2, { game: false, social: true });

  console.log('--- GAME EVENTS ---\n');

  // User 1 leveled up
  gameEngine.playerLeveledUp(1, 15);

  // User 2 acquired item (but has game notifications disabled)
  gameEngine.itemAcquired(2, 'Sword of Azeroth');
  console.log('  ↳ (No notification sent - User 2 has game notifications disabled)\n');

  // User 3 completed challenge
  gameEngine.challengeCompleted(3, 'Dragon Slayer Quest');

  console.log('\n--- SOCIAL EVENTS ---\n');

  // User 3 sends friend request to user 1
  socialSystem.friendRequestSent(3, 1);

  // User 1 accepts friend request from user 3
  socialSystem.friendRequestAccepted(1, 3);

  // User 4 follows user 1
  socialSystem.newFollower(4, 1);

  // User 5 sends friend request to user 2 (social notifications enabled)
  socialSystem.friendRequestSent(5, 2);

  console.log('\n--- ADDITIONAL GAME EVENT ---\n');

  // User 1 experiences PvP event
  gameEngine.pvpEvent(1, 'attacked', 'DarkKnight99');

  console.log('\n' + '='.repeat(70));
  console.log('DEMO COMPLETE');
  console.log('='.repeat(70));
}

// ============================================================================
// EXPORTS (for testing)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Notification,
    NotificationService,
    InAppNotificationClient,
    GameEngine,
    SocialSystem,
    runDemo
  };
}

// Run demo if this is the main file
if (require.main === module) {
  runDemo();
}
