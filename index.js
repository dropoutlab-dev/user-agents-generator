/*
 * @title user-agents-generator 🚀
 * @desc 📝 A Minimal Package to Generate unlimited user agents 🚀
 * @version 1.0.0
 * @author 🧑‍💻 DropOutLab <dropoutlab@gmail.com>
 */

const os = require('os');
const userAgentGenerator = {
  chrome: function() {
    const chromeVersion = Math.floor(Math.random() * 20) + 60;
    const webkitVersion = Math.floor(Math.random() * 700) + 500;
    const osPlatform = os.platform() === 'win32' ? 'Win64; x64' : 'Macintosh; Intel Mac OS X 10_15_0';
    const userAgent = `Mozilla/5.0 (${osPlatform}) AppleWebKit/${webkitVersion}.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.3163.100 Safari/${webkitVersion}.36`;
    return userAgent;
  },
  firefox: function() {
    const firefoxVersion = Math.floor(Math.random() * 5) + 55;
    const geckoVersion = Math.floor(Math.random() * 30) + 20100101;
    const osPlatform = os.platform() === 'win32' ? 'Win64; x64' : 'Macintosh; Intel Mac OS X 10_15_0';
    const userAgent = `Mozilla/5.0 (${osPlatform}; rv: ${firefoxVersion}.0) Gecko/${geckoVersion} Firefox/${firefoxVersion}.0`;
    return userAgent;
  },
  safari: function() {
    const safariVersion = Math.floor(Math.random() * 5) + 10;
    const osPlatform = os.platform() === 'win32' ? 'Win64; x64' : 'Macintosh; Intel Mac OS X 10_15_0';
    const userAgent = `Mozilla/5.0 (${osPlatform}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${safariVersion}.1.15 Safari/605.1.15`;
    return userAgent;
  },
  android: function() {
    const androidVersion = Math.floor(Math.random() * 5) + 5;
    const chromeVersion = Math.floor(Math.random() * 20) + 60;
    const webkitVersion = Math.floor(Math.random() * 700) + 500;
    const osPlatform = `Linux; Android ${androidVersion}.${Math.floor(Math.random() * 10)}; en-us; Nexus 6 Build/LYZ28M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.3163.98 Mobile Safari/${webkitVersion}.36`;
    const userAgent = `Mozilla/5.0 (${osPlatform}`;
    return userAgent;
  },
  ios: function() {
    const iosVersion = Math.floor(Math.random() * 5) + 9;
    const safariVersion = Math.floor(Math.random() * 5) + 600;
    const webkitVersion = Math.floor(Math.random() * 700) + 500;
    const osPlatform = `CPU iPhone OS ${iosVersion}_${Math.floor(Math.random() * 10)} like Mac OS X) AppleWebKit/${webkitVersion}.60 (KHTML, like Gecko) Version/${safariVersion}.0 Mobile/15E148 Safari/${webkitVersion}.60`;
    const userAgent = `Mozilla/5.0 (${osPlatform}`;
    return userAgent;
  }
};

module.exports = userAgentGenerator;
