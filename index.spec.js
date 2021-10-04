import replace from "./index.js";

describe("basic functionality", () => {
  it("replaces a string with a string", () => {
    const output = replace("<p>hi :meow:!</p>", ":meow:", "cat");
    expect(output).toBe("<p>hi cat!</p>");
  });

  it("replaces a string with an HTML element created from a string", () => {
    const output = replace("<p>hi :meow:!</p>", ":meow:", "<span>cat</span>");
    expect(output).toBe("<p>hi <span>cat</span>!</p>");
  });

  it("replaces a string in a nested element with an HTML element created from a string", () => {
    const output = replace("<p>hi <span>:meow:</span>!</p>", ":meow:", "<span>cat</span>");
    expect(output).toBe("<p>hi <span><span>cat</span></span>!</p>");
  });

  it("replaces multiple consecutive strings", () => {
    const output = replace("meowmeowmeow", "meow", "<span>cat</span>");
    expect(output).toBe("<span>cat</span><span>cat</span><span>cat</span>");
  });

  it("works with a replacer function", () => {
    const output = replace("meowmeowmeow", "meow", m => `<span>!${m}!</span>`);
    expect(output).toBe("<span>!meow!</span><span>!meow!</span><span>!meow!</span>");
  });

  it("preserves the order", () => {
    let i = 0;
    const output = replace("meowmeowmeow", "meow", m => `<span>${++i}</span>`);
    expect(output).toBe("<span>1</span><span>2</span><span>3</span>");
  });

  it("doesn't mess siblings up", () => {
    let i = 0;
    const output = replace(
      "cheese meow, potato, meow, meow meow cat <span>hello, meow</span>",
      /meow/g,
      m => `${++i}`,
    );

    expect(output).toBe("cheese 1, potato, 2, 3 4 cat <span>hello, 5</span>");
  });
});

describe("things we shouldn't replace", () => {
  it("doesn't replace strings in attributes", () => {
    const output = replace(
      "<p class=\"meow\"><a href=\"https://meow.meow\">yay</a></p>",
      "meow",
      "<span>cat</span>",
    );

    expect(output).toBe("<p class=\"meow\"><a href=\"https://meow.meow\">yay</a></p>");
  });

  it("doesn't replace anything inside <script>", () => {
    const output = replace(
      "<script>var meow = \"(=^_^=)\";</script>",
      "meow",
      "cattttt",
    );

    expect(output).toBe("<script>var meow = \"(=^_^=)\";</script>");
  });

  it("doesn't replace anything inside <style>", () => {
    const output = replace(
      "<style>.meow::before { content: \"(=^_^=)\"; }</style>",
      "meow",
      "cattttt",
    );

    expect(output).toBe("<style>.meow::before { content: \"(=^_^=)\"; }</style>");
  });
});

describe("regular expressions", () => {
  it("works with a regular expression", () => {
    let i = 0;
    const output = replace("meowmeowmeow", /meow/, m => `<span>${++i}</span>`);
    expect(output).toBe("<span>1</span>meowmeow");
  });

  it("works with a global regular expression", () => {
    let i = 0;
    const output = replace("meowmeowmeow", /meow/g, m => `<span>${++i}</span>`);
    expect(output).toBe("<span>1</span><span>2</span><span>3</span>");
  });

  it("works with a regular expression and nested elements", () => {
    let i = 0;
    const output = replace(
      "<a href=\"meow\">meow</a><article><h1 class=\"meow\">meow!</h1><p>meow wow</p></article>",
      /meow/,
      m => `${++i}`,
    );

    expect(output).toBe("<a href=\"meow\">1</a><article><h1 class=\"meow\">2!</h1><p>3 wow</p></article>");
  });

  it("works with a more complex regular expression", () => {
    let i = 0;
    const output = replace(
      "cheese meow, potato, meow, meow meow cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(",
      /m(eow|iau)/g,
      m => `${++i}`,
    );

    expect(output).toBe("cheese 1, potato, 2, 3 4 cat <span>hello, french cat</span> 5 <span>hello, english cat</span> 6 &gt;:(");
  });

  it("works with a regular expression that wants a match from start to end", () => {
    let i = 0;
    const output = replace(
      "cheese meow, potato, meow, meow meow cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(",
      /^ miau $/g,
      m => `${++i}`,
    );

    expect(output).toBe("cheese meow, potato, meow, meow meow cat <span>hello, french cat</span>1<span>hello, english cat</span> meow &gt;:(");
  });

  it("works with a lookahead", () => {
    const output = replace(
      "cheese meow, potato, meow, meow meow cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(",
      /meow meow(?= cat)/g,
      "(=^_^=)",
    );

    expect(output).toBe("cheese meow, potato, meow, (=^_^=) cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(");
  });
});

