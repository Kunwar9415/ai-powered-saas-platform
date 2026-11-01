/**
 * Application Logger with colored terminal output and timestamps
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

const getTimestamp = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

export const logger = {
  info: (msg, meta = '') => console.log(`${colors.cyan}[${getTimestamp()}] [INFO]${colors.reset} ${msg}`, meta ? meta : ''),
  success: (msg, meta = '') => console.log(`${colors.green}[${getTimestamp()}] [SUCCESS]${colors.reset} ${msg}`, meta ? meta : ''),
  warn: (msg, meta = '') => console.log(`${colors.yellow}[${getTimestamp()}] [WARN]${colors.reset} ${msg}`, meta ? meta : ''),
  error: (msg, meta = '') => console.error(`${colors.red}[${getTimestamp()}] [ERROR]${colors.reset} ${msg}`, meta ? meta : ''),
  ai: (provider, msg) => console.log(`${colors.magenta}[${getTimestamp()}] [AI::${provider.toUpperCase()}]${colors.reset} ${msg}`),
};
