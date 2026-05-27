import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";

const router = Router();
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({ error: "File size must be 10MB or less." });
    }

    const fileName = file.originalname.toLowerCase();
    const isPdf = file.mimetype === "application/pdf" || fileName.endsWith(".pdf");
    const isTxt = file.mimetype === "text/plain" || fileName.endsWith(".txt");

    if (!isPdf && !isTxt) {
      return res.status(400).json({ error: "Only PDF or TXT files are allowed." });
    }

    let extractedText = "";
    if (isPdf) {
      const parser = new PDFParse({ data: file.buffer });
      try {
        const parsed = await parser.getText();
        extractedText = parsed.text || "";
      } finally {
        await parser.destroy();
      }
    } else {
      extractedText = file.buffer.toString("utf-8");
    }

    return res.status(200).json({ success: true, extractedText });
  } catch (error) {
    console.error("Failed to extract file text:", error);
    return res.status(500).json({ error: "Failed to extract text from file." });
  }
});

router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File size must be 10MB or less." });
  }

  console.error("Upload error:", err);
  return res.status(500).json({ error: "Failed to process upload." });
});

export default router;
