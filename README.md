# replace-in-html
Replaces text in an HTML fragment without replacing attributes. Only works in a
browser (or JSDOM).

## Examples
```js
replaceInHtml(`<a href="https://meow.example.org">meow</a>`, "meow", `<img src="./cat.png">`);
// <a href="https://meow.example.org"><img src="./cat.png"></a>

replaceInHtml(
  `<p class="me">Nested elements and regexps: <span>replace <b>me!</b></span> <span>and me!</span></p>`,
  /(?<!\w)me/g, // negative lookbehind,
  "without replacing \"me\" in \"elements\"",
);
// <p class="me">Nested elements and regexps: <span>replace <b>without replacing "me" in "elements"!</b></span> <span>and without replacing "me" in "elements"!</span></p>

replaceInHtml(
  `<div><code>replacer</code> can be a string or a function returning $return_types</div>`,
  /\$return_types/g,
  match => {
    const el = document.createElement("span");
    el.className = match.slice(1);
    el.innerHTML = "a string, DOM Node or an array of DOM Nodes";

    return el;
  },
);
// <div><code>replacer</code> can be a string or a function returning <span class="return_types">a string, DOM Node or an array of DOM Nodes</span></div>

replaceInHtml(
  `<p>So let's try an example closer to the real world:question:</p>
  <p>How about... :lightbulb: custom emoji tags? :blobcat:</p>`,
  /:[a-zA-Z0-9_]{2,}:/g,
  match => {
    const el = document.createElement("img");
    el.className = "custom_emoji";
    el.alt = el.title = match;
    el.src = `https://cdn.example.org/i/emoji/${match.slice(1, -1)}.png`;

    return el;
  },
);
// <p>So let's try an example closer to the real world<img class="custom_emoji" title=":question:" alt=":question:" src="https://cdn.example.org/i/emoji/question.png"></p>
// <p>How about... <img class="custom_emoji" title=":lightbulb:" alt=":lightbulb:" src="https://cdn.example.org/i/emoji/lightbulb.png"> custom emoji tags? <img class="custom_emoji" title=":blobcat:" alt=":blobcat:" src="https://cdn.example.org/i/emoji/blobcat.png"></p>
```

## Installation
### Webpack / Rollup
NPM:
```sh
npm install replace-in-html
```

Yarn:
```sh
yarn add replace-in-html
```

then in JS:
```js
import replaceInHtml from "replace-in-html";

const replaced = replaceInHtml("<p>original html</p>", /original/g, "modified");
console.log(replaced);
```

### Browser
```html
<script src="https://unpkg.com/replace-in-html"></script>
<script>
  const replaced = window.replaceInHtml("<p>original html</p>", /original/g, "modified");
  console.log(replaced);
</script>
```

## Usage
```js
replaceInHtml(html, search, replacer)
```

- `html`: a string containing the HTML to perform the replacing on (note that it can't be a document with `<html>`, `<head>` or `<body>`; it should only contain elements that go inside `<body>`)
- `search`: a string or `RegExp` to replace (don't forget `/g` in the regular expression if you want to find all matching substrings!)
- `replacer`: either an HTML string to replace with; or a function that accepts the matching text and returns an HTML string, a `Node` (e. g. created using `document.createElement(name)`) or an array of `Node`s

Returns an HTML string.

## How it works
`replace-in-html` uses `DOMParser` to parse your HTML into an isolated document
that doesn't have access to your page; traverses it, replaces any matching text
and returns the resulting body. It's safe, small and decently fast. (Note that
if you're processing user-generated HTML, you still have to sanitize it.)

<!---
## Signature
```ts
replaceInHtml(html: string, search: string | RegExp, replacer: (match: string) => string | Node | Node[]): string
```
--->

***

&copy; 2021 [cutiful](https://github.com/cutiful)
