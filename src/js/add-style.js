function addStyle(styleText, head = document.documentElement) {
  const style = document.createElement('style');
  style.setAttribute('type', 'text/css');
  style.textContent = styleText;
  head.prepend(style);
  return style;
}

export default addStyle;
