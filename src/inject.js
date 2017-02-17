const script = document.createElement('script');
script.setAttribute('src', chrome.extension.getURL('dist/index.js'));
document.head.appendChild(script);
console.log(script);
