const express = require("express");
const router = express.Router();

// index route
router.get("/", function (req, res, next) {
  res.redirect("/api/posts");
});

module.exports = router;
