import dotenv from "dotenv";

dotenv.config(); // load env trước mọi thứ

import app from "./app";
import { connectDB } from "./config/database";
import { verifyMailer } from "./config/mailer";
import { blogRepo } from "./repositories/blog.repo";

const PORT = Number(process.env.PORT) || 5000;

async function bootstrap() {
  try {
    await connectDB();
    verifyMailer(); // non-blocking, log warning nếu SMTP lỗi

    // Publish scheduled blogs mỗi phút
    setInterval(async () => {
      try {
        await blogRepo.publishScheduled();
      } catch (e: any) {
        console.error("[BLOG SCHEDULER] publishScheduled failed:", e?.message);
      }
    }, 60_000);

    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

    const shutdown = () => {
      console.log("⚠️  Shutting down...");
      server.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

bootstrap();
