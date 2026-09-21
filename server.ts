import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const CONFIG_FILE = path.join(process.cwd(), "public-config.json");
const LOCKED_AVATAR_FILE = path.join(process.cwd(), "locked-avatar.txt");

const DEFAULT_CONFIG = {
  channelName: "ALPHA BHAI",
  badgeText: "OFFICIAL TELEGRAM CHANNEL",
  topBadgeText: "TOP",
  membersCount: "28.5K+",
  telegramLink: "https://t.me/+mVO1R7zmazwyMDg9",
  avatarUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop",
  isLive: true,
  liveBadgeText: "LIVE",
  buttonText: "JOIN NOW",
  autoRedirect: false,
  showBrowserBar: false,
  browserUrl: "",
  browserPlatform: "",
  footerText: "© 2026 JACK AGENCY",
};

// 1000% Lock Mechanism for User's Gallery Avatar
function getLockedAvatar(): string | null {
  try {
    if (fs.existsSync(LOCKED_AVATAR_FILE)) {
      const data = fs.readFileSync(LOCKED_AVATAR_FILE, "utf-8").trim();
      if (data && data.length > 50) {
        return data;
      }
    }
  } catch (err) {
    console.error("Error reading locked avatar file:", err);
  }
  return null;
}

function setLockedAvatar(avatarUrl: string) {
  try {
    if (avatarUrl && avatarUrl.length > 50) {
      fs.writeFileSync(LOCKED_AVATAR_FILE, avatarUrl, "utf-8");
      return true;
    }
  } catch (err) {
    console.error("Error saving locked avatar file:", err);
  }
  return false;
}

function readConfig() {
  let cfg = { ...DEFAULT_CONFIG };
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      cfg = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error("Error reading config file:", err);
  }

  // Always enforce the 1000% locked gallery avatar if it exists
  const lockedAvatar = getLockedAvatar();
  if (lockedAvatar) {
    cfg.avatarUrl = lockedAvatar;
  }

  // Enforce requested direct telegram link
  cfg.telegramLink = "https://t.me/+mVO1R7zmazwyMDg9";
  cfg.buttonText = "JOIN NOW";
  cfg.autoRedirect = false;
  cfg.showBrowserBar = false;

  return cfg;
}

function writeConfig(config: any) {
  try {
    // Check if new avatar is being uploaded from gallery
    if (config.isNewGalleryUpload && config.avatarUrl) {
      setLockedAvatar(config.avatarUrl);
    } else {
      // Retain the locked avatar permanently so no other edits can change it
      const lockedAvatar = getLockedAvatar();
      if (lockedAvatar) {
        config.avatarUrl = lockedAvatar;
      }
    }

    delete config.isNewGalleryUpload;
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing config file:", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 image uploads from mobile phone galleries
  app.use(express.json({ limit: "35mb" }));
  app.use(express.urlencoded({ limit: "35mb", extended: true }));

  // API endpoints to 1000% lock public link image and settings
  app.get("/api/config", (req, res) => {
    const config = readConfig();
    res.json(config);
  });

  // Dedicated upload & 1000% lock endpoint for gallery photo
  app.post("/api/lock-avatar", (req, res) => {
    try {
      const { avatarUrl } = req.body;
      if (!avatarUrl || avatarUrl.length < 50) {
        return res.status(400).json({ success: false, error: "Invalid image" });
      }
      setLockedAvatar(avatarUrl);
      const current = readConfig();
      current.avatarUrl = avatarUrl;
      writeConfig(current);
      res.json({ success: true, avatarUrl });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // General config endpoint: edits any field WITHOUT touching the locked gallery DP
  app.post("/api/config", (req, res) => {
    try {
      const current = readConfig();
      const updated = {
        ...current,
        ...req.body,
        telegramLink: "https://t.me/+mVO1R7zmazwyMDg9",
        buttonText: "JOIN NOW",
        autoRedirect: false,
        showBrowserBar: false,
      };

      // Ensure locked avatar is 1000% preserved
      const lockedAvatar = getLockedAvatar();
      if (req.body.isNewGalleryUpload && req.body.avatarUrl) {
        setLockedAvatar(req.body.avatarUrl);
        updated.avatarUrl = req.body.avatarUrl;
      } else if (lockedAvatar) {
        updated.avatarUrl = lockedAvatar;
      }

      writeConfig(updated);
      res.json({ success: true, config: updated });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });

  // Reset other settings, but STILL KEEP the locked gallery avatar!
  app.post("/api/reset-config", (req, res) => {
    const lockedAvatar = getLockedAvatar();
    const fresh = {
      ...DEFAULT_CONFIG,
      avatarUrl: lockedAvatar || DEFAULT_CONFIG.avatarUrl,
    };
    writeConfig(fresh);
    res.json({ success: true, config: fresh });
  });

  // Vite middleware for dev or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
