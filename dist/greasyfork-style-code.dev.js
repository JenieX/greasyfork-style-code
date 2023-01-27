// ==UserScript==
// @name           greasyfork-style-code [DEV]
// @version        0.0.0
// @namespace      https://github.com/JenieX
// @description    Format and style the code
// @author         JenieX
// @match          https://greasyfork.org/en/scripts/*/code
// @grant          GM.xmlHttpRequest
// @require        https://github.com/JenieX/greasyfork-style-code/raw/main/lib/gm-fetch.js
// @run-at         document-start
// @noframes
// @compatible     edge Violentmonkey
// @compatible     chrome Violentmonkey
// @icon           https://www.google.com/s2/favicons?sz=64&domain=greasyfork.org
// @license        MIT
// ==/UserScript==

GM.fetch('http://192.168.1.39:3905/js?repo=greasyfork-style-code&_=.js')
  .then((response) => response.text())
  // eslint-disable-next-line no-eval
  .then((responseText) => eval(responseText));
