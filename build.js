// file: build.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all submenu option directories
const submenuDirs = glob.sync('submenu-options/*');
let items = [];

submenuDirs.forEach(dir => {
    const configPath = path.join(dir, 'config.js');
    const htmlPath = path.join(dir, 'section.html');
    
    if (fs.existsSync(configPath) && fs.existsSync(htmlPath)) {
        const configContent = fs.readFileSync(configPath, 'utf-8');
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        
        // Extract config without 'export'
        const configMatch = configContent.match(/export const config = ({[\s\S]*?});/);
        if (configMatch) {
            const config = configMatch[1];

            // Extract init function and remove 'export'
            // Use a more robust regex to match the full function body
            const initMatch = configContent.match(/export function init\s*\(\s*\)\s*\{([\s\S]*?)\}\s*(?=(export|$))/);
            let initFunction;
            if (initMatch && initMatch[1]) {
                // Remove 'export' and use the captured function body
                initFunction = `function init() {${initMatch[1]}}`;
            } else {
                // Default empty function if none found or malformed
                initFunction = 'function init() {}';
            }

            // Build the item string
            items.push(`  {
    config: ${config},
    html: \`${htmlContent.replace(/`/g, '\\`')}\`,
    init: ${initFunction}
  }`);
        }
    }
});

// Join items with commas and wrap in array
const output = `window.submenuOptions = [\n${items.join(',\n')}\n];`;
fs.writeFileSync('build/submenu-options.js', output);
console.log('Submenu options bundled successfully.');

// Optional: Log the output for debugging
console.log('Generated content:\n', output);