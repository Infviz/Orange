
///<reference path="typings/tsd.d.ts"/>

import express = require("express");
import livereload = require("express-livereload");

var app = express();

app.get("/static/app.js", (req, res)=> {
    res.sendFile(process.cwd()+"/app.js");
});

app.use("/static", express.static("../../"));

app.get("*", (req, res)=> {
    res.sendFile(process.cwd()+"/index.html");
});

livereload(app, { watchDir: process.cwd(), interval: 5000 });
app.listen(1001);
