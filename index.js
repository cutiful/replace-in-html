export default function replaceInHtml(html, search, replacer) {
  "https://github.com/cutiful/replace-in-html";

  if (/(?:<html>|<head>|<body>)/.test(html))
    throw new Error("`html` must not contain <html>, <head> or <body>");

  const regex = typeof search === "string" ? aToRe(search) : search;
  if (!(regex instanceof RegExp))
    throw new Error("`search` must be either a string or a RegExp");

  const fn = typeof replacer === "string" ? () => replacer : replacer;
  if (typeof fn !== "function")
    throw new Error("`replacer` must be either a string or a function");

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const treeWalker = doc.createTreeWalker(doc.body, 4);
  while (treeWalker.nextNode())
    replaceInCurrentNode(doc, treeWalker, regex, fn);

  return doc.body.innerHTML;
}

function replaceInCurrentNode(doc, treeWalker, regex, replacer) {
  if (!treeWalker.currentNode.data)
    return;

  if (["SCRIPT", "STYLE", "TEXTAREA"].includes(treeWalker.currentNode.parentElement.tagName))
    return;

  // CDATA isn't supported in HTML, but just in case
  if (treeWalker.currentNode instanceof CDATASection)
    return;

  let matches = treeWalker.currentNode.data.match(regex);
  if (matches === null)
    return;

  if (regex.sticky || !regex.global) // sticky ignores global
    matches = [matches[0]]; // the rest are capture groups

  for (const match of matches) {
    const elements = toElementArray(replacer(match), doc);
    const index = treeWalker.currentNode.data.indexOf(match);

    treeWalker.currentNode.splitText(index);
    const target = treeWalker.nextSibling();

    treeWalker.currentNode.splitText(match.length);
    const next = treeWalker.nextSibling();

    target.parentElement.removeChild(target);
    for (const element of elements)
      next.parentElement.insertBefore(element, next);
  }
}

function toElementArray(elements, doc) {
  if (typeof elements === "string") {
    const parent = doc.createElement("div");
    parent.innerHTML = elements;
    return [...parent.childNodes];
  } else if (elements instanceof HTMLCollection) {
    return [...elements];
  } else if (Array.isArray(elements)) {
    return elements;
  } else if (elements instanceof Node) {
    return [elements];
  } else {
    throw new Error("`replacer` function must return string, Node, Array of Nodes or HTMLCollection");
  }
}

function aToRe(str) {
  return new RegExp(str.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"), "g");
}
