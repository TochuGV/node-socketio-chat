const MESSAGE_LIMIT = 10;
const TIME_WINDOW = 60 * 1000; // 60 Segundos

class SessionStore {
  constructor() {
    this.userSessions = new Map(); // userId -> socketId
    this.messageRateLimits = new Map(); // userId -> { count, resetTime }
  };

  saveSession(userId, socketId) {
    this.userSessions.set(userId, socketId);
  };

  getSession(userId) {
    return this.userSessions.get(userId);
  };

  hasSession(userId) {
    return this.userSessions.has(userId);
  };

  removeSession(userId) {
    this.userSessions.delete(userId);
  };

  checkRateLimit(userId) {
    const now = Date.now();
    const userLimit = this.messageRateLimits.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      this.messageRateLimits.set(userId, {
        count: 1,
        resetTime: now + TIME_WINDOW
      });
      return { allowed: true };
    }

    if (userLimit.count >= MESSAGE_LIMIT) {
      const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    };

    userLimit.count++;
    return { allowed: true };
  };
};

export default new SessionStore();