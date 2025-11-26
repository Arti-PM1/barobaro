import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGE_PATH = path.join(__dirname, '../package.json');
const CHANGELOG_PATH = path.join(__dirname, '../data/changelog.json');

function bumpVersion(ver) {
    const parts = ver.split('.').map(Number);
    parts[2] += 1; // Increment patch version
    return parts.join('.');
}

function getLatestCommitTitle() {
    try {
        return execSync('git log -1 --pretty=%s').toString().trim();
    } catch (e) {
        console.error('❌ Failed to get latest git commit title. Make sure you have at least one commit.');
        process.exit(1);
    }
}

async function main() {
    console.log('\n🚀 Nexus-AI Release Automation Tool\n');

    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf-8'));
    const currentVersion = packageJson.version;
    const newVersion = bumpVersion(currentVersion);

    console.log(`Current Version: ${currentVersion}`);

    packageJson.version = newVersion;
    fs.writeFileSync(PACKAGE_PATH, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated package.json from v${currentVersion} to v${newVersion}`);

    let changelog = [];
    try {
        changelog = JSON.parse(fs.readFileSync(CHANGELOG_PATH, 'utf-8'));
    } catch (e) {
        console.log('ℹ️ Could not find existing changelog.json. Creating a new one...');
    }

    // Find the entry for the current version and update it
    const latestEntry = changelog[0];
    if (latestEntry && latestEntry.version === currentVersion) {
        // This is an example, you'll likely want to update the description 
        // based on the actual changes.
        latestEntry.description = latestEntry.description || "Updated description for existing version.";
        console.log(`ℹ️ Updated description for v${currentVersion} in changelog.`);
    } else {
        const today = new Date().toISOString().split('T')[0];
        const newEntry = {
            version: newVersion,
            date: today,
            title: getLatestCommitTitle(), // Get title from the latest commit
            description: "(To be filled in by the developer)", // Placeholder
        };
        changelog.unshift(newEntry);
        console.log(`✅ Added new entry for v${newVersion} to data/changelog.json.`);
    }

    fs.writeFileSync(CHANGELOG_PATH, JSON.stringify(changelog, null, 2) + '\n');
    console.log(`✅ changelog.json has been successfully updated.`);
    console.log(`\n🎉 Release prep complete! Ready for the next step.`);
}

main();