const express = require("express");
const puppeteer = require("puppeteer");
const useProxy = require("puppeteer-page-proxy");
require("dotenv").config();
const cheerio = require("cheerio");

const app = express();
const port = 8080;

app.get("/", async (req, res) => {
  res.send("root working");
});

app.get("/getposts/:pageId", async (req, res) => {
  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    args: [
      `--proxy-server=http://${process.env.PROXY_SERVER}:${process.env.PROXY_SERVER_PORT}`,
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  const page = await browser.newPage();
  await page.authenticate({
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD,
  });
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    if (
      // request.resourceType() === "image" ||
      // request.resourceType() === "stylesheet"
      request.resourceType() === "font"
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36"
  );

  // const setCookie = await client.send("Network.setCookie", {
  //   name: "mycookie",
  //   value: "Hello",
  //   domain: "https://example.com",
  // });
  // set cookies
  await page.setCookie(
    {
      domain: ".facebook.com",
      expirationDate: 1714853120.021206,
      hostOnly: false,
      httpOnly: true,
      name: "datr",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: null,
      value: "9DwnZLfnUcm4dfntjM_gb41D",
    },
    {
      domain: ".facebook.com",
      expirationDate: 1688119962.504256,
      hostOnly: false,
      httpOnly: true,
      name: "fr",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: null,
      value: "08Q40jJAoAPK9vEGr..BkJzz0.Z9.AAA.0.0.BkKAOd.AWXlk3qPHjw",
    },
    {
      domain: ".facebook.com",
      hostOnly: false,
      httpOnly: false,
      name: "m_pixel_ratio",
      path: "/",
      sameSite: "lax",
      secure: true,
      session: true,
      storeId: null,
      value: "1",
    },
    {
      domain: ".facebook.com",
      expirationDate: 1714853120.021365,
      hostOnly: false,
      httpOnly: true,
      name: "sb",
      path: "/",
      sameSite: "no_restriction",
      secure: true,
      session: false,
      storeId: null,
      value: "9DwnZFzq7IdYImVQbJ08Z7cU",
    },
    {
      domain: ".facebook.com",
      expirationDate: 1680948731,
      hostOnly: false,
      httpOnly: false,
      name: "wd",
      path: "/",
      sameSite: "lax",
      secure: true,
      session: false,
      storeId: null,
      value: "1349x635",
    }
  );

  await page.goto(`https://m.facebook.com/ ${req.params.pageId}/`, {
    waitUntil: "networkidle2",
    timeout: 0,
  });

  const scrollPage = async (page) => {
    await page.evaluate(async () => {
      await new Promise((resolve, reject) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          console.log("scrollHeight => ", scrollHeight);
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

  const screenshot = await page.screenshot();
  // wait for first post to view

  // await page
  //   .waitForXPath('//*[@id="pages_msite_body_contents"]/div/div[4]/div[2]')
  //   .then(() => console.log("XPath found!"))
  //   .catch(async (error) => {
  //     console.log("first time fail error msg=> ", error);
  //     await scrollPage(page);
  //   })
  //   .finally(() => {});

  // await page
  //   .waitForXPath('//*[@id="pages_msite_body_contents"]/div/div[4]/div[2]')
  //   .then(() => console.log("XPath found!"))
  //   .catch(async (error) => {
  //     console.log("second time fail error msg=> ", error);
  //   })
  //   .finally(() => {});
  // get posts html list
  // const posts = await page.evaluate(() => {
  //   const postList = document.querySelectorAll(
  //     '#pages_msite_body_contents > div > div:nth-child(4) > div[style="padding-top:8px"]'
  //   );
  //   const postlistarray = [];
  //   postList.forEach((el) => {
  //     postlistarray.push(el.innerHTML);
  //   });

  //   return postlistarray;
  // });
  // const postObjectArray = posts.map((post) => {
  //   const $ = cheerio.load(post);
  //   const postObject = JSON.parse($("article").attr("data-ft"));
  //   const postId = postObject.mf_story_key;
  //   const postImgId = postObject.photo_id;
  //   const publishDateSecond =
  //     postObject.page_insights[`${postObject.page_id}`].post_context
  //       .publish_time;

  //   const postDescription = $(".story_body_container > div > div").html();
  //   // const desStyleRemove = cheerio.load(postDescription);
  //   // desStyleRemove("style").remove();
  //   // desStyleRemove("*[style]").removeAttr("style");
  //   // desStyleRemove("*[class]").removeAttr("class");
  //   // desStyleRemove("span").removeAttr();
  //   // const description = desStyleRemove("body").html();
  //   const postImageLow = $(".story_body_container div a img").eq(1).attr("src");
  //   const postUrl = $(".story_body_container div div a").eq(2).attr("href");

  //   const postDataObject = {
  //     postId: postId,
  //     imgId: postImgId,
  //     publishDate: publishDateSecond,
  //     description: postDescription,
  //     lowQImgUrl: postImageLow,
  //     postUrl: postUrl,
  //   };
  //   return postDataObject;
  // });
  // res.send(postObjectArray);
  res.set("Content-Type", "image/png");
  res.send(screenshot);
  await browser.close();
});

app.get("/getpostimage/:posturl", async (req, res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    defaultViewport: null,
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    await page.goto(`https://web.facebook.com${req.params.posturl}`, {
      waitUntil: "networkidle2",
      timeout: 0,
    });
    await page.waitForSelector(
      ".uiScaledImageContainer img.scaledImageFitWidth"
    );

    const imageUrl = await page.evaluate(() => {
      const img = document.querySelectorAll(
        ".uiScaledImageContainer img.scaledImageFitWidth"
      )[1];
      return img ? img.src : null;
    });
    res.send(imageUrl);
  } catch (e) {
    res.send(`process error: ${e}`);
  } finally {
    await browser.close();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
