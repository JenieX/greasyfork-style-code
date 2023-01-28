// ==UserScript==
// @name           greasyfork-style-code
// @version        0.0.1
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

/**
 * Source files are available at:
 * undefined/tree/main/src
 */

function addScript(link, head = document.documentElement) {
  const script = document.createElement('script');
  script.src = link;
  script.async = false;
  head.prepend(script);
  return script;
}

function addScripts(...links) {
  console.log(links);
  const scripts = [];
  for (const link of links) {
    scripts.push(addScript(link));
  }
  return scripts;
}

function addStyle(styleText, head = document.documentElement) {
  const style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.textContent = styleText;
  head.prepend(style);
  return style;
}

/* eslint-disable no-unused-vars */

// https://stackoverflow.com/a/29482788
function encodeHTML(input) {
  const p = document.createElement('p');
  p.textContent = input;
  return p.innerHTML;
}

addScripts(
  'https://unpkg.com/prettier@2.8.3/standalone.js',
  // 'https://unpkg.com/prettier@2.8.3/parser-graphql.js',
  'https://unpkg.com/prettier@2.8.3/parser-babel.js',
  'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js',
  'https://cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@2.8.0/dist/highlightjs-line-numbers.min.js'
);

addStyle(
  `
/* Keep-start */
tr.selected {
  background-color: rgba(0, 0, 0, 0.6117647059);
}

span[class^=bracket-pair-]:not(.disabled) {
  border: 1px solid #00f8ff;
  padding: 5px 0px;
}

pre code.hljs {
  padding: unset !important;
}

.hljs-ln-n {
  padding: 4px 10px;
  opacity: 0.2;
  text-align: center;
  border-right: 1px #ababab solid;
  margin-right: 5px;
}

code {
  font-size: 14px;
  font-family: monospace;
  font-weight: 400;
}

/* Keep-end */
.width-constraint {
  margin: 0px !important;
  max-width: 100% !important;
}

#script-info,
.user-list,
.text-content,
.discussion-list {
  padding: 0px !important;
}

#script-content {
  margin-top: unset !important;
}

#script-info {
  border: unset !important;
}

#script-info {
  margin: unset !important;
}

pre {
  padding: unset !important;
}

.tabs {
  margin: 0px !important;
}

.code-container {
  max-height: unset !important;
  overflow-x: unset !important;
  border-radius: unset !important;
  border: unset !important;
}

#install-area,
#script-feedback-suggestion,
header {
  display: none !important;
}
`
);

function runScript() {
  if (!unsafeWindow.hljs /* || !unsafeWindow.prettier */) {
    console.error('hljs is not loaded yet!');
    setTimeout(runScript, 300);
    return;
  }

  if (!unsafeWindow.prettier) {
    console.error('prettier is not loaded yet!');
    setTimeout(runScript, 3000);
    return;
  }

  const codeElem = document.querySelector('pre.lang-js');

  // console.log(codeElem.textContent);
  // return;
  // console.log(codeElem.innerHTML);

  const formattedCode = unsafeWindow.prettier.format(codeElem.textContent, {
    parser: 'babel',
    // eslint-disable-next-line no-undef
    plugins: prettierPlugins,
    trailingComma: 'es5',
    printWidth: 80,
    singleQuote: true,
    semi: true,
    tabWidth: 2,
    useTabs: false,
    arrowParens: 'always',
  });
  // console.log(xcode);
  // console.log(unsafeWindow.hljs);

  // console.log(htmlDecode(codeElem.textContent));
  // console.log(encodeHTML(formattedCode));
  // return;

  const encodedHTML = encodeHTML(formattedCode);

  codeElem.removeAttribute('class');
  codeElem.innerHTML = `<code class="language-js">${encodedHTML}</code>`;
  unsafeWindow.hljs.highlightElement(codeElem.firstChild);
  unsafeWindow.hljs.initLineNumbersOnLoad();
}

runScript();

function enableHighlightedBrackets(childNode) {
  const [pairClass] = childNode.classList;
  for (const elem of document.querySelectorAll(`.${pairClass}`)) {
    elem.classList.remove('disabled');
  }
  // console.log(pairClass);
}

function disableHighlightedBrackets() {
  const elems = document.querySelectorAll(
    "span[class^='bracket-pair-']:not(.disabled)"
  );
  for (const elem of elems) {
    elem.classList.add('disabled');
  }
}

function highlightLine(elem) {
  const currentSelected = document.querySelector('tr.selected');
  // for (const currentSelectedElem of currentSelectedElems) {
  //   currentSelectedElem.removeAttribute('class');
  // }
  if (currentSelected) {
    currentSelected.removeAttribute('class');
  }
  elem.setAttribute('class', 'selected');
}

