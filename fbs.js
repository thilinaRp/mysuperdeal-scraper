import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:/Users/thilina/.cache/puppeteer/chrome/chrome.exe",
  });
  const page = await browser.newPage();

  await page.goto("https://m.facebook.com/Keells.SL/");

  // Wait for the page to load and the "See More" button to appear
  await page.waitForSelector('a[data-sigil="m-feed-see-more"]');

  // Click the "See More" button to load more posts
  await page.click('a[data-sigil="m-feed-see-more"]');

  // Wait for the additional posts to load
  await page.waitForTimeout(5000);

  // Use page.evaluate() to extract the post data
  const postList = await page.evaluate(() => {
    const posts = [];
    const postElements = document.querySelectorAll(
      'div[data-sigil="m-feed-voice-subtitle"]'
    );
    postElements.forEach((postElement) => {
      const post = {};
      post.text = postElement.innerText;
      post.url = postElement.parentElement.href;
      posts.push(post);
    });
    return posts;
  });

  console.log(postList);

  await browser.close();
})();
