import jwt from "jsonwebtoken";
import User from "../models/User.js";

function getBearerToken(authorizationHeader = "") {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice(7);
}

export async function authRequired(req, res, next) {
  try {
    const token = getBearerToken(req.headers.authorization || "");

    if (!token) {
      return res.status(401).json({ message: "Missing auth token" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).lean(false);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function premiumRequired(req, res, next) {
  if (!req.user?.isPremium) {
    return res.status(403).json({ message: "Premium plan required" });
  }

  next();
}
