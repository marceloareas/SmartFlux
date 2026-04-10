const fs = require('fs');
let content = fs.readFileSync('../front-end/app/page.tsx', 'utf8');
content = content.replace(
  '<div className="avatar-btn">',
  '<div className="avatar-btn" onClick={() => window.location.href="/profile"}>'
);
fs.writeFileSync('../front-end/app/page.tsx', content);
