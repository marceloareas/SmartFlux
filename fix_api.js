const fs = require('fs');
let content = fs.readFileSync('front-end/lib/api.ts', 'utf8');

content = content.replace(
  "window.location.href = '/login';",
  "window.location.href = '/login';\n                  throw new Error('Session Refresh Failed');"
).replace(
  "window.location.href = '/login';",
  "window.location.href = '/login';\n              throw new Error('Refresh Server Failed');"
).replace(
  "window.location.href = '/login';",
  "window.location.href = '/login';\n          throw new Error('Missing Refresh Token');"
);

// We also should probably throw if !res.ok anyway to avoid returning a bad response?
// Let's just fix the api.ts properly using sed or string replace
