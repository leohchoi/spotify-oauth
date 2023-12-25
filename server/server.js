import express from 'express';

const app = express();

app.get("/api", (req, res) => {
  res.json({ "user1": [1, 2, 3] })
});

app.listen(8080, () => {
  console.log("server started on port 8080")
});