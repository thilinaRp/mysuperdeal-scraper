const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();
const cheerio = require("cheerio");

const app = express();
const port = 8080;

app.get("/", async (req, res) => {
  res.send("root working");
});

app.get("/getposts/:pageId", async (req, res) => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();
  await page.goto(`https://facebook.com/${req.params.pagename}`, {
    waitUntil: "networkidle2",
    timeout: 0,
  });

  const scrollPage = async (page) => {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        let totalHeight = 0;
        const distance = 500;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  };
  // scoll page
  await scrollPage(page);

  async function waitForPageStabilize(page) {
    const intervalId = setInterval(async () => {
      const isStable = await page.evaluate(async () => {
        // Check if there are any pending network requests
        const networkPromise = new Promise((resolve) => {
          window.addEventListener("load", resolve);
          setTimeout(resolve, 5000);
        });
        const pendingRequests = window.performance
          .getEntriesByType("resource")
          .filter(
            (r) => r.initiatorType !== "xmlhttprequest" && !r.transferSize
          )
          .map((r) => r.name);
        if (pendingRequests.length > 0) {
          return false;
        }

        // Check if the page has stopped resizing
        const resizePromise = new Promise((resolve) => {
          let lastWidth = window.innerWidth;
          let lastHeight = window.innerHeight;
          const checkResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            if (width !== lastWidth || height !== lastHeight) {
              lastWidth = width;
              lastHeight = height;
              setTimeout(checkResize, 100);
            } else {
              resolve();
            }
          };
          setTimeout(checkResize, 100);
        });

        // Wait for both promises to resolve
        await Promise.all([networkPromise, resizePromise]);
        return true;
      });

      if (isStable) {
        clearInterval(intervalId);
        console.log("loaded");
      } else {
        console.log("Page is not stable yet, waiting for a moment...");
        await page.waitForTimeout(1000);
      }
    }, 1000);
  }

  // Wait until at least four elements matching the XPath expression are visible on the page
  await page.waitForFunction(
    () => {
      const elements = document.evaluate(
        '//div[@role="article"]',
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      let visibleElementCount = 0;
      for (let i = 0; i < elements.snapshotLength; i++) {
        if (elements.snapshotItem(i).offsetParent !== null) {
          visibleElementCount++;
        }
      }
      return visibleElementCount >= 7;
    },
    { timeout: 0 }
  );

  console.log("At least 4 elements are visible.");

  // Take a screenshot of the full page
  const screenshotBuffer = await page.screenshot({ fullPage: true });

  // Set the response headers
  res.set({
    "Content-Type": "image/png",
    "Content-Length": screenshotBuffer.length,
  });

  // Send the screenshot as a response
  res.send(screenshotBuffer);

  await browser.close();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
