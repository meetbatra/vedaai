const fs = require('fs');

function parseSVG(filename) {
    if (!fs.existsSync(filename)) return;
    const content = fs.readFileSync(filename, 'utf8');
    
    console.log(`\n--- Parsing ${filename} ---`);
    
    // Look for <rect> elements that might be the sidebar or topbar
    // Sidebar is likely ~280-300px wide and tall.
    // Topbar in Dashboard is likely full width minus margins, so ~350px wide and ~60-80px tall.
    
    const rectRegex = /<rect[^>]+>/g;
    let match;
    while ((match = rectRegex.exec(content)) !== null) {
        const rect = match[0];
        const widthMatch = rect.match(/width="([^"]+)"/);
        const heightMatch = rect.match(/height="([^"]+)"/);
        const rxMatch = rect.match(/rx="([^"]+)"/);
        const fillMatch = rect.match(/fill="([^"]+)"/);
        
        if (widthMatch && heightMatch) {
            const width = parseFloat(widthMatch[1]);
            const height = parseFloat(heightMatch[1]);
            
            // Sidebar heuristic
            if (width >= 250 && width <= 350 && height > 600) {
                console.log(`Found Sidebar candidate: width=${width}, height=${height}, rx=${rxMatch?.[1]}, fill=${fillMatch?.[1]}`);
                console.log(`Full tag: ${rect}\n`);
            }
            
            // TopBar heuristic
            if (width >= 300 && width <= 400 && height >= 50 && height <= 100) {
                console.log(`Found TopBar candidate: width=${width}, height=${height}, rx=${rxMatch?.[1]}, fill=${fillMatch?.[1]}`);
                console.log(`Full tag: ${rect}\n`);
            }
        }
    }
}

parseSVG('/Users/meetbatra/Projects/vedaai/frontend/public/assignment-form.svg');
parseSVG('/Users/meetbatra/Projects/vedaai/frontend/public/Dashboard.svg');