describe("replacer return types", () => {
  it("works with a replacer function returning a DOM node", () => {
    const output = replace(
      "cheese meow, potato, meow, meow meow cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(",
      /meow meow(?= cat)/g,
      m => {
        const el = document.createElement("a");
        el.href = "https://purr.neocities.org";
        el.innerHTML = "meow!";

        return el;
      },
    );

    expect(output).toBe("cheese meow, potato, meow, <a href=\"https://purr.neocities.org\">meow!</a> cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(");
  });

  it("works with a replacer function returning a DocumentFragment", () => {
    const output = replace(
      "cheese meow, potato, meow, meow meow cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(",
      /meow meow/g,
      m => {
        const frag = new DocumentFragment;
        const el1 = document.createElement("a");
        el1.href = "https://purr.neocities.org";
        el1.innerHTML = "meow!";
        frag.appendChild(el1);

        const el2 = document.createElement("span");
        el2.innerHTML = " henlo";
        frag.appendChild(el2);

        return frag;
      },
    );

    expect(output).toBe("cheese meow, potato, meow, <a href=\"https://purr.neocities.org\">meow!</a><span> henlo</span> cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(");
  });

  it("works with a replacer function returning an array of nodes", () => {
    const output = replace(
      "cheese meow, potato, meow, meow meow cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(",
      /meow meow/g,
      m => {
        const el1 = document.createElement("a");
        el1.href = "https://purr.neocities.org";
        el1.innerHTML = "meow!";

        const el2 = document.createElement("span");
        el2.innerHTML = " henlo";

        return [el1, el2];
      },
    );

    expect(output).toBe("cheese meow, potato, meow, <a href=\"https://purr.neocities.org\">meow!</a><span> henlo</span> cat <span>hello, french cat</span> miau <span>hello, english cat</span> meow &gt;:(");
  });

  it("works with a setup closer to the real world", () => {
    const output = replace(
      "cheese meow.example.org, potato, meow, meow meow cat <span>hello, french cat</span> miau.example.org <span>hello, english.example.org cat</span> meow &gt;:(",
      /\w+\.example\.org/g,
      m => {
        const el = document.createElement("a");
        el.href = `https://${m}`;
        el.innerHTML = m;

        return el;
      },
    );

    expect(output).toBe("cheese <a href=\"https://meow.example.org\">meow.example.org</a>, potato, meow, meow meow cat <span>hello, french cat</span> <a href=\"https://miau.example.org\">miau.example.org</a> <span>hello, <a href=\"https://english.example.org\">english.example.org</a> cat</span> meow &gt;:(");
  });
});

describe("examples from readme", () => {
  test("example #1", () => {
    const output = replace(`<a href="https://meow.example.org">meow</a>`, "meow", `<img src="./cat.png">`);
    expect(output).toBe("<a href=\"https://meow.example.org\"><img src=\"./cat.png\"></a>");
  });

  test("example #2", () => {
    const output = replace(
      `<p class="me">Nested elements and regexps: <span>replace <b>me!</b></span> <span>and me!</span></p>`,
      /(?<!\w)me/g,
      "without replacing \"me\" in \"elements\"",
    );

    expect(output).toBe("<p class=\"me\">Nested elements and regexps: <span>replace <b>without replacing \"me\" in \"elements\"!</b></span> <span>and without replacing \"me\" in \"elements\"!</span></p>");
  });

  test("example #3", () => {
    const output = replace(
      `<div><code>replacer</code> can be a string or a function returning $return_types</div>`,
      /\$return_types/g,
      match => {
        const el = document.createElement("span");
        el.className = match.slice(1);
        el.innerHTML = "a string, DOM Node or an array of DOM Nodes";

        return el;
      },
    );

    expect(output).toBe("<div><code>replacer</code> can be a string or a function returning <span class=\"return_types\">a string, DOM Node or an array of DOM Nodes</span></div>");
  });

  test("example #4", () => {
    const output = replace(
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

    expect(output).toBe(
      `<p>So let's try an example closer to the real world<img class=\"custom_emoji\" title=\":question:\" alt=\":question:\" src=\"https://cdn.example.org/i/emoji/question.png\"></p>
<p>How about... <img class=\"custom_emoji\" title=\":lightbulb:\" alt=\":lightbulb:\" src=\"https://cdn.example.org/i/emoji/lightbulb.png\"> custom emoji tags? <img class=\"custom_emoji\" title=\":blobcat:\" alt=\":blobcat:\" src=\"https://cdn.example.org/i/emoji/blobcat.png\"></p>`,
    );
  });
});
