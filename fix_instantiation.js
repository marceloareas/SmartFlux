const fs = require('fs');
let content = fs.readFileSync('api/src/main/java/com/smartflux/api/config/Instantiation.java', 'utf8');

content = content.replace(
  'import com.smartflux.api.repository.UserRepository;',
  'import com.smartflux.api.repository.SessionRepository;\nimport com.smartflux.api.repository.UserRepository;'
);

content = content.replace(
  'private final UserRepository userRepository;',
  'private final SessionRepository sessionRepository;\n        private final UserRepository userRepository;'
);

content = content.replace(
  '        public void run(String... args) throws Exception {',
  `        public void run(String... args) throws Exception {
                sessionRepository.deleteAll();`
);

fs.writeFileSync('api/src/main/java/com/smartflux/api/config/Instantiation.java', content);
