const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// GET all users
router.get("/users", async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Database error: " + error.message });
  }
});

module.exports = router;
