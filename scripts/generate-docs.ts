
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AI_FEATURES } from '../services/prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(DOCS_DIR, 'AI_FEATURES.md');

async function generateDocs() {
    console.log('📝 Generating AI Features Documentation...');

    if (!fs.existsSync(DOCS_DIR)) {
        fs.mkdirSync(DOCS_DIR);
    }

    let content = `# Baro.ai - AI Features Documentation\n\n`;
    content += `> **Note**: This document is auto-generated from source code (\`services/prompts.ts\`). Do not edit manually.\n\n`;
    content += `Last Updated: ${new Date().toLocaleString()}\n\n`;
    content += `---\n\n`;

    // Table of Contents
    content += `## Table of Contents\n`;
    AI_FEATURES.forEach(feature => {
        content += `- [${feature.name}](#${feature.id.toLowerCase()})\n`;
    });
    content += `\n---\n\n`;

    // Feature Details
    AI_FEATURES.forEach(feature => {
        content += `## ${feature.name} <a id="${feature.id.toLowerCase()}"></a>\n\n`;
        content += `- **ID**: \`${feature.id}\`\n`;
        content += `- **Model**: \`${feature.model}\`\n`;
        content += `- **Tags**: ${feature.tags.map(t => `\`${t}\``).join(', ')}\n`;
        content += `- **Description**: ${feature.description}\n\n`;
        
        content += `### Prompt Logic\n\n`;
        content += '```javascript\n';
        // Function body as string
        const funcStr = feature.promptGenerator.toString();
        content += funcStr + '\n';
        content += '```\n\n';
        
        content += `---\n\n`;
    });

    fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
    console.log(`✅ Documentation generated at: ${OUTPUT_FILE}`);
}

generateDocs().catch(err => {
    console.error('❌ Failed to generate docs:', err);
    process.exit(1);
});
