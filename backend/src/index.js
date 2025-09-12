import express from "express";

const app = express();
app.get("/", (req, res) => res.send("hello World!"));

app.listen(80, () => console.log("Container listening on port 80!"));