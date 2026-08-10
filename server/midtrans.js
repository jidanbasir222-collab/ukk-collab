const midtransClient = require("midtrans-client");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = { snap, serverKey: process.env.MIDTRANS_SERVER_KEY };