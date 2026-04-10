const fs = require('fs');
let content = fs.readFileSync('../api/src/main/java/com/smartflux/api/controller/UserController.java', 'utf8');

content = content.replace(
  'import org.springframework.web.bind.annotation.GetMapping;',
  'import org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.security.core.context.SecurityContextHolder;\nimport com.smartflux.api.config.JWTUserData;'
);

content = content.replace(
  '    // GET ------------------------------------------------------------------',
  `    // GET ------------------------------------------------------------------
    @GetMapping("/me")
    public ResponseEntity<User> findCurrentUser() {
        JWTUserData userData = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userService.findUserById(UUID.fromString(userData.getUserId()));
        return ResponseEntity.ok().body(user);
    }
`
);

fs.writeFileSync('../api/src/main/java/com/smartflux/api/controller/UserController.java', content);
