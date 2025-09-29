const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { dbGet, dbRun } = require("../utils/dbHelpers");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_key";

// Register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await dbGet(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username.toLowerCase(), email.toLowerCase()]
    );

    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await dbRun(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username.toLowerCase(), email.toLowerCase(), hashedPassword]
    );

    const newUser = await dbGet(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during registration" });
  }
};

//  Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const user = await dbGet(
      "SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1",
      [username.toLowerCase(), username.toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials - User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials - Wrong password" });
    }

    await dbRun("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
};
