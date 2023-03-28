import express from "express";
import getFbPageposts from "./getFbPagePosts.js";
const app = express();
const port = 3000;

app.get("/getposts/:pageId", async (req, res) => {
  const posts = await getFbPageposts({ pageId: req.params.pageId });
  res.send(posts);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
