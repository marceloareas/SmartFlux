const fs = require('fs');
let code = fs.readFileSync('front-end/app/profile/page.tsx', 'utf8');

code = code.replace(
  'fontSize: \'13px\' }}',
  "fontSize: '13px', flex: 'none', marginLeft: '16px' }}"
);
fs.writeFileSync('front-end/app/profile/page.tsx', code);
