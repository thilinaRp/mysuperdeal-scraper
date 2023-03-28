import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: "C:/Users/thilina/.cache/puppeteer/chrome/chrome.exe",
  });
  const page = await browser.newPage();

  await page.goto(
    "https://web.facebook.com/story.php?story_fbid=pfbid02JGgpnyx98atPfWGqKwfktfc73dxAy8n6FpmLmWNARdwu76m9EmE5VXTL3jr53WDVl&id=108836225822670&m_entstream_source=timeline&__tn__=-R",
    {
      waitUntil: "networkidle2",
      timeout: 0,
    }
  );
  await page.waitForSelector(".uiScaledImageContainer img.scaledImageFitWidth");

  const imageUrl = await page.evaluate(() => {
    const img = document.querySelectorAll(
      ".uiScaledImageContainer img.scaledImageFitWidth"
    )[1];
    return img ? img.src : null;
  });

  console.log(imageUrl);
  //   await page.screenshot("singlepost.png");
  //   await browser.close();
})();
