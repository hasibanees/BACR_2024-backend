import jwt from "jsonwebtoken";
import User from "../models/User.js";

const RoleAccess = (moduleName) => async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  
  if (!token) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("role").populate("modulesAccess");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasAccessToModule = user.modulesAccess.some(
      (module) => module.name === moduleName
    );

    if (!hasAccessToModule) {
      return res.status(403).json({ message: "You don't have access to this module" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};
export default RoleAccess;

