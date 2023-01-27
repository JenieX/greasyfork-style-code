function addScript(link, head = document.documentElement) {
  const script = document.createElement('script');
  script.src = link;
  script.async = false;
  head.prepend(script);
  return script;
}

export default addScript;
