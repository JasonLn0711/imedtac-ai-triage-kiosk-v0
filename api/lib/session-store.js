const net = require("node:net");
const tls = require("node:tls");

const DEFAULT_REDIS_PREFIX = "ai-triage-demo:session:";
const DEFAULT_REDIS_TIMEOUT_MS = 2000;

function redisStoreEnabled() {
  return Boolean(process.env.DEMO_REDIS_URL || process.env.REDIS_URL);
}

function configuredRedisUrl() {
  return process.env.DEMO_REDIS_URL || process.env.REDIS_URL || null;
}

function configuredRedisPrefix() {
  return process.env.DEMO_REDIS_KEY_PREFIX || DEFAULT_REDIS_PREFIX;
}

function encodeRespCommand(args) {
  return `*${args.length}\r\n${args.map((arg) => {
    const value = String(arg);
    return `$${Buffer.byteLength(value, "utf8")}\r\n${value}\r\n`;
  }).join("")}`;
}

function parseLine(buffer, offset) {
  const lineEnd = buffer.indexOf("\r\n", offset, "utf8");
  if (lineEnd === -1) return null;
  return {
    line: buffer.slice(offset, lineEnd).toString("utf8"),
    nextOffset: lineEnd + 2
  };
}

function parseResp(buffer, offset = 0) {
  if (offset >= buffer.length) return null;

  const type = String.fromCharCode(buffer[offset]);
  if (type === "+" || type === "-" || type === ":") {
    const parsed = parseLine(buffer, offset + 1);
    if (!parsed) return null;
    if (type === "-") {
      const error = new Error(parsed.line);
      error.code = "redis_error";
      throw error;
    }
    return {
      value: type === ":" ? Number(parsed.line) : parsed.line,
      nextOffset: parsed.nextOffset
    };
  }

  if (type === "$") {
    const parsed = parseLine(buffer, offset + 1);
    if (!parsed) return null;
    const length = Number(parsed.line);
    if (length === -1) return { value: null, nextOffset: parsed.nextOffset };

    const dataStart = parsed.nextOffset;
    const dataEnd = dataStart + length;
    if (buffer.length < dataEnd + 2) return null;
    return {
      value: buffer.slice(dataStart, dataEnd).toString("utf8"),
      nextOffset: dataEnd + 2
    };
  }

  if (type === "*") {
    const parsed = parseLine(buffer, offset + 1);
    if (!parsed) return null;
    const count = Number(parsed.line);
    if (count === -1) return { value: null, nextOffset: parsed.nextOffset };
    const values = [];
    let nextOffset = parsed.nextOffset;
    for (let index = 0; index < count; index += 1) {
      const item = parseResp(buffer, nextOffset);
      if (!item) return null;
      values.push(item.value);
      nextOffset = item.nextOffset;
    }
    return { value: values, nextOffset };
  }

  const error = new Error(`Unsupported Redis response type ${type}`);
  error.code = "redis_protocol_error";
  throw error;
}

function redisConnectionConfig(redisUrl) {
  const parsed = new URL(redisUrl);
  const useTls = parsed.protocol === "rediss:";
  const password = parsed.password ? decodeURIComponent(parsed.password) : null;
  const username = parsed.username ? decodeURIComponent(parsed.username) : null;
  const database = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname.slice(1) : null;

  return {
    useTls,
    host: parsed.hostname || "127.0.0.1",
    port: Number(parsed.port || 6379),
    username,
    password,
    database
  };
}

function setupCommands(redisUrl, command) {
  const config = redisConnectionConfig(redisUrl);
  const commands = [];
  if (config.password) {
    if (config.username) commands.push(["AUTH", config.username, config.password]);
    else commands.push(["AUTH", config.password]);
  }
  if (config.database) commands.push(["SELECT", config.database]);
  commands.push(command);
  return { config, commands };
}

function executeRedisCommand(redisUrl, command, options = {}) {
  const { config, commands } = setupCommands(redisUrl, command);
  const timeoutMs = Number(options.timeoutMs || DEFAULT_REDIS_TIMEOUT_MS);
  const connector = config.useTls ? tls.connect : net.connect;

  return new Promise((resolve, reject) => {
    let commandIndex = 0;
    let buffer = Buffer.alloc(0);
    let settled = false;

    const socket = connector({ host: config.host, port: config.port }, () => {
      socket.write(encodeRespCommand(commands[commandIndex]));
    });

    function settle(callback, value) {
      if (settled) return;
      settled = true;
      socket.destroy();
      callback(value);
    }

    socket.setTimeout(timeoutMs, () => {
      const error = new Error("Redis command timed out.");
      error.code = "redis_timeout";
      settle(reject, error);
    });

    socket.on("error", (error) => {
      settle(reject, error);
    });

    socket.on("data", (chunk) => {
      try {
        buffer = Buffer.concat([buffer, chunk]);
        const parsed = parseResp(buffer);
        if (!parsed) return;

        buffer = buffer.slice(parsed.nextOffset);
        const isFinalCommand = commandIndex === commands.length - 1;
        if (isFinalCommand) {
          settle(resolve, parsed.value);
          return;
        }

        commandIndex += 1;
        socket.write(encodeRespCommand(commands[commandIndex]));
      } catch (error) {
        settle(reject, error);
      }
    });
  });
}

class RedisSessionAdapter {
  constructor(options = {}) {
    if (!options.url) throw new Error("RedisSessionAdapter requires a Redis URL.");
    this.url = options.url;
    this.keyPrefix = options.keyPrefix || DEFAULT_REDIS_PREFIX;
    this.timeoutMs = options.timeoutMs || DEFAULT_REDIS_TIMEOUT_MS;
  }

  key(sessionKey) {
    return `${this.keyPrefix}${sessionKey}`;
  }

  async loadSession(sessionKey) {
    const raw = await executeRedisCommand(this.url, ["GET", this.key(sessionKey)], { timeoutMs: this.timeoutMs });
    return raw ? JSON.parse(raw) : null;
  }

  async saveSession(session) {
    const expiresAt = new Date(session.session_expires_at).getTime();
    const ttlSeconds = Math.max(1, Math.ceil((expiresAt - Date.now()) / 1000));
    await executeRedisCommand(this.url, ["SETEX", this.key(session.session_key), ttlSeconds, JSON.stringify(session)], {
      timeoutMs: this.timeoutMs
    });
  }

  async deleteSession(sessionKey) {
    await executeRedisCommand(this.url, ["DEL", this.key(sessionKey)], { timeoutMs: this.timeoutMs });
  }
}

function createConfiguredRedisSessionAdapter() {
  const url = configuredRedisUrl();
  if (!url) return null;
  return new RedisSessionAdapter({
    url,
    keyPrefix: configuredRedisPrefix(),
    timeoutMs: Number(process.env.DEMO_REDIS_TIMEOUT_MS || DEFAULT_REDIS_TIMEOUT_MS)
  });
}

module.exports = {
  DEFAULT_REDIS_PREFIX,
  RedisSessionAdapter,
  createConfiguredRedisSessionAdapter,
  encodeRespCommand,
  executeRedisCommand,
  parseResp,
  redisStoreEnabled
};
