'use strict';

const plugin = {};

plugin.init = async function init() {
  // Front-end runtime is compiled by NodeBB from plugin.json -> scripts.
  // Keep server side intentionally minimal so the working client code is not changed.
};

module.exports = plugin;
