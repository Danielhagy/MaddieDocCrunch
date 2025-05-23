const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/database");

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, displayName } = req.body;

      // Check if user exists
      db.get(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [username, email],
        async (err, existingUser) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          if (existingUser) {
            return res
              .status(400)
              .json({ error: "Username or email already exists" });
          }

          try {
            const hashedPassword = await bcrypt.hash(password, 12);

            const stmt = db.prepare(`
            INSERT INTO users (username, email, password_hash, display_name)
            VALUES (?, ?, ?, ?)
          `);

            stmt.run(
              [username, email, hashedPassword, displayName || username],
              function (err) {
                stmt.finalize();

                if (err) {
                  console.error("Insert error:", err);
                  return res
                    .status(500)
                    .json({ error: "Failed to create user" });
                }

                const token = jwt.sign(
                  { id: this.lastID, username },
                  process.env.JWT_SECRET,
                  { expiresIn: "7d" }
                );

                res.status(201).json({
                  message: "User created successfully",
                  token,
                  user: {
                    id: this.lastID,
                    username,
                    email,
                    displayName: displayName || username,
                  },
                });
              }
            );
          } catch (hashError) {
            console.error("Hashing error:", hashError);
            res.status(500).json({ error: "Failed to process password" });
          }
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      db.get(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        [username, username],
        async (err, user) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
          }

          if (!user || !user.password_hash) {
            return res.status(401).json({ error: "Invalid credentials" });
          }

          try {
            const isValidPassword = await bcrypt.compare(
              password,
              user.password_hash
            );

            if (!isValidPassword) {
              return res.status(401).json({ error: "Invalid credentials" });
            }

            const token = jwt.sign(
              { id: user.id, username: user.username },
              process.env.JWT_SECRET,
              { expiresIn: "7d" }
            );

            res.json({
              message: "Login successful",
              token,
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.display_name,
                avatarUrl: user.avatar_url,
              },
            });
          } catch (compareError) {
            console.error("Password comparison error:", compareError);
            res.status(500).json({ error: "Authentication failed" });
          }
        }
      );
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }

  static async getProfile(req, res) {
    try {
      db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, user) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        res.json({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
          },
        });
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: "Failed to get profile" });
    }
  }

  static async logout(req, res) {
    res.json({ message: "Logout successful" });
  }
}

module.exports = AuthController;
