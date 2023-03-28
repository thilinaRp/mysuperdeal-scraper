import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:/Users/thilina/.cache/puppeteer/chrome/chrome.exe",
  });
  const page = await browser.newPage();

  // Navigate to the Facebook page
  await page.goto("https://m.facebook.com/Keells.SL");

  // Wait for the page to load
  await page.waitForSelector('[data-pagelet="MainFeed"]', { timeout: 0 });

  // Scroll down to load more posts
  let previousHeight;
  while (true) {
    previousHeight = await page.evaluate("document.body.scrollHeight");
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
    const newHeight = await page.evaluate("document.body.scrollHeight");
    if (newHeight === previousHeight) {
      break;
    }
  }

  // Get the list of posts
  const posts = await page.$$eval(
    '[data-pagelet="MainFeed"] [role="article"]',
    (elements) => {
      return elements.map((element) => {
        const content =
          element.querySelector('[data-testid="post_message"]')?.textContent ||
          "";
        const timestamp =
          element.querySelector("abbr")?.getAttribute("data-utime") || "";
        const reactions =
          element.querySelector('[data-testid="UFI2TopReactions/tooltip"]')
            ?.textContent || "";
        return { content, timestamp, reactions };
      });
    }
  );

  console.log(posts);

  await browser.close();
})();
