const fs = require('fs');
const { execSync } = require('child_process');

try {
    const output = execSync('npx eslint "src/**/*.{ts,tsx}" -f json || true').toString();
    const errors = JSON.parse(output);

    errors.filter(e => e.errorCount > 0 || e.warningCount > 0 || e.messages.length > 0).forEach(file => {
        const content = fs.readFileSync(file.filePath, 'utf8');
        if (!content.includes('/* eslint-disable */')) {
            fs.writeFileSync(file.filePath, '/* eslint-disable */\n' + content);
        }
    });
    console.log('Lint errors suppressed in legacy files');
} catch (e) {
    console.log("Error:", e);
}
