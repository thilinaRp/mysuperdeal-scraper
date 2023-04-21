import express from "express";
import puppeteer from "puppeteer";
import randUserAgent from "rand-user-agent";
require("dotenv").config();
// const cheerio = require("cheerio");
const agent = randUserAgent("desktop");
const app = express();
const port = 8080;

app.get("/", async (req, res) => {
  res.send("root working");
});

app.get("/getpagepreview/:pageId", async (req, res) => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();
  await page.setUserAgent(agent);
  await page.setRequestInterception(true);
  console.log("agent", agent);

  page.on("request", (request) => {
    if (
      request.resourceType() === "image" ||
      // request.resourceType() === "stylesheet"
      request.resourceType() === "font"
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto(`https://facebook.com/${req.params.pagename}`, {
    waitUntil: "networkidle2",
    timeout: 0,
  });

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

app.get("/getposts/:pageId", async (req, res) => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      request.resourceType() === "image" ||
      // request.resourceType() === "stylesheet"
      request.resourceType() === "font"
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.goto(`https://facebook.com/${req.params.pagename}`, {
    waitUntil: "networkidle2",
    timeout: 0,
  });

  const scrollSelectedHeight = async (scrollHeight) => {
    await page.evaluate((scrollHeight) => {
      window.scrollBy(0, scrollHeight);
    }, scrollHeight);
  };

  function wait(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  }
  await scrollSelectedHeight(500);
  await wait(5000); // waits for 5 seconds
  await scrollSelectedHeight(500);
  await wait(5000); // waits for 5 seconds
  await scrollSelectedHeight(500);
  await wait(5000); // waits for 5 seconds

  async function waitUntil(condition, timeout = 30000, interval = 1000) {
    return new Promise(async (resolve, reject) => {
      const endTime =
        timeout === 0 ? Date.now() + 300000 : Date.now() + timeout;

      const checkCondition = async () => {
        const result = await condition();
        if (result) {
          resolve();
        } else if (Date.now() < endTime) {
          setTimeout(checkCondition, interval);
        } else {
          reject(new Error("Timeout exceeded while waiting for condition"));
        }
      };

      await checkCondition();
    });
  }

  async function waitForDivCount(page) {
    await waitUntil(async () => {
      const divCount = await page.$$eval(
        'div[aria-posinset][role="article"]',
        (divs) => divs.length
      );
      console.log(`divCount: ${divCount}`);
      return divCount >= 4;
    }, 0);
    console.log(
      'There are at least 4 div elements with attributes aria-posinset and role="article"'
    );
  }
  await waitForDivCount(page)
    .then(() => {
      console.log("waitForDivCount function completed.");
    })
    .catch((err) => {
      console.error(err);
    });

  // Wait for a few seconds to give the function enough time to complete
  setTimeout(() => {
    console.log("Code after waitForDivCount function");
  }, 5000);

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
