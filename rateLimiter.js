// RateLimiter.js
class RateLimiter {
  constructor(rateLimitWindowMs, maxRequestsPerWindow) {
    this.rateLimitWindowMs = rateLimitWindowMs;
    this.maxRequestsPerWindow = maxRequestsPerWindow;
    this.requestCounts = new Map();
  }

  middleware(req, res, next) {
    const ipAddress = req.ip; // Assuming IP-based rate limiting

    if (this.requestCounts.has(ipAddress)) {
      const currentTimestamp = Date.now();
      const { count, timestamp } = this.requestCounts.get(ipAddress);
      const timeElapsed = currentTimestamp - timestamp;

      if (timeElapsed > this.rateLimitWindowMs) {
        this.requestCounts.set(ipAddress, {
          count: 1,
          timestamp: currentTimestamp,
        });
      } else {
        if (count >= this.maxRequestsPerWindow) {
          return res.sendStatus(429);
        } else {
          this.requestCounts.set(ipAddress, { count: count + 1, timestamp });
        }
      }
    } else {
      this.requestCounts.set(ipAddress, {
        count: 1,
        timestamp: Date.now(),
      });
    }

    next();
  }
}

module.exports = RateLimiter;
