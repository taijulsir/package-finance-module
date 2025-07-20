#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const srcDir = path.join(__dirname, "src", "components");
const PACKAGE_NAME = "finance-modules-ui-lib";

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

function copyFileWithHashCheck(srcFile, destFile) {
    if (!fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log("🆕 Added:", path.relative(srcDir, srcFile));
    } else {
        const srcHash = hashFile(srcFile);
        const destHash = hashFile(destFile);
        if (srcHash !== destHash) {
            fs.copyFileSync(srcFile, destFile);
            console.log("🔄 Updated:", path.relative(srcDir, srcFile));
        } else {
            console.log("✅ Up-to-date:", path.relative(srcDir, srcFile));
        }
    }
}

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const items = fs.readdirSync(src);
        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            copyRecursive(srcPath, destPath);
        }
    } else {
        copyFileWithHashCheck(src, dest);
    }
}

function syncComponents() {
    if (!fs.existsSync(srcDir)) {
        console.warn("❌ Components directory not found:", srcDir);
        return;
    }

    copyRecursive(srcDir, targetDir);
}

export function install() {
    syncComponents();
}
