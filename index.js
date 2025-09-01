// index.js
import express from "express";
import dotenv from "dotenv";
import cron from "node-cron";
import { checkFormSubmission } from "./checkForm.js";

dotenv.config();
import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: false });

const app = express();
app.use(express.json());

app.post("/receive-message", async (req, res) => {
  const { status, message, source } = req.body;

  console.log("Отримано повідомлення:", req.body);

  if (status === "fail") {
    await bot.sendMessage(
      chatId,
      `⚠️ Форма не відправилась! Джерело: ${
        source || "невідоме"
      }\nПовідомлення: ${message || "немає"}`
    );
  } else {
    console.log("✅ Статус успішний:", status);
  }

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Node.js Web Service запущений на порті ${PORT}`);
});

// Запускаємо кожен день о 12:00 за Києвом
// Render працює в UTC, тому Київ (UTC+3 влітку, UTC+2 взимку).
// Для 12:00 Києва -> ставимо 9:00 (літо) або 10:00 (зима).
// cron.schedule("*/3 * * * *", () => {
//   console.log("⏰ Запуск перевірки форми...");
//   checkFormSubmission();
// });

console.log("🚀 Service started, job scheduled.");
