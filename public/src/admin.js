'use strict';

/* globals define, $, app, config */
define('admin/plugins/cp-harmony-call', [], function () {
  var Admin = {};

  function relativePath() {
    return (window.config && config.relative_path) || '';
  }

  function getValue(name) {
    var el = $('[name="' + name + '"]');
    if (!el.length) return '';
    if (el.attr('type') === 'checkbox') return el.prop('checked') ? '1' : '0';
    return el.val();
  }

  function setValue(name, value) {
    var el = $('[name="' + name + '"]');
    if (!el.length) return;
    if (el.attr('type') === 'checkbox') {
      el.prop('checked', value === true || value === 'true' || value === '1' || value === 1);
    } else {
      el.val(value == null ? '' : value);
    }
  }

  function collect() {
    return {
      enabled: getValue('enabled'),
      debug: getValue('debug'),
      showButton: getValue('showButton'),
      enableVideo: getValue('enableVideo'),
      autoConnectWukong: getValue('autoConnectWukong'),
      peerjsUrl: getValue('peerjsUrl'),
      wkSdkUrl: getValue('wkSdkUrl'),
      tokenPath: getValue('tokenPath'),
      wkWsPath: getValue('wkWsPath'),
      signalPrefix: getValue('signalPrefix'),
      protocol: getValue('protocol'),
      callTimeoutMs: getValue('callTimeoutMs'),
      connectTimeoutMs: getValue('connectTimeoutMs'),
      signalTtlMs: getValue('signalTtlMs'),
      peerOptions: getValue('peerOptions'),
      iceServers: getValue('iceServers')
    };
  }

  function fill(data) {
    Object.keys(data || {}).forEach(function (key) {
      setValue(key, data[key]);
    });
  }

  function notify(type, message) {
    if (app && app.alert) {
      app.alert({ type: type, alert_id: 'cp-harmony-call', title: 'CP Harmony Call', message: message, timeout: 4000 });
    } else {
      alert(message);
    }
  }

  Admin.init = function () {
    var endpoint = relativePath() + '/api/admin/plugins/cp-harmony-call/settings';

    $.get(endpoint).done(fill);

    $('#cp-harmony-call-save').on('click', function () {
      $.ajax({
        url: endpoint,
        type: 'POST',
        data: collect(),
        headers: config && config.csrf_token ? { 'x-csrf-token': config.csrf_token } : {}
      }).done(function (data) {
        fill(data);
        notify('success', 'Settings saved. Rebuild and restart NodeBB if static assets changed.');
      }).fail(function (xhr) {
        notify('danger', (xhr.responseJSON && xhr.responseJSON.error) || 'Save failed.');
      });
    });
  };

  return Admin;
});
