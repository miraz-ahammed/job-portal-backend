import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

interface DecodedToken {
  id: string;
  role: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: "Not authorized, no token provided" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: "User no longer exists" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Not authorized, invalid or expired token" });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === "admin") {
    next();
    return;
  }
  res.status(403).json({ success: false, message: "Access denied. Admins only." });
};
