const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(fullPath));
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walkDir('./frontend/app').concat(walkDir('./frontend/components'));
let changedCount = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes("const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';")) {
        const newContent = content.replace(
            /const API = process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:5000';/g,
            "const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');"
        );
        fs.writeFileSync(file, newContent);
        changedCount++;
    }
});

console.log('Modified files:', changedCount);
