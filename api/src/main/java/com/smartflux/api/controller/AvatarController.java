package com.smartflux.api.controller;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartflux.api.config.JWTUserData;
import com.smartflux.api.service.UserService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "Avatar", description = "Endpoints para upload e download de foto de perfil")
public class AvatarController {

    private final UserService userService;

    @Value("${avatar.storage-dir:/app/avatars}")
    private String storageDir;

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final java.util.Set<String> ALLOWED_TYPES = java.util.Set.of(
            "image/jpeg", "image/png", "image/webp"
    );

    // POST /users/me/avatar --------------------------------------------------
    @PostMapping("/users/me/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("image") MultipartFile file) throws IOException {

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Formato inválido. Use JPG, PNG ou WebP."));
        }

        // Validate size
        if (file.getSize() > MAX_SIZE) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Arquivo muito grande. Máximo 5 MB."));
        }

        // Determine file extension
        String ext = switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png"  -> "png";
            case "image/webp" -> "webp";
            default           -> "jpg";
        };

        // Identify current user
        JWTUserData userData = (JWTUserData) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        UUID userId = UUID.fromString(userData.userId());

        // Persist file
        Path dir = Paths.get(storageDir);
        Files.createDirectories(dir);
        String filename = userId + "." + ext;
        Path destination = dir.resolve(filename);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        // Build public URL and update user record
        String avatarUrl = "/api/avatars/" + filename;
        userService.updateAvatarUrl(userId, avatarUrl);

        return ResponseEntity.created(URI.create(avatarUrl))
                .body(Map.of("avatarUrl", avatarUrl));
    }

    // DELETE /users/me/avatar ------------------------------------------------
    @DeleteMapping("/users/me/avatar")
    public ResponseEntity<?> removeAvatar() {
        // Identify current user
        JWTUserData userData = (JWTUserData) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        UUID userId = UUID.fromString(userData.userId());

        // Update user record to null
        userService.updateAvatarUrl(userId, null);

        // Delete possible existing files
        Path dir = Paths.get(storageDir);
        for (String e : new String[]{"jpg", "png", "webp"}) {
            try {
                Files.deleteIfExists(dir.resolve(userId + "." + e));
            } catch (IOException ignored) {}
        }

        return ResponseEntity.ok(Map.of("message", "Foto removida com sucesso."));
    }

    // GET /avatars/{filename} ------------------------------------------------
    @GetMapping("/avatars/{filename}")
    public ResponseEntity<Resource> serveAvatar(@PathVariable String filename) throws IOException {

        // Safety: reject path traversal attempts
        if (filename.contains("..") || filename.contains("/")) {
            return ResponseEntity.badRequest().build();
        }

        Path file = Paths.get(storageDir).resolve(filename);
        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(file.toUri());
        String mediaType = Files.probeContentType(file);
        if (mediaType == null) mediaType = "application/octet-stream";

        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .contentType(MediaType.parseMediaType(mediaType))
                .body(resource);
    }
}
