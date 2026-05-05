'use strict';

(function () {
  var PLUGIN_ID = 'nodebb-plugin-cp-harmony-call';
  var VERSION = '1.1.0';
  var root = window.CPHarmonyCallPlugin = window.CPHarmonyCallPlugin || {};

  if (root.loaderStarted) return;
  root.loaderStarted = true;

  var configPromise = null;
  var scriptPromise = null;
  var refreshTimer = null;
  var observer = null;

  function relativePath() {
    return (window.config && window.config.relative_path) || '';
  }

  function normalizePath(path) {
    path = String(path || '/');
    var rel = relativePath();

    if (rel && path.indexOf(rel) === 0) {
      path = path.slice(rel.length) || '/';
    }

    if (path.charAt(0) !== '/') path = '/' + path;
    if (path.length > 1) path = path.replace(/\/+$/, '');
    return path || '/';
  }

  function getUserLang() {
    return String(
      (window.config && (config.userLang || config.defaultLang)) ||
      (window.app && app.user && (app.user.userLang || app.user.lang || app.user.language)) ||
      document.documentElement.getAttribute('lang') ||
      navigator.language ||
      'en-GB'
    );
  }

  function isChatContext() {
    var path = normalizePath(window.location.pathname || '/');

    if (path === '/chats') return false;

    return !!(
      document.querySelector('#cp-chat-root .cp-header') ||
      document.querySelector('[component="chat/messages"]') ||
      /^\/user\/[^/]+\/chats(?:\/.*)?$/.test(path) ||
      /^\/chats\/[^/]+/.test(path)
    );
  }

  function defaultConfig() {
    return {
      enabled: true,
      debug: false,
      assetBase: '/plugins/' + PLUGIN_ID + '/public',
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
      labels: {}
    };
  }

  function log() {
    if (root.config && root.config.debug && window.console && console.log) {
      console.log.apply(console, ['[cp-harmony-call]'].concat(Array.prototype.slice.call(arguments)));
    }
  }

  function loadConfig(force) {
    if (configPromise && !force) return configPromise;

    var url = relativePath() + '/api/plugins/cp-harmony-call/config?lang=' + encodeURIComponent(getUserLang());

    configPromise = fetch(url, {
      credentials: 'same-origin',
      headers: { accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('config http ' + res.status);
        return res.json();
      })
      .then(function (cfg) {
        root.config = Object.assign(defaultConfig(), cfg || {});
        window.CPHarmonyCallConfig = Object.assign({}, root.config);
        return root.config;
      })
      .catch(function (err) {
        root.config = defaultConfig();
        window.CPHarmonyCallConfig = Object.assign({}, root.config);
        log('config fallback', err);
        return root.config;
      });

    return configPromise;
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var found = document.querySelector('script[data-cp-harmony-call="runtime"]');
      if (found) {
        if (window.CPHarmonyCall) {
          resolve();
          return;
        }
        found.addEventListener('load', resolve, { once: true });
        found.addEventListener('error', reject, { once: true });
        return;
      }

      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.defer = true;
      s.dataset.cpHarmonyCall = 'runtime';
      s.onload = resolve;
      s.onerror = function () {
        reject(new Error('Failed to load ' + src));
      };
      document.head.appendChild(s);
    });
  }

  function updateRuntimeConfig(cfg) {
    window.CPHarmonyCallConfig = Object.assign({}, cfg || {});
    if (window.CPHarmonyCall && window.CPHarmonyCall.setConfig) {
      window.CPHarmonyCall.setConfig(cfg || {});
    } else if (window.CPHarmonyCall) {
      window.CPHarmonyCall.config = Object.assign(window.CPHarmonyCall.config || {}, cfg || {});
    }
  }

  function loadRuntime(cfg) {
    updateRuntimeConfig(cfg);

    if (window.CPHarmonyCall && window.CPHarmonyCall.boot) {
      window.CPHarmonyCall.boot();
      return Promise.resolve();
    }

    if (scriptPromise) return scriptPromise;

    var base = relativePath() + (cfg.assetBase || ('/plugins/' + PLUGIN_ID + '/public'));
    var src = base + '/src/call.js?v=' + encodeURIComponent(VERSION);

    scriptPromise = loadScript(src).then(function () {
      updateRuntimeConfig(cfg);
      if (window.CPHarmonyCall && window.CPHarmonyCall.boot) {
        window.CPHarmonyCall.boot();
      }
    }).catch(function (err) {
      scriptPromise = null;
      console.warn('[cp-harmony-call]', err);
    });

    return scriptPromise;
  }

  function maybeLoadRuntime() {
    return loadConfig().then(function (cfg) {
      if (!cfg.enabled) return;

      if (!isChatContext()) {
        if (window.CPHarmonyCall && window.CPHarmonyCall.destroy && !window.CPHarmonyCall.isActive()) {
          window.CPHarmonyCall.destroy();
        }
        return;
      }

      return loadRuntime(cfg).then(function () {
        if (window.CPHarmonyCall && window.CPHarmonyCall.refresh) {
          window.CPHarmonyCall.refresh();
        }
      });
    });
  }

  function schedule() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(maybeLoadRuntime, 120);
  }

  function startObserver() {
    if (observer || !document.body || !window.MutationObserver) return;

    observer = new MutationObserver(function () {
      if (isChatContext()) schedule();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (window.jQuery) {
    window.jQuery(function () {
      maybeLoadRuntime();
      startObserver();
    });
    window.jQuery(window).on('action:ajaxify.end action:chat.loaded action:chat.switched', schedule);
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      maybeLoadRuntime();
      startObserver();
    });
  } else {
    maybeLoadRuntime();
    startObserver();
  }
}());
