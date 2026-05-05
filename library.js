'use strict';

const plugin = {};
const SETTINGS_KEY = 'cp-harmony-call';

let meta;
try {
  meta = require.main.require('./src/meta');
} catch (err) {
  meta = null;
}

const defaults = {
  enabled: true,
  debug: false,
  assetBase: '/plugins/nodebb-plugin-cp-harmony-call/public',
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
  iceServers: null
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
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

async function getSettings() {
  let stored = {};

  if (meta && meta.settings && typeof meta.settings.get === 'function') {
    try {
      stored = await meta.settings.get(SETTINGS_KEY);
    } catch (err) {
      stored = {};
    }
  }

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
    iceServers: parseJson(stored.iceServers, defaults.iceServers)
  };
}

plugin.addApiRoutes = function (params) {
  const router = params && params.router;
  if (!router || typeof router.get !== 'function') return;

  router.get('/plugins/cp-harmony-call/config', async function (req, res) {
    res.json(await getSettings());
  });
};

module.exports = plugin;
