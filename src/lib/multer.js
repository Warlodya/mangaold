//src/app/lib/multer.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Папка для сохранения
const uploadDir = path.join(process.cwd(), 'manga_storage');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка хранилища
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // уникальное имя: timestamp + оригинальное имя
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        cb(null, `${Date.now()}-${base}${ext}`);
    },
});

export const upload = multer({ storage });
