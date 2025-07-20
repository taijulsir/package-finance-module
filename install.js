#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PACKAGE_NAME = "finance-modules-ui-lib";

const srcRoot = path.join(__dirname, "src");

// 🔍 Auto-detect all folders inside /src
const sourceDirs = fs.readdirSync(srcRoot)
  .map(name => path.join(srcRoot, name))
  .filter(p => fs.statSync(p).isDirectory());

const appRoot = process.cwd();
if (appRoot.includes(`node_modules/${PACKAGE_NAME}`) || appRoot === __dirname) {
  console.log("ℹ️ Skipping install in dev or global CLI usage.");
  process.exit(0);
}

const targetRoot = path.join(appRoot, "src");

function hashFile(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(data).digest("hex");
}

function copyOrUpdateFile(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(src, dest);
    console.log("🆕 Added:", path.relative(appRoot, dest));
  } else {
    const srcHash = hashFile(src);
    const destHash = hashFile(dest);
    if (srcHash !== destHash) {
      fs.copyFileSync(src, dest);
      console.log("🔄 Updated:", path.relative(appRoot, dest));
    } else {
      console.log("✅ Up-to-date:", path.relative(appRoot, dest));
    }
  }
}

function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      copyOrUpdateFile(srcPath, destPath);
    }
  }
}

function syncAllSources() {
  for (const srcDir of sourceDirs) {
    const relative = path.relative(srcRoot, srcDir);
    const destDir = path.join(targetRoot, relative);
    copyFolderRecursive(srcDir, destDir);
  }
}

function install() {
  syncAllSources();
}

module.exports = { install };
