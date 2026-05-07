const logger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    const color =
      res.statusCode >= 500
        ? "\x1b[31m" // red
        : res.statusCode >= 400
        ? "\x1b[33m" // yellow
        : res.statusCode >= 200
        ? "\x1b[32m" // green
        : "\x1b[36m"; // cyan

    console.log(
      `${color}[${log.timestamp}] ${log.method} ${log.path} ${log.status} ${log.duration}\x1b[0m`
    );
  });

  next();
};

module.exports = logger;