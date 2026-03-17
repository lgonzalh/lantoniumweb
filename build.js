const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');
const CleanCSS = require('clean-css');

const srcJsDir = path.join(__dirname, 'src', 'js');
const srcCssDir = path.join(__dirname, 'src', 'css');
const destJsDir = path.join(__dirname, 'public', 'assets', 'js');
const destCssDir = path.join(__dirname, 'public', 'assets', 'css');

// Ensure dest dirs exist
if (!fs.existsSync(destJsDir)) fs.mkdirSync(destJsDir, { recursive: true });
if (!fs.existsSync(destCssDir)) fs.mkdirSync(destCssDir, { recursive: true });

// Obfuscation options
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: 2000,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    shuffleStringArray: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

console.log('Starting build...');

// Process JS
// Read security.js
let securityCode = '';
try {
    securityCode = fs.readFileSync(path.join(srcJsDir, 'security.js'), 'utf8');
} catch (e) {
    console.warn('security.js not found in src/js');
}

fs.readdirSync(srcJsDir).forEach(file => {
    if (file.endsWith('.js') && file !== 'security.js') {
        let code = fs.readFileSync(path.join(srcJsDir, file), 'utf8');
        
        // Prepend security code to main.js
        if (file === 'main.js') {
            code = securityCode + '\n' + code;
            console.log('Injected security.js into main.js');
        }

        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
        fs.writeFileSync(path.join(destJsDir, file), obfuscationResult.getObfuscatedCode());
        console.log(`Obfuscated ${file}`);
    }
});

// Process CSS
fs.readdirSync(srcCssDir).forEach(file => {
    if (file.endsWith('.css')) {
        const srcPath = path.join(srcCssDir, file);
        const destPath = path.join(destCssDir, file);
        
        const input = fs.readFileSync(srcPath, 'utf8');
        const output = new CleanCSS().minify(input);
        
        if (output.errors.length > 0) {
            console.error(`Error minifying ${file}:`, output.errors);
        } else {
            fs.writeFileSync(destPath, output.styles);
            console.log(`Minified ${file}`);
        }
    }
});

console.log('Build complete.');
