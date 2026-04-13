const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3001;

function readStringEnv(name: string) {
  return process.env[name]?.trim() ?? '';
}

function readRequiredStringEnv(name: string) {
  const value = readStringEnv(name);

  if (!value) {
    throw new Error(`Missing required server env: ${name}`);
  }

  return value;
}

function readPortEnv() {
  const value = readStringEnv('PORT');

  if (!value) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid server env: PORT must be an integer between 1 and 65535');
  }

  return port;
}

function readBooleanEnv(name: string, defaultValue = false) {
  const value = readStringEnv(name).toLowerCase();

  if (!value) {
    return defaultValue;
  }

  if (value === 'true' || value === '1' || value === 'yes' || value === 'on') {
    return true;
  }

  if (value === 'false' || value === '0' || value === 'no' || value === 'off') {
    return false;
  }

  throw new Error(`Invalid server env: ${name} must be a boolean-like value`);
}

function readUrlEnv(name: string) {
  const value = readRequiredStringEnv(name);
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid server env: ${name} must be a valid URL`);
  }

  return {
    url,
    value,
  };
}

function readBaseUrlEnv() {
  const {url, value} = readUrlEnv('LIBRARY_API_BASE_URL');

  if (url.protocol !== 'https:') {
    throw new Error('Invalid server env: LIBRARY_API_BASE_URL must use https');
  }

  return value.replace(/\/$/, '');
}

function readWebAppOriginEnv() {
  const {url} = readUrlEnv('WEB_APP_ORIGIN');

  if (url.protocol !== 'https:') {
    throw new Error('Invalid server env: WEB_APP_ORIGIN must use https');
  }

  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    throw new Error('Invalid server env: WEB_APP_ORIGIN must not use localhost or 127.0.0.1');
  }

  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error('Invalid server env: WEB_APP_ORIGIN must be an exact origin without path, query, or hash');
  }

  return url.origin;
}

export const serverEnv = {
  host: readStringEnv('HOST') || DEFAULT_HOST,
  port: readPortEnv(),
};

export const developmentConfig = {
  allowDevCorsOrigins: readBooleanEnv('ALLOW_DEV_CORS_ORIGINS', false),
  useDevFixtures: readBooleanEnv('USE_DEV_FIXTURES', false),
};

export const webAppConfig = {
  origin: readWebAppOriginEnv(),
};

export const libraryApiConfig = {
  baseUrl: readBaseUrlEnv(),
  authKey: readRequiredStringEnv('LIBRARY_API_AUTH_KEY'),
};
