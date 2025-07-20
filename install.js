#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PACKAGE_NAME = "finance-modules-ui-lib";

const srcRoot = path.join(__dirname, "src");

const appRoot = process.cwd();
const targetRoot = path.join(appRoot, "src", "components", "modules");

function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function copyFile(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log("🆕 Added:", path.relative(srcRoot, src));
  } else {
    const srcHash = hashFile(src);
    const destHash = hashFile(dest);
    if (srcHash !== destHash) {
      fs.copyFileSync(src, dest);
      console.log("🔄 Updated:", path.relative(srcRoot, src));
    } else {
      console.log("✅ Up-to-date:", path.relative(srcRoot, src));
    }
  }
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);

  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    entries.forEach((entry) => {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyRecursive(srcPath, destPath);
    });
  } else if (stat.isFile()) {
    copyFile(src, dest);
  }
}

function install() {
  if (!fs.existsSync(srcRoot)) {
    console.error("❌ Source 'src' folder not found at:", srcRoot);
    process.exit(1);
  }

  // Read all directories inside src/
  const entries = fs.readdirSync(srcRoot, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.isDirectory()) {
      const srcFolder = path.join(srcRoot, entry.name);
      const destFolder = path.join(targetRoot, entry.name);
      copyRecursive(srcFolder, destFolder);
    }
  });
}

// Run install if this script is run directly
if (require.main === module) {
  install();
}

module.exports = { install };
