export default function replaceInHtml(html, search, replacer) {
  "https://github.com/cutiful/replace-in-html";

  if (/(?:<html>|<head>|<body>)/.test(html))
    throw new Error("`html` must not contain <html>, <head> or <body>");

  const re = typeof search === "string" ? aToRe(search) : search;
  if (!(re instanceof RegExp))
    throw new Error("`search` must be a string or a RegExp");

  const fn = typeof replacer === "string" ? () => replacer : replacer;
  if (typeof fn !== "function")
    throw new Error("`replacer` must be a string or a function");

  const doc = new DOMParser().parseFromString(
    `<body>${html}</body>`,
    "text/html"
  );
  const tw = doc.createTreeWalker(doc.body, 4); // text nodes only
  while (tw.nextNode()) replaceInCurrentNode(doc, tw, re, fn);

  return doc.body.innerHTML;
}

function replaceInCurrentNode(doc, tw, re, fn) {
  if (
    ["SCRIPT", "STYLE", "TEXTAREA"].includes(
      tw.currentNode.parentElement.tagName
    )
  )
    return;

  let matches = tw.currentNode.data.match(re);
  if (matches === null) return;

  if (re.sticky || !re.global)
    // sticky ignores global
    matches = [matches[0]]; // the rest are capture groups

  for (const match of matches) {
    const els = toElArr(fn(match), doc);
    const i = tw.currentNode.data.indexOf(match);

    // [siblings?] [<text?> <match> <text?>]
    //             ^ currentNode (was `next` in previous iteration)

    tw.currentNode.splitText(i);
    const target = tw.nextSibling();

    // [siblings?] [<text?>] [<match> <text?>]
    //                       ^ currentNode = target

    tw.currentNode.splitText(match.length);
    const next = tw.nextSibling();

    // [siblings?] [<text?>] [<match>] [<text?>]
    //                       ^ target  ^ currentNode = next

    target.parentElement.removeChild(target);

    // [siblings?] [<text?>] [<text?>]
    //                       ^ currentNode = next

    for (const el of els) next.parentElement.insertBefore(el, next);

    // [siblings?] [<text?>] [el] [el?] ... [<text?>]
    //                                      ^ currentNode
  }
}

function toElArr(els, doc) {
  if (typeof els === "string") {
    const div = doc.createElement("div");
    div.innerHTML = els;
    return [...div.childNodes];
  } else if (els instanceof HTMLCollection) {
    return [...els];
  } else if (Array.isArray(els)) {
    return els;
  } else if (els instanceof Node) {
    return [els];
  } else {
    throw new Error(
      "`replacer` function must return string, Node, Array of Nodes or HTMLCollection"
    );
  }
}

function aToRe(str) {
  return new RegExp(str.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"), "g");
}
