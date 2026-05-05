<div class="acp-page-container">
  <div component="settings" class="row">
    <div class="col-12">
      <h4>[[cp-harmony-call:title]]</h4>
      <p class="text-muted">[[cp-harmony-call:description]]</p>
    </div>

    <div class="col-lg-6">
      <div class="card mb-3">
        <div class="card-header">[[cp-harmony-call:basicSettings]]</div>
        <div class="card-body">
          <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" name="enabled" id="enabled" checked>
            <label class="form-check-label" for="enabled">[[cp-harmony-call:enabled]]</label>
          </div>
          <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" name="showButton" id="showButton" checked>
            <label class="form-check-label" for="showButton">[[cp-harmony-call:showButton]]</label>
          </div>
          <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" name="enableVideo" id="enableVideo" checked>
            <label class="form-check-label" for="enableVideo">[[cp-harmony-call:enableVideo]]</label>
          </div>
          <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" name="autoConnectWukong" id="autoConnectWukong" checked>
            <label class="form-check-label" for="autoConnectWukong">[[cp-harmony-call:autoConnectWukong]]</label>
          </div>
          <div class="form-check form-switch mb-2">
            <input class="form-check-input" type="checkbox" name="debug" id="debug">
            <label class="form-check-label" for="debug">[[cp-harmony-call:debug]]</label>
          </div>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header">[[cp-harmony-call:signalSettings]]</div>
        <div class="card-body">
          <label class="form-label">[[cp-harmony-call:tokenPath]]</label>
          <input class="form-control mb-2" name="tokenPath" value="/bridge/token">
          <label class="form-label">[[cp-harmony-call:wkWsPath]]</label>
          <input class="form-control mb-2" name="wkWsPath" value="/wkws/">
          <label class="form-label">[[cp-harmony-call:signalPrefix]]</label>
          <input class="form-control mb-2" name="signalPrefix" value="__cp_harmony_call__:">
          <label class="form-label">[[cp-harmony-call:protocol]]</label>
          <input class="form-control mb-2" name="protocol" value="cp-harmony-peer-call-v4">
        </div>
      </div>
    </div>

    <div class="col-lg-6">
      <div class="card mb-3">
        <div class="card-header">[[cp-harmony-call:assetSettings]]</div>
        <div class="card-body">
          <label class="form-label">PeerJS URL</label>
          <input class="form-control mb-2" name="peerjsUrl" value="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js">
          <label class="form-label">Wukong IM SDK URL</label>
          <input class="form-control mb-2" name="wkSdkUrl" value="https://cdn.jsdelivr.net/npm/wukongimjssdk@latest/lib/wukongimjssdk.umd.js">
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-header">[[cp-harmony-call:timeoutSettings]]</div>
        <div class="card-body">
          <label class="form-label">[[cp-harmony-call:callTimeoutMs]]</label>
          <input class="form-control mb-2" name="callTimeoutMs" value="30000">
          <label class="form-label">[[cp-harmony-call:connectTimeoutMs]]</label>
          <input class="form-control mb-2" name="connectTimeoutMs" value="35000">
          <label class="form-label">[[cp-harmony-call:signalTtlMs]]</label>
          <input class="form-control mb-2" name="signalTtlMs" value="45000">
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="card mb-3">
        <div class="card-header">[[cp-harmony-call:advancedSettings]]</div>
        <div class="card-body">
          <label class="form-label">PeerJS options JSON</label>
          <textarea class="form-control mb-2" name="peerOptions" rows="6">{}</textarea>
          <label class="form-label">ICE servers JSON</label>
          <textarea class="form-control mb-2" name="iceServers" rows="6"></textarea>
          <p class="text-muted">[[cp-harmony-call:advancedHelp]]</p>
        </div>
      </div>
    </div>

    <div class="col-12">
      <button class="btn btn-primary" id="cp-harmony-call-save">[[cp-harmony-call:save]]</button>
    </div>
  </div>
</div>