document.addEventListener('click', ({ target }) => {
  disableHighlightedBrackets();
  const lineElem = target.closest('tr');
  if (!lineElem) {
    return;
  }
  // console.log(lineElem);
  highlightLine(lineElem);
  const bracketPair = lineElem.querySelector("span[class^='bracket-pair-']");
  if (bracketPair) {
    enableHighlightedBrackets(bracketPair);
    // alert('Already highlighted');
    return;
  }

  const direction = getLineInfo(lineElem);
  if (direction) {
    findMatchingBracket(lineElem, direction);
  }
});

function getLineLevel(elem) {
  const { textContent } = elem;
  const spaces = textContent.match(/^ +/)?.[0].length || 0;
  const level = spaces > 1 ? spaces / 2 : 0;
  return level;
}

function getLineInfo(elem) {
  let direction;
  const { textContent } = elem;

  const openBrackets = textContent.match(/\{/g)?.length || 0;
  const closeBrackets = textContent.match(/\}/g)?.length || 0;
  textContent.indexOf('{');
  textContent.indexOf('}');
  // let closeBracketBeforeOpen;

  // console.log({ openBrackets, closeBrackets });
  if (openBrackets - closeBrackets === 0) {
    // } else { case
    // if(openBrackets !== 1 && closeBrackets !== 1)
    // if (!(openIndx !== -1 && closeIndx !== -1) && openIndx > closeIndx) {
    // console.log({ openIndx, closeIndx });

    return direction;
    // return;
    // }
    // return;
  }
  if (openBrackets !== 1 && closeBrackets !== 1) {
    // alert('Multiple brackets case!');
    // return { error: Error('Multiple brackets case') };
    return direction;
    // return;
  }

  // console.log({ textContent });

  return openBrackets - closeBrackets;

  // return level;
  // console.log(level);
  /*   if (level) {
    level = level[0].length;
  } else {
    level = 0;
  }
  console.log(level); */
}

/* if (true) {
} else {
  throw e;
} */

function highlightBracket(elem, sibling, direction) {
  const whichBracket = direction > 0 ? '{' : '}';
  const matchBracket = whichBracket === '{' ? '}' : '{';
  let childNodes = [...elem.lastChild.childNodes];
  let siblingChildNodes = [...sibling.lastChild.childNodes];
  if (direction > 0) {
    childNodes = childNodes.reverse();
  } else {
    siblingChildNodes = siblingChildNodes.reverse();
  }

  const className = `bracket-pair-${+new Date()}`;

  for (const childNode of childNodes) {
    const nodeTextContent = childNode.textContent;
    if (nodeTextContent.includes(whichBracket)) {
      const replacementNode = document.createElement('span');
      replacementNode.innerHTML = nodeTextContent.replace(
        whichBracket,
        `<span class="${className}">${whichBracket}</span>`
      );
      // childNode.parentNode.appendChild(replacementNode);
      childNode.parentElement.insertBefore(replacementNode, childNode);

      childNode.remove();
      break;
    }
    // console.log(childNode);
  }

  for (const childNode of siblingChildNodes) {
    const nodeTextContent = childNode.textContent;
    if (nodeTextContent.includes(matchBracket)) {
      const replacementNode = document.createElement('span');
      replacementNode.innerHTML = nodeTextContent.replace(
        matchBracket,
        `<span class="${className}">${matchBracket}</span>`
      );
      childNode.parentElement.insertBefore(replacementNode, childNode);

      childNode.remove();
      break;
    }
    // console.log(childNode);
  }
  // console.log(childNodes);
}

async function findMatchingBracket(elem, direction) {
  // console.log({ direction });
  const clickedElemLevel = getLineLevel(elem);
  // console.log(clickedElemLevel);
  const whichSibling =
    direction > 0 ? 'nextElementSibling' : 'previousElementSibling';
  // console.log(whichSibling);
  // console.log(elem[whichSibling]);
  let sibling = elem[whichSibling];
  while (getLineLevel(sibling) !== clickedElemLevel) {
    // sibling.setAttribute('class', 'selected');
    // console.log(sibling);
    sibling = sibling[whichSibling];
  }

  // elem.setAttribute('class', 'selected');

  // const textNode = [...elem.lastChild.childNodes].at(-1);
  // console.log(textNode);
  // await new Promise((resolve) => {
  //   setTimeout(resolve, 3000);
  // });
  // const replacementNode = document.createElement('span');
  // replacementNode.innerHTML = textNode.textContent.replace(
  //   '{',
  //   '<span>{</span>'
  // );
  // textNode.parentNode.appendChild(replacementNode);
  // textNode.remove();

  // sibling.setAttribute('class', 'selected');
  highlightBracket(elem, sibling, direction);
}
