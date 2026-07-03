const worldCupHandler = require("./worldcup.js");
const worldCupFriendsHandler = require("./worldCup2026Friends.js");

module.exports = async function handler(req, res) {
  if (String(req.query?.worldcup || "") === "1") {
    return await worldCupHandler(req, res);
  }

  if (String(req.query?.worldcupFriends || "") === "1") {
    return await worldCupFriendsHandler(req, res);
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || ""
  });
};
