#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const srcDir = path.join(__dirname, "src", "components");
const PACKAGE_NAME = "my-ui-lib";

// Guard: only run if installed in a consumer project
const isBeingLinked = process.env.npm_lifecycle_event === "prepublish" || process.env.npm_config_global;

const appRoot = process.cwd();
if (appRoot.includes(`node_modules/${PACKAGE_NAME}`) || appRoot === __dirname) {
    console.log("ℹ️ Skipping component copy in dev or global install");
    process.exit(0);
}

const targetDir = path.join(appRoot, "src", "components", "modules");

function hashFile(filePath) {
    const data = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(data).digest("hex");
}

function copyOrUpdate(filePath, destPath) {
    if (!fs.existsSync(destPath)) {
        fs.copyFileSync(filePath, destPath);
        console.log("🆕 Added:", path.basename(filePath));
    } else {
        const srcHash = hashFile(filePath);
        const destHash = hashFile(destPath);
        if (srcHash !== destHash) {
            fs.copyFileSync(filePath, destPath);
            console.log("🔄 Updated:", path.basename(filePath));
        } else {
            console.log("✅ Up-to-date:", path.basename(filePath));
        }
    }
}

function syncComponents() {
    if (!fs.existsSync(srcDir)) {
        console.warn("❌ Components directory not found:", srcDir);
        return;
    }

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const files = fs.readdirSync(srcDir);
    files.forEach((file) => {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(targetDir, file);
        copyOrUpdate(srcFile, destFile);
    });
}

syncComponents();
