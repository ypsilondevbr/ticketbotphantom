const timestamp = () => new Date().toISOString();

module.exports = {
  info: (...args) => console.log(`[${timestamp()}] [INFO]`, ...args),
  warn: (...args) => console.warn(`[${timestamp()}] [WARN]`, ...args),
  error: (...args) => console.error(`[${timestamp()}] [ERROR]`, ...args),
  debug: (...args) => {
    if (process.env.DEBUG === 'true') console.debug(`[${timestamp()}] [DEBUG]`, ...args);
  },
};
