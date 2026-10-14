/**
 * Tests for Real-Time Notification System
 * Using Node.js built-in test runner
 */

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');

const {
  Notification,
  NotificationService,
  GameEngine,
  SocialSystem
} = require('./main.js');

// ============================================================================
// MOCK NOTIFICATION CLIENT FOR TESTING
// ============================================================================

class MockNotificationClient {
  constructor() {
    this.deliveredNotifications = [];
  }

  deliver(notification) {
    this.deliveredNotifications.push(notification);
  }

  getDelivered() {
    return this.deliveredNotifications;
  }

  clear() {
    this.deliveredNotifications = [];
  }
}

// ============================================================================
// TESTS
// ============================================================================

describe('Notification Class', () => {
  test('should create notification with correct properties', () => {
    const notification = new Notification(1, 'level_up', 'You leveled up!');
    
    assert.strictEqual(notification.userId, 1);
    assert.strictEqual(notification.type, 'level_up');
    assert.strictEqual(notification.message, 'You leveled up!');
    assert.ok(notification.timestamp instanceof Date);
  });
});

describe('NotificationService', () => {
  let mockClient;
  let service;

  beforeEach(() => {
    mockClient = new MockNotificationClient();
    service = new NotificationService(mockClient);
  });

  test('should deliver notification when preferences allow', () => {
    service.setUserPreferences(1, { game: true, social: true });
    
    const notification = new Notification(1, 'level_up', 'Test message');
    service.send(notification);

    assert.strictEqual(mockClient.getDelivered().length, 1);
    assert.strictEqual(mockClient.getDelivered()[0].message, 'Test message');
  });

  test('should block game notifications when game preference is disabled', () => {
    service.setUserPreferences(1, { game: false, social: true });
    
    const notification = new Notification(1, 'level_up', 'Test message');
    service.send(notification);

    assert.strictEqual(mockClient.getDelivered().length, 0);
  });

  test('should block social notifications when social preference is disabled', () => {
    service.setUserPreferences(1, { game: true, social: false });
    
    const notification = new Notification(1, 'friend_request', 'Test message');
    service.send(notification);

    assert.strictEqual(mockClient.getDelivered().length, 0);
  });

  test('should default to all notifications enabled when no preferences set', () => {
    const gameNotification = new Notification(1, 'level_up', 'Game message');
    const socialNotification = new Notification(1, 'friend_request', 'Social message');
    
    service.send(gameNotification);
    service.send(socialNotification);

    assert.strictEqual(mockClient.getDelivered().length, 2);
  });

  test('should categorize notification types correctly', () => {
    assert.strictEqual(service.getCategory('level_up'), 'game');
    assert.strictEqual(service.getCategory('item_acquired'), 'game');
    assert.strictEqual(service.getCategory('challenge_completed'), 'game');
    assert.strictEqual(service.getCategory('pvp_event'), 'game');
    assert.strictEqual(service.getCategory('friend_request'), 'social');
    assert.strictEqual(service.getCategory('friend_accepted'), 'social');
    assert.strictEqual(service.getCategory('new_follower'), 'social');
  });
});

describe('GameEngine Events', () => {
  let mockClient;
  let service;
  let gameEngine;

  beforeEach(() => {
    mockClient = new MockNotificationClient();
    service = new NotificationService(mockClient);
    gameEngine = new GameEngine(service);
  });

  test('should trigger level up notification', () => {
    gameEngine.playerLeveledUp(1, 15);

    assert.strictEqual(mockClient.getDelivered().length, 1);
    const notification = mockClient.getDelivered()[0];
    assert.strictEqual(notification.userId, 1);
    assert.strictEqual(notification.type, 'level_up');
    assert.ok(notification.message.includes('level 15'));
  });

  test('should trigger item acquired notification', () => {
    gameEngine.itemAcquired(2, 'Sword of Azeroth');

    assert.strictEqual(mockClient.getDelivered().length, 1);
    const notification = mockClient.getDelivered()[0];
    assert.strictEqual(notification.userId, 2);
    assert.strictEqual(notification.type, 'item_acquired');
    assert.ok(notification.message.includes('Sword of Azeroth'));
  });

  test('should trigger challenge completed notification', () => {
    gameEngine.challengeCompleted(3, 'Dragon Quest');

    assert.strictEqual(mockClient.getDelivered().length, 1);
    const notification = mockClient.getDelivered()[0];
    assert.strictEqual(notification.userId, 3);
    assert.strictEqual(notification.type, 'challenge_completed');
    assert.ok(notification.message.includes('Dragon Quest'));
  });

  test('should trigger PvP event notification', () => {
    gameEngine.pvpEvent(1, 'attacked', 'DarkKnight');

    assert.strictEqual(mockClient.getDelivered().length, 1);
    const notification = mockClient.getDelivered()[0];
    assert.strictEqual(notification.userId, 1);
    assert.strictEqual(notification.type, 'pvp_event');
    assert.ok(notification.message.includes('DarkKnight'));
  });
});

