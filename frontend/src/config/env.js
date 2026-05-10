// Tập trung URL backend vào 1 chỗ duy nhất
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// URL gốc backend — dùng cho file PDF download (vẫn local)
export const BACKEND_URL = API_BASE.replace(/\/api$/, '');

/**
 * Lấy URL hiển thị ảnh.
 * - Nếu path đã là URL đầy đủ (http/https) → đây là Cloudinary URL → dùng thẳng
 * - Nếu path là tên file ngắn (legacy) → ghép với BACKEND_URL/uploads/
 */
export const getUploadUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path; // Cloudinary URL đầy đủ
  }
  return `${BACKEND_URL}/uploads/${path}`; // Legacy local file
};

export default BACKEND_URL;
