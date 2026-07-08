const fs = require('fs');
const path = require('path');

const svgDir = path.join(__dirname, 'src/components/svgs');
const outDir = path.join(__dirname, 'src/components/ui/svgs');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function camelCase(str) {
  return str.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

function toPascalCase(str) {
  const camel = camelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

fs.readdirSync(svgDir).forEach(file => {
  if (file.endsWith('.svg')) {
    const filePath = path.join(svgDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix common react issues
    content = content.replace(/stop-opacity/g, 'stopOpacity');
    content = content.replace(/stop-color/g, 'stopColor');
    content = content.replace(/fill-rule/g, 'fillRule');
    content = content.replace(/clip-rule/g, 'clipRule');
    content = content.replace(/stroke-width/g, 'strokeWidth');
    content = content.replace(/stroke-linecap/g, 'strokeLinecap');
    content = content.replace(/stroke-linejoin/g, 'strokeLinejoin');
    content = content.replace(/fill-opacity/g, 'fillOpacity');
    content = content.replace(/xmlns:xlink/g, 'xmlnsXlink');
    content = content.replace(/xml:space/g, 'xmlSpace');
    
    // Convert style="flex:none;line-height:1" to style={{ flex: 'none', lineHeight: 1 }}
    content = content.replace(/style="[^"]*"/g, `style={{ flex: 'none', lineHeight: 1 }}`);
    
    // Extract SVG attributes and content
    const match = content.match(/<svg([^>]*)>(.*)<\/svg>/is);
    if (!match) return;
    
    let attrs = match[1];
    let inner = match[2];
    
    const componentName = toPascalCase(file.replace('.svg', ''));
    
    const tsx = `import React from 'react';\n\nexport const ${componentName} = (props: React.SVGProps<SVGSVGElement>) => (\n  <svg {...props} ${attrs.trim()}>\n    ${inner.trim()}\n  </svg>\n);\n`;
    
    const outName = file.replace('.svg', '.tsx');
    fs.writeFileSync(path.join(outDir, outName), tsx);
    console.log('Created ' + outName);
  }
});