describe('SocialSystem Events', () => {
  let mockClient;
  let service;
  let socialSystem;

  beforeEach(() => {
    mockClient = new MockNotificationClient();
    service = new NotificationService(mockClient);
    socialSystem = new SocialSystem(service);
  });

  test('should send friend request notification to receiver', () => {
    socialSystem.friendRequestSent(3, 1);

    assert.strictEqual(mockClient.getDelivered().length, 1);
    const notification = mockClient.getDelivered()[0];
    assert.strictEqual(notification.userId, 1, 'Should notify receiver (user 1)');
    assert.strictEqual(notification.type, 'friend_request');
    assert.ok(notification.message.includes("'3'"));
  });

  test('should send friend accepted notification to original requester', () => {
    socialSystem.friendRequestAccepted(1, 3);

    assert.strictEqual(mockClient.getDelivered().length, 1);
    const notification = mockClient.getDelivered()[0];
    assert.strictEqual(notification.userId, 3, 'Should notify original requester (user 3)');
    assert.strictEqual(notification.type, 'friend_accepted');
    assert.ok(notification.message.includes("'1'"));
  });

  test('should send new follower notification to followed user', () => {
    socialSystem.newFollower(4, 1);

    assert.strictEqual(mockClient.getDelivered().length, 1);
    const notification = mockClient.getDelivered()[0];
    assert.strictEqual(notification.userId, 1, 'Should notify followed user (user 1)');
    assert.strictEqual(notification.type, 'new_follower');
    assert.ok(notification.message.includes("'4'"));
  });
});

describe('Integration: Full Event Flow', () => {
  let mockClient;
  let service;
  let gameEngine;
  let socialSystem;

  beforeEach(() => {
    mockClient = new MockNotificationClient();
    service = new NotificationService(mockClient);
    gameEngine = new GameEngine(service);
    socialSystem = new SocialSystem(service);
  });

  test('should handle multiple events for same user', () => {
    gameEngine.playerLeveledUp(1, 10);
    gameEngine.itemAcquired(1, 'Magic Sword');
    socialSystem.friendRequestSent(2, 1);

    assert.strictEqual(mockClient.getDelivered().length, 3);
    assert.strictEqual(mockClient.getDelivered()[0].type, 'level_up');
    assert.strictEqual(mockClient.getDelivered()[1].type, 'item_acquired');
    assert.strictEqual(mockClient.getDelivered()[2].type, 'friend_request');
  });

  test('should respect mixed preferences', () => {
    service.setUserPreferences(1, { game: true, social: false });

    gameEngine.playerLeveledUp(1, 5);
    socialSystem.friendRequestSent(2, 1);

    assert.strictEqual(mockClient.getDelivered().length, 1);
    assert.strictEqual(mockClient.getDelivered()[0].type, 'level_up');
  });

  test('should handle events for multiple users with different preferences', () => {
    service.setUserPreferences(1, { game: true, social: true });
    service.setUserPreferences(2, { game: false, social: true });

    gameEngine.playerLeveledUp(1, 10);
    gameEngine.itemAcquired(2, 'Sword');
    socialSystem.friendRequestSent(1, 2);

    assert.strictEqual(mockClient.getDelivered().length, 2);
    assert.strictEqual(mockClient.getDelivered()[0].userId, 1);
    assert.strictEqual(mockClient.getDelivered()[1].userId, 2);
    assert.strictEqual(mockClient.getDelivered()[1].type, 'friend_request');
  });
});
