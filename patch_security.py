import re

def insert_auth(content):
    if "import org.springframework.security.core.context.SecurityContextHolder;" not in content:
        content = content.replace("import java.util.UUID;", "import java.util.UUID;\nimport org.springframework.security.core.context.SecurityContextHolder;\nimport com.smartflux.api.config.JWTUserData;\nimport com.smartflux.api.service.exceptionsCustom.ResourceNotFoundException;")
    
    if "private UUID getCurrentUserId()" not in content:
        method = """
    private UUID getCurrentUserId() {
        JWTUserData userData = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(userData.userId());
    }
"""
        content = re.sub(r'public class \w+Service \{', lambda m: m.group(0) + method, content)
    return content

# --- AccountService ---
with open('api/src/main/java/com/smartflux/api/service/AccountService.java', 'r') as f:
    acc = f.read()

acc = insert_auth(acc)
acc = re.sub(r'accountRepository\.findAll\(\)', 'accountRepository.findByUserId(getCurrentUserId())', acc)
acc = re.sub(r'accountRepository\.findById\(id\)\s*\.orElseThrow', r'accountRepository.findByIdAndUserId(id, getCurrentUserId())\n                .orElseThrow', acc)
acc = re.sub(r'account\.setUser\(account\.getUser\(\)\);', 'account.setUser(new User(getCurrentUserId()));', acc) # Need to set dummy user to save or fetch user!

with open('api/src/main/java/com/smartflux/api/service/AccountService.java', 'w') as f:
    f.write(acc)

