// const env = require("dotenv").config();
// const dotevn = require('dotenv')
require("dotenv").config();

config = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "20.2.225.17",
  redis: process.env.REDIS || "localhost",
  user: process.env.USER_DB || "root",
  port_db: process.env.PORT_DB || "3306",
  password: process.env.PASS_DB || "kamin124712",
  database: process.env.NAME_DB || "jaid_db",
  front_url: process.env.FRONT_URL || "https://jaid.serveblog.net",
  mail_pass:  process.env.MAIL_PASS || "rotmpdzovxpdwiom",
};
module.exports = config;
