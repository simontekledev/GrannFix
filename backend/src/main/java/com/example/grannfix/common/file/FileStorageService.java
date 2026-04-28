package com.example.grannfix.common.file;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final String CLOUDINARY_FOLDER = "grannfix";

    private final Cloudinary cloudinary;
    private final Path legacyUploadDir;

    public FileStorageService(Cloudinary cloudinary,
                              @Value("${app.upload.dir:uploads}") String uploadDir) {
        this.cloudinary = cloudinary;
        this.legacyUploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.legacyUploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    /**
     * Uploads to Cloudinary and returns an absolute secure URL.
     * Bilden krymps till max 1920px bredd och serveras med f_auto/q_auto.
     */
    public String store(MultipartFile file) {
        validate(file);
        String publicId = UUID.randomUUID().toString();

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", CLOUDINARY_FOLDER,
                            "public_id", publicId,
                            "resource_type", "image",
                            "overwrite", false,
                            "transformation", new Transformation<>()
                                    .width(1920).crop("limit")
                                    .quality("auto")
                                    .fetchFormat("auto")
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload to Cloudinary", e);
        }
    }

    /**
     * Loads a legacy file from disk. Used by FileController.serve to keep old
     * /files/&lt;name&gt; URLs working for images uploaded before the Cloudinary cutover.
     */
    public Path load(String filename) {
        Path file = legacyUploadDir.resolve(filename).normalize();
        if (!file.startsWith(legacyUploadDir)) {
            throw new IllegalArgumentException("Invalid file path");
        }
        return file;
    }

    /**
     * Deletes a stored image. Accepts either a Cloudinary URL or a legacy
     * /files/&lt;name&gt; path / bare filename — routes accordingly.
     */
    public void delete(String urlOrFilename) {
        if (urlOrFilename == null || urlOrFilename.isBlank()) return;

        if (urlOrFilename.contains("res.cloudinary.com")) {
            deleteFromCloudinary(urlOrFilename);
        } else {
            deleteFromDisk(urlOrFilename);
        }
    }

    private void deleteFromCloudinary(String url) {
        String publicId = extractPublicIdFromUrl(url);
        if (publicId == null) return;
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        } catch (IOException ignored) {
            // Best-effort delete; orphaned Cloudinary objects are not critical
        }
    }

    private void deleteFromDisk(String urlOrFilename) {
        String filename = urlOrFilename.replace("/files/", "");
        try {
            Path file = legacyUploadDir.resolve(filename).normalize();
            if (file.startsWith(legacyUploadDir)) {
                Files.deleteIfExists(file);
            }
        } catch (IOException ignored) {
        }
    }

    /**
     * Extracts public_id from a Cloudinary delivery URL.
     * Example: https://res.cloudinary.com/dxyz/image/upload/v1234/grannfix/abc.jpg
     *       → grannfix/abc
     */
    private String extractPublicIdFromUrl(String url) {
        int uploadIdx = url.indexOf("/upload/");
        if (uploadIdx < 0) return null;

        String afterUpload = url.substring(uploadIdx + "/upload/".length());

        // Strip optional version segment (v1234567/)
        int firstSlash = afterUpload.indexOf('/');
        if (firstSlash > 0 && afterUpload.startsWith("v")) {
            String maybeVersion = afterUpload.substring(1, firstSlash);
            if (maybeVersion.matches("\\d+")) {
                afterUpload = afterUpload.substring(firstSlash + 1);
            }
        }

        // Strip extension
        int lastDot = afterUpload.lastIndexOf('.');
        if (lastDot > 0) {
            afterUpload = afterUpload.substring(0, lastDot);
        }

        return afterUpload.isEmpty() ? null : afterUpload;
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File too large (max 5 MB)");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed");
        }
    }
}
