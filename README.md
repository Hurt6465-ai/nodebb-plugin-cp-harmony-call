# nodebb-plugin-cp-harmony-call

给 CP Chat Harmony 聊天窗口添加语音/视频通话按钮。通话媒体走 PeerJS/WebRTC，通话信令走悟空 IM 文本信令：`__cp_harmony_call__:`。

## 安装

把本目录放到 NodeBB 的 `node_modules/nodebb-plugin-cp-harmony-call` 或 plugins 目录中，然后：

```bash
./nodebb activate nodebb-plugin-cp-harmony-call
./nodebb build
./nodebb restart
```

也可以把 zip 解压到 NodeBB 根目录的 `node_modules/nodebb-plugin-cp-harmony-call`。

## 依赖

这个插件默认复用已有聊天插件的桥接接口：

- `/bridge/token`：返回悟空 IM token 和 uid
- `/wkws/`：悟空 IM WebSocket 代理

生产环境建议自建 PeerJS Server，然后在 NodeBB 设置里写入 `cp-harmony-call` 配置，覆盖 `peerOptions` / `iceServers`。

## 改动重点

- 不再作为随处运行的注入脚本，而是通过 `plugin.json` 的 `scripts` 加载轻量 loader。
- 只有检测到 NodeBB 聊天窗口或 CP Chat Harmony 窗口时才加载真正通话 runtime。
- 去掉了通话菜单里的说明副标题，只保留“语音通话 / 视频通话”两个入口。
- 保留必要错误提示，例如权限失败、连接失败、对方拒绝。
- 信令消息不会作为普通聊天消息显示，DOM 层也会隐藏残留的信令行。
- 离开聊天页时会调用 `destroy()` 清理按钮、通话 UI、MutationObserver、媒体流和计时器。

## 可选配置

插件会读取 NodeBB `meta.settings` 里的 `cp-harmony-call`：

```json
{
  "enabled": true,
  "peerjsUrl": "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js",
  "wkSdkUrl": "https://cdn.jsdelivr.net/npm/wukongimjssdk@latest/lib/wukongimjssdk.umd.js",
  "tokenPath": "/bridge/token",
  "wkWsPath": "/wkws/",
  "enableVideo": true,
  "showButton": true,
  "peerOptions": {
    "host": "your-peer-server.example.com",
    "port": 443,
    "path": "/peerjs",
    "secure": true
  },
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
}
```
