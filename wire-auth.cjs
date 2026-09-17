const fs = require('fs');

let code = fs.readFileSync('src/pages/LandingTest.tsx', 'utf-8');

// 1. Change CandidateSite props to read from URL for auth state
// Look for: export default function CandidateSite({auth=false}:Props){
code = code.replace(
  /export default function CandidateSite\(\{auth=false\}:Props\)\{/,
  "export default function CandidateSite({auth: defaultAuth = false}:Props){\n const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');\n const auth = defaultAuth || searchParams.get('auth') === 'true';"
);

// 2. Replace all `/candidate?mode=` with `/landing-test?auth=true&mode=`
code = code.replace(/\/candidate\?mode=/g, '/landing-test?auth=true&mode=');

// 3. Replace all `href="/"` with `href="/landing-test"`
// This covers the back to home button, and footer/header home links
// To be safe, we replace href="/" exactly
code = code.replace(/href="\/"/g, 'href="/landing-test"');

fs.writeFileSync('src/pages/LandingTest.tsx', code, 'utf-8');
