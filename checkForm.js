  // checkForm.js

  import puppeteer from "puppeteer";

  const pageInfo = {
    url: "https://boilerplate.solve-marketing.agency/?utm_source=test&utm_medium=test&utm_campaign=test",
    name: "Test user",
    email: "dev@support.com",
    phone: "123456789",
    link: "test.link",
    message: "contacts test message",
  };

  export async function checkFormSubmission() {
    const browser = await puppeteer.launch({
      headless: true, 
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ]
    });

    const page = await browser.newPage();

    // Set a common user agent string
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    // Hide webdriver flag
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => false,
      });
    });

    // Navigate to the page
    await page.goto(pageInfo.url, { waitUntil: "networkidle2" });

    page.on("console", (msg) => {
      console.log("[Browser log]:", msg.text());
    });

    // Set the values of the input fields
    await page.evaluate((info) => {
      const simulateInput = (el, value) => {
        el.focus();
        el.value = value;
        el.dispatchEvent(new Event("input", { bubbles: false }));
        el.dispatchEvent(new Event("change", { bubbles: false }));
        el.blur();
      };

      const form = document.querySelector(".wpcf7-form");
      if (!form) return;

      console.log(form);

      const links = form.querySelectorAll("a");
      links.forEach((a) => a.removeAttribute("href"));

      const inputs = [
        ...form.querySelectorAll(`
        .wpcf7-form input[type="text"]:not([name*="honeypot"], [name^="utm"], [name^="ref"], [name^="gid"]),
        .wpcf7-form input[type="tel"],
        .wpcf7-form input[type="email"],
        .wpcf7-form textarea
      `),
      ];

      inputs.forEach((input) => {
        const name = input.getAttribute("name");

        if (name === "your-name") simulateInput(input, info.name);
        if (name === "your-email") simulateInput(input, info.email);
        if (name === "your-tel") simulateInput(input, info.phone);
        if (name === "your-links") simulateInput(input, info.link);
        if (name === "message") simulateInput(input, info.message);
      });

      const checkboxInputs = form.querySelectorAll(
        '.wpcf7-form input[type="checkbox"]'
      );

      if (checkboxInputs.length) {
        checkboxInputs.forEach((cb) => {
          if (!cb.checked) {
            cb.checked = true;
            cb.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      }
    }, pageInfo);

    // Submit форми
    await page.evaluate(() => {
      const form = document.querySelector(".wpcf7-form");
      if (form)
        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
    });

    // Чекаємо появи попапу як ознаку успішної відправки
    try {
      await page.waitForSelector("#consult-popup", {
        visible: true,
        timeout: 15000,
      });
      console.log("✅ Форма відправлена успішно");
    } catch (err) {
      console.log("⚠️ Форма НЕ була відправлена: " + err.message);
      // await bot.sendMessage(
      //   chatId,
      //   `⚠️ Форма на сайті не була успішно відправлена! Перевірте сторінку: ${pageInfo.url}`
      // );
    }

    await browser.close();
  }