'use strict';

const fs = require('fs');
const path = require('path');

const plugin = {};
const PLUGIN_ID = 'nodebb-plugin-cp-harmony-call';
const SETTINGS_KEY = 'cp-harmony-call';

const meta = require.main.require('./src/meta');
const winston = require.main.require('winston');
let routeHelpers = null;
try {
  routeHelpers = require.main.require('./src/routes/helpers');
} catch (err) {
  routeHelpers = null;
}

const defaults = {
  enabled: true,
  debug: false,
  assetBase: `/plugins/${PLUGIN_ID}/public`,
  peerjsUrl: 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
  wkSdkUrl: 'https://cdn.jsdelivr.net/npm/wukongimjssdk@latest/lib/wukongimjssdk.umd.js',
  tokenPath: '/bridge/token',
  wkWsPath: '/wkws/',
  signalPrefix: '__cp_harmony_call__:',
  protocol: 'cp-harmony-peer-call-v4',
  callTimeoutMs: 30000,
  connectTimeoutMs: 35000,
  signalTtlMs: 45000,
  enableVideo: true,
  showButton: true,
  autoConnectWukong: true,
  peerOptions: {},
  iceServers: null,
};

const LANG_ALIASES = {
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh-hant': 'zh-TW',
  en: 'en-GB',
  'en-us': 'en-GB',
  'en-gb': 'en-GB',
  my: 'my',
  'my-mm': 'my',
};

function asBool(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

function asNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function parseJson(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

function stringifyJson(value) {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch (err) {
    return '';
  }
}

function normalizeLang(lang) {
  const raw = String(lang || 'en-GB').toLowerCase();
  return LANG_ALIASES[raw] || LANG_ALIASES[raw.split(',')[0]] || 'en-GB';
}

function readLabels(lang) {
  const picked = normalizeLang(lang);
  const fallbackFile = path.join(__dirname, 'languages', 'en-GB', 'cp-harmony-call.json');
  const file = path.join(__dirname, 'languages', picked, 'cp-harmony-call.json');

  let labels = {};
  try {
    labels = JSON.parse(fs.readFileSync(fallbackFile, 'utf8'));
  } catch (err) {
    labels = {};
  }

  if (file !== fallbackFile) {
    try {
      labels = Object.assign(labels, JSON.parse(fs.readFileSync(file, 'utf8')));
    } catch (err) {
      // ignore missing locale file
    }
  }

  return labels;
}

async function rawSettings() {
  try {
    return await meta.settings.get(SETTINGS_KEY);
  } catch (err) {
    winston.warn(`[${PLUGIN_ID}] Failed to read settings: ${err.message}`);
    return {};
  }
}

async function getSettings(lang) {
  const stored = await rawSettings();

  return {
    enabled: asBool(stored.enabled, defaults.enabled),
    debug: asBool(stored.debug, defaults.debug),
    assetBase: stored.assetBase || defaults.assetBase,
    peerjsUrl: stored.peerjsUrl || defaults.peerjsUrl,
    wkSdkUrl: stored.wkSdkUrl || defaults.wkSdkUrl,
    tokenPath: stored.tokenPath || defaults.tokenPath,
    wkWsPath: stored.wkWsPath || defaults.wkWsPath,
    signalPrefix: stored.signalPrefix || defaults.signalPrefix,
    protocol: stored.protocol || defaults.protocol,
    callTimeoutMs: asNumber(stored.callTimeoutMs, defaults.callTimeoutMs),
    connectTimeoutMs: asNumber(stored.connectTimeoutMs, defaults.connectTimeoutMs),
    signalTtlMs: asNumber(stored.signalTtlMs, defaults.signalTtlMs),
    enableVideo: asBool(stored.enableVideo, defaults.enableVideo),
    showButton: asBool(stored.showButton, defaults.showButton),
    autoConnectWukong: asBool(stored.autoConnectWukong, defaults.autoConnectWukong),
    peerOptions: parseJson(stored.peerOptions, defaults.peerOptions),
    iceServers: parseJson(stored.iceServers, defaults.iceServers),
    labels: readLabels(lang),
  };
}

async function getAdminSettings() {
  const cfg = await getSettings('zh-CN');
  return Object.assign({}, cfg, {
    peerOptions: stringifyJson(cfg.peerOptions),
    iceServers: stringifyJson(cfg.iceServers),
  });
}

async function saveSettings(data) {
  const toSave = {
    enabled: asBool(data.enabled, defaults.enabled),
    debug: asBool(data.debug, defaults.debug),
    assetBase: data.assetBase || defaults.assetBase,
    peerjsUrl: data.peerjsUrl || defaults.peerjsUrl,
    wkSdkUrl: data.wkSdkUrl || defaults.wkSdkUrl,
    tokenPath: data.tokenPath || defaults.tokenPath,
    wkWsPath: data.wkWsPath || defaults.wkWsPath,
    signalPrefix: data.signalPrefix || defaults.signalPrefix,
    protocol: data.protocol || defaults.protocol,
    callTimeoutMs: asNumber(data.callTimeoutMs, defaults.callTimeoutMs),
    connectTimeoutMs: asNumber(data.connectTimeoutMs, defaults.connectTimeoutMs),
    signalTtlMs: asNumber(data.signalTtlMs, defaults.signalTtlMs),
    enableVideo: asBool(data.enableVideo, defaults.enableVideo),
    showButton: asBool(data.showButton, defaults.showButton),
    autoConnectWukong: asBool(data.autoConnectWukong, defaults.autoConnectWukong),
    peerOptions: stringifyJson(parseJson(data.peerOptions, defaults.peerOptions)),
    iceServers: stringifyJson(parseJson(data.iceServers, defaults.iceServers)),
  };

  await meta.settings.set(SETTINGS_KEY, toSave);
  return getAdminSettings();
}

function sendJson(res, status, body) {
  res.status(status).json(body);
}

plugin.init = async function (params) {
  const { router, middleware } = params;

  const renderAdmin = async function (req, res) {
    res.render('admin/plugins/cp-harmony-call', await getAdminSettings());
  };

  if (routeHelpers && routeHelpers.setupAdminPageRoute) {
    routeHelpers.setupAdminPageRoute(router, '/admin/plugins/cp-harmony-call', renderAdmin);
  } else if (router && middleware && middleware.admin) {
    router.get('/admin/plugins/cp-harmony-call', middleware.admin.buildHeader, renderAdmin);
    router.get('/api/admin/plugins/cp-harmony-call', middleware.admin.checkPrivileges, async (req, res) => sendJson(res, 200, await getAdminSettings()));
  }

  // Compatibility route used by the client loader. This mirrors the common /api/plugins/... style used by many plugins.
  router.get('/api/plugins/cp-harmony-call/config', async function (req, res) {
    sendJson(res, 200, await getSettings(req.query.lang || req.headers['accept-language']));
  });

  const adminMiddlewares = middleware && middleware.admin && middleware.admin.checkPrivileges ? [middleware.admin.checkPrivileges] : [];

  router.get('/api/admin/plugins/cp-harmony-call/settings', adminMiddlewares, async function (req, res) {
    sendJson(res, 200, await getAdminSettings());
  });

  router.post('/api/admin/plugins/cp-harmony-call/settings', adminMiddlewares, async function (req, res) {
    try {
      sendJson(res, 200, await saveSettings(req.body || {}));
    } catch (err) {
      sendJson(res, 400, { error: err.message });
    }
  });
};

plugin.addRoutes = async function ({ router, middleware, helpers }) {
  const adminMiddlewares = middleware && middleware.admin ? [middleware.admin.checkPrivileges] : [];

  router.get('/cp-harmony-call/config', async function (req, res) {
    const data = await getSettings(req.query.lang || req.headers['accept-language']);
    if (helpers && helpers.formatApiResponse) {
      return helpers.formatApiResponse(200, res, data);
    }
    return sendJson(res, 200, data);
  });

  router.get('/cp-harmony-call/settings', adminMiddlewares, async function (req, res) {
    const data = await getAdminSettings();
    if (helpers && helpers.formatApiResponse) {
      return helpers.formatApiResponse(200, res, data);
    }
    return sendJson(res, 200, data);
  });

  router.post('/cp-harmony-call/settings', adminMiddlewares, async function (req, res) {
    try {
      const data = await saveSettings(req.body || {});
      if (helpers && helpers.formatApiResponse) {
        return helpers.formatApiResponse(200, res, data);
      }
      return sendJson(res, 200, data);
    } catch (err) {
      if (helpers && helpers.formatApiResponse) {
        return helpers.formatApiResponse(400, res, { error: err.message });
      }
      return sendJson(res, 400, { error: err.message });
    }
  });
};

plugin.addAdminNavigation = function (header) {
  header.plugins = header.plugins || [];
  header.plugins.push({
    route: '/plugins/cp-harmony-call',
    icon: 'fa-phone',
    name: 'CP Harmony Call',
  });
  return header;
};

module.exports = plugin;
