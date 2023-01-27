import addScript from './add-script.js';

function addScripts(...links) {
  console.log(links);
  const scripts = [];
  for (const link of links) {
    scripts.push(addScript(link));
  }
  return scripts;
}

export default addScripts;
