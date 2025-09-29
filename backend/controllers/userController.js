const jwt = require("jsonwebtoken");
const { dbGet, dbAll, dbRun } = require("../utils/dbHelpers");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await dbAll(
      "SELECT id, username, email, created_at, last_login FROM users ORDER BY created_at DESC"
    );
    res.json({ totalUsers: users.length, users });
  } catch (error) {
    res.status(500).json({ error: "Database error: " + error.message });
  }
};

// Profile (protected route)
exports.getProfile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await dbGet(
      "SELECT id, username, email, created_at, last_login FROM users WHERE id = ? AND is_active = 1",
      [decoded.userId]
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

//  Reset users (testing only)
exports.resetUsers = async (req, res) => {
  try {
    await dbRun("DELETE FROM users");
    await dbRun("ALTER TABLE users AUTO_INCREMENT = 1");
    res.json({ message: "All users deleted", totalUsers: 0 });
  } catch (error) {
    res.status(500).json({ error: "Database error: " + error.message });
  }
};
