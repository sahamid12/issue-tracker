import multer from 'multer';

const storage = multer.memoryStorage(); // store in RAM temporarily

const upload = multer({ storage });

export default upload;
