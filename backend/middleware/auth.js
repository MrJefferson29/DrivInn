const jwt = require("jsonwebtoken");
const User = require("../models/user");

// JWT Token verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "yoursecretkey"
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid token. User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Role-based authorization middleware
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(
          ", "
        )}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const authorizePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    // Admin has all permissions
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user has all required permissions
    const hasAllPermissions = permissions.every((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        message: `Access denied. Required permissions: ${permissions.join(
          ", "
        )}`,
      });
    }

    next();
  };
};

// Resource ownership verification middleware
const verifyOwnership = (resourceModel, resourceIdParam = "id") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required." });
      }

      const resourceId = req.params[resourceIdParam];
      const resource = await resourceModel.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ message: "Resource not found." });
      }

      // Admin can access any resource
      if (req.user.role === "admin") {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      const ownerField = resource.owner ? "owner" : "userId";
      if (resource[ownerField].toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Access denied. You do not own this resource." });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
};

// Guest-specific middleware
const requireGuest = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (
    req.user.role !== "guest" &&
    req.user.role !== "host" &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json({ message: "Access denied. Guest access required." });
  }

  next();
};

// Host-specific middleware
const requireHost = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (req.user.role !== "host" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Host access required." });
  }

  next();
};

// Admin-specific middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Access denied. Admin access required." });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "yoursecretkey"
      );
      const user = await User.findById(decoded.userId).select("-password");
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Rate limiting middleware (basic implementation)
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(ip)) {
      requests.set(
        ip,
        requests.get(ip).filter((timestamp) => timestamp > windowStart)
      );
    } else {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    userRequests.push(now);
    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRole,
  authorizePermission,
  verifyOwnership,
  requireGuest,
  requireHost,
  requireAdmin,
  optionalAuth,
  rateLimit,
};
