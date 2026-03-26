import jwt from "jsonwebtoken";

// Helper function to verify token and attach user to request
function verifyAndAttachUser(token, req, res, next) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    return true;
  } catch (err) {
    return false;
  }
}

// Main authentication middleware (works for both API and page requests)
export function requireAuth(req, res, next) {
  // 1. Check Authorization header (for API requests)
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (verifyAndAttachUser(token, req, res, next)) {
      return next();
    }
  }
  
  // 2. Check cookie (for page navigation)
  const tokenFromCookie = req.cookies?.token;
  
  if (tokenFromCookie) {
    if (verifyAndAttachUser(tokenFromCookie, req, res, next)) {
      return next();
    }
  }
  
  // 3. Check if this is an API request or page request
  // API requests should return JSON, page requests should redirect to login
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      ok: false,
      error: "Authentication required",
    });
  } else {
    // For page navigation, redirect to login
    return res.redirect('/login.html');
  }
}

// Role-based authorization middleware
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      if (req.path.startsWith('/api/')) {
        return res.status(401).json({
          ok: false,
          error: "Authentication required",
        });
      } else {
        return res.redirect('/login.html');
      }
    }

    if (!allowedRoles.includes(req.user.role)) {
      if (req.path.startsWith('/api/')) {
        return res.status(403).json({
          ok: false,
          error: "Forbidden",
        });
      } else {
        return res.status(403).send("Access denied");
      }
    }

    next();
  };
}