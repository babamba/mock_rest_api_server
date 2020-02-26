const express = require("express");
const bodyParser = require("body-parser");
const { prisma } = require("./generated/prisma-client");
var cors = require("cors");

const app = express();

// CORS 설정
app.use(cors());
app.use(bodyParser.json());

app.post(`/user`, async (req, res) => {
  const result = await prisma.createUser({
    ...req.body
  });
  res.json(result);
});

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;
  const result = await prisma.createPost({
    title: title,
    content: content,
    author: { connect: { email: authorEmail } }
  });
  res.json(result);
});

app.put("/publish/:id", async (req, res) => {
  const { id } = req.params;
  const post = await prisma.updatePost({
    where: { id },
    data: { published: true }
  });
  res.json(post);
});

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.deletePost({ id });
  res.json(post);
});

app.get(`/break-timeline`, async (req, res) => {
  const { breakDownID } = req.query;
  console.log("request id : ", breakDownID);
  const result = await prisma.breakdownTimeLines({
    where: { BreakDown: { id: breakDownID } }
  });
  console.dir("result : ", result);
  res.json(result);
});

app.get(`/breaken-list`, async (req, res) => {
  const { page } = req.query;
  console.log("page : ", page);
  const break_all = await prisma.breakDowns();
  const break_list = await prisma.breakDowns({
    first: 10,
    skip: page && page > 0 ? page * 10 - 10 : 0
  });

  const result = {
    result: break_list,
    total_count: break_all.length
  };
  res.json(result);
});

app.get(`/allbreak`, async (req, res) => {
  const break_all = await prisma.breakDowns();
  const result = {
    result: break_all
  };
  res.json(result);
});

app.post(`/breaken`, async (req, res) => {
  const { code, brakeDate, repairDate, shop } = req.body;
  const result = await prisma.createPost({
    code: code,
    brakeDate: brakeDate,
    repairDate: repairDate,
    shop: shop
  });

  res.json(result);
});

app.get(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post({ id });
  res.json(post);
});

app.get("/feed", async (req, res) => {
  const posts = await prisma.posts({ where: { published: true } });
  res.json(posts);
});

app.get("/filterPosts", async (req, res) => {
  const { searchString } = req.query;
  const draftPosts = await prisma.posts({
    where: {
      OR: [
        {
          title_contains: searchString
        },
        {
          content_contains: searchString
        }
      ]
    }
  });
  res.json(draftPosts);
});

app.listen(9100, () =>
  console.log("Server is running on http://localhost:9100")
);
