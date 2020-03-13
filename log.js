let winston = require("winston");
const colorizer = winston.format.colorize();
const { createLogger, format } = require("winston");
const { combine, timestamp, prettyPrint, label } = format;
let logger;

if (process.env.NODE_ENV === "development") {
  logger = createLogger({
    format: combine(
      label({ label: "DEVELOPMENT" }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.json(),
      winston.format.simple(),
      winston.format.printf(msg =>
        colorizer.colorize(
          msg.level,`${msg.label} - ${msg.level} - ${msg.message} - ${msg.timestamp} `
        )
      )
    ),
    transports: [new winston.transports.Console()]
  });
} else {
  logger = createLogger({
    format: combine(label({ label: "WEB RTC" }), timestamp(), winston.format.json()),
    transports: [new winston.transports.File({ filename: "./logs/combined.log" })]
  });
}

module.exports = logger;
