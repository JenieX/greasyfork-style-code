import addScripts from './js/add-scripts.js';
import addStyle from './js/add-style.js';

// eslint-disable-next-line no-unused-vars
function decodeHTML(input) {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent;
}

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
include: style.css
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

  console.log(codeElem.textContent);
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
