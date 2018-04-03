const Lexer = require('../src/lexer');


test('Grouped rule-set', () => {
  const CSS = `
  h1, h2, h3 {
    color: aliceblue;
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SELECTOR", "h1,h2,h3", [1]],
    ["BRACE_OPEN", "{", [1, 10]],
    ["DECLARATION", "color: aliceblue;", [2]],
    ["BRACE_CLOSE", "}", [3]]
  ]);
});


test('Simple media query', () => {
  const CSS = `
  @media (max-width:300px) {
    div.hideOnSmall {
      display: none;
    }
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["MEDIA_QUERY", "@media (max-width: 300px)", [1]],
    ["BRACE_OPEN", "{", [1, 27]],
    ["SELECTOR", "div.hideOnSmall", [2]],
    ["BRACE_OPEN", "{", [2, 17]],
    ["DECLARATION", "display: none;", [3]],
    ["BRACE_CLOSE", "}", [4]],
    ["BRACE_CLOSE", "}", [5]]
  ]);
});


test('Keyframe using percentages', () => {
  const CSS = `
  @keyframes fontbulger {
    0% {
      font-size: 10px;
    }
    30% {
      font-size: 15px;
    }
    100% {
      font-size: 12px;
    }
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["KEYFRAME", "@keyframes fontbulger", [1]],
    ["BRACE_OPEN", "{", [1, 23]],
    ["KEYFRAME_SELECTOR", "0%", [2]],
    ["BRACE_OPEN", "{", [2, 4]],
    ["DECLARATION", "font-size: 10px;", [3]],
    ["BRACE_CLOSE", "}", [4]],
    ["KEYFRAME_SELECTOR", "30%", [5]],
    ["BRACE_OPEN", "{", [5, 5]],
    ["DECLARATION", "font-size: 15px;", [6]],
    ["BRACE_CLOSE", "}", [7]],
    ["KEYFRAME_SELECTOR", "100%", [8]],
    ["BRACE_OPEN", "{", [8, 6]],
    ["DECLARATION", "font-size: 12px;", [9]],
    ["BRACE_CLOSE", "}", [10]],
    ["BRACE_CLOSE", "}", [11]]
  ]);
});


test('Keyframe with comma-separated keyframe-selectors', () => {
  const CSS = `
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-50px);
    }
    60% {
      transform: translateY(-40px);
    }
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["KEYFRAME", "@keyframes bounce", [1]],
    ["BRACE_OPEN", "{", [1, 19]],
    ["SELECTOR", "0%,20%,50%,80%,100%", [2]],
    ["BRACE_OPEN", "{", [2, 21]],
    ["DECLARATION", "transform: translateY(0);", [3]],
    ["BRACE_CLOSE", "}", [4]],
    ["KEYFRAME_SELECTOR", "40%", [5]],
    ["BRACE_OPEN", "{", [5, 5]],
    ["DECLARATION", "transform: translateY(-50px);", [6]],
    ["BRACE_CLOSE", "}", [7]],
    ["KEYFRAME_SELECTOR", "60%", [8]],
    ["BRACE_OPEN", "{", [8, 5]],
    ["DECLARATION", "transform: translateY(-40px);", [9]],
    ["BRACE_CLOSE", "}", [10]],
    ["BRACE_CLOSE", "}", [11]]
  ]);
});


test('Keyframe with keyword keyframe-selectors (from & to)', () => {
  const CSS = `
  @keyframes slide {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100px);
    }
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["KEYFRAME", "@keyframes slide", [1]],
    ["BRACE_OPEN", "{", [1, 18]],
    ["KEYFRAME_SELECTOR", "from", [2]],
    ["BRACE_OPEN", "{", [2, 6]],
    ["DECLARATION", "transform: translateX(0);", [3]],
    ["BRACE_CLOSE", "}", [4]],
    ["KEYFRAME_SELECTOR", "to", [5]],
    ["BRACE_OPEN", "{", [5, 4]],
    ["DECLARATION", "transform: translateX(100px);", [6]],
    ["BRACE_CLOSE", "}", [7]],
    ["BRACE_CLOSE", "}", [8]]
  ]);
});


test('Font-face at-rule', () => {
  const CSS = `
  @font-face {
    font-family: "Open Sans";
    src: url("/fonts/OpenSans-Regular-webfont.woff2") format("woff2"),
         url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["FONT_FACE", "@font-face", [1]],
    ["BRACE_OPEN", "{", [1, 12]],
    ["DECLARATION", "font-family: \"Open Sans\";", [2]],
    ["DECLARATION", "src: url(\"/fonts/OpenSans-Regular-webfont.woff2\") format(\"woff2\"),url(\"/fonts/OpenSans-Regular-webfont.woff\") format(\"woff\");", [3]],
    ["BRACE_CLOSE", "}", [4]]
  ]);
});


test('Charset at-rule', () => {
  const CSS = `
  @charset "utf-8";
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["CHARSET", '@charset "utf-8";', [ 1 ]]
  ]);
});


test('Supports at-rule', () => {
  const CSS = `
  @supports (display: flex) {
    div {
      display: flex;
    }
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SUPPORTS", "@supports (display: flex)", [1]],
    ["BRACE_OPEN", "{", [1, 27]],
    ["SELECTOR", "div", [2]],
    ["BRACE_OPEN", "{", [2, 5]],
    ["DECLARATION", "display: flex;", [3]],
    ["BRACE_CLOSE", "}", [4]],
    ["BRACE_CLOSE", "}", [5]]
  ]);
});


test('Supports at-rule with negation', () => {
  const CSS = `
  @supports not (display: flex) {
    div {
      float: left;
    }
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SUPPORTS", "@supports not (display: flex)", [1]],
    ["BRACE_OPEN", "{", [1, 31]],
    ["SELECTOR", "div", [2]],
    ["BRACE_OPEN", "{", [2, 5]],
    ["DECLARATION", "float: left;", [3]],
    ["BRACE_CLOSE", "}", [4]],
    ["BRACE_CLOSE", "}", [5]]
  ]);
});


test('Media query with grouped selector', () => {
  const CSS = `
  @media (min-width:301px) and @media (max-width: 667px) {
    h1, h2, h3 {
      font-weight: 500;
    }
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["MEDIA_QUERY", "@media (min-width: 301px) and @media (max-width: 667px)", [ 1 ]],
    ["BRACE_OPEN", "{", [1, 57]],
    ["SELECTOR", "h1,h2,h3", [2]],
    ["BRACE_OPEN", "{", [2, 10]],
    ["DECLARATION", "font-weight: 500;", [3]],
    ["BRACE_CLOSE", "}", [4]],
    ["BRACE_CLOSE", "}", [5]]
  ]);
});


test('Comments should be ignored', () => {
  const CSS = `
  nav {
    height: 40px /* comment before semi-colon */;
    height: 5.2vh; /* comment after semi-colon */
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SELECTOR", "nav", [1]],
    ["BRACE_OPEN", "{", [1, 5]],
    ["DECLARATION", "height: 40px;", [2]],
    ["DECLARATION", "height: 5.2vh;", [3]],
    ["BRACE_CLOSE", "}", [4]]
  ]);
});


test('Commented out rulesets should be ignored', () => {
  const CSS = `
  /*
  nav {
    height: 40px;
    height: 5.2vh;
  }
  */
  `;

  expect(Lexer.process(CSS)).toEqual([]);
});


test('Multi-line declarations should be parsed', () => {
  const CSS = `
  footer {
    background-color: rgba(255,0,0,.8);
    background-image: linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
                     linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
                     linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%);

  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SELECTOR", "footer", [1]],
    ["BRACE_OPEN", "{", [1, 8]],
    ["DECLARATION", "background-color: rgba(255, 0, 0, 0.8);", [2]],
    ["DECLARATION", "background-image: linear-gradient(217deg,rgba(255, 0, 0, 0.8),rgba(255, 0, 0, 0) 70.71%),linear-gradient(127deg, rgba(0, 255, 0, 0.8), rgba(0, 255, 0, 0) 70.71%),linear-gradient(336deg, rgba(0, 0, 255, 0.8), rgba(0, 0, 255, 0) 70.71%);", [3]],
    ["BRACE_CLOSE", "}", [4]]
  ]);
});


test('Selectors containing keyframe keywords are selectors', () => {
  const CSS = `
  .from {
    opacity: 0;
  }

  .to {
    opacity: 1;
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SELECTOR", ".from", [1]],
    ["BRACE_OPEN", "{", [1, 7]],
    ["DECLARATION", "opacity: 0;", [2]],
    ["BRACE_CLOSE", "}", [3]],
    ["SELECTOR", ".to", [4]],
    ["BRACE_OPEN", "{", [4, 5]],
    ["DECLARATION", "opacity: 1;", [5]],
    ["BRACE_CLOSE", "}", [6]]
  ]);
});


test('Selector with pseudo-element (CSS2)', () => {
  const CSS = `
  #logo:after {
    display: block;
    content: " ";
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SELECTOR", "#logo:after", [1]],
    ["BRACE_OPEN", "{", [1, 13]],
    ["DECLARATION", "display: block;", [2]],
    ["DECLARATION", "content: \" \";", [3]],
    ["BRACE_CLOSE", "}", [4]]
  ]);
});


test('Selector with pseudo-element (CSS3)', () => {
  const CSS = `
  #logo::after {
    display: block;
    content: " ";
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SELECTOR", "#logo::after", [1]],
    ["BRACE_OPEN", "{", [1, 14]],
    ["DECLARATION", "display: block;", [2]],
    ["DECLARATION", "content: \" \";", [3]],
    ["BRACE_CLOSE", "}", [4]]
  ]);
});


test('Selector with pseudo-class', () => {
  const CSS = `
  .btn:hover {
    opacity: 0.75;
    cursor: pointer;
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SELECTOR", ".btn:hover", [1]],
    ["BRACE_OPEN", "{", [1, 12]],
    ["DECLARATION", "opacity: 0.75;", [2]],
    ["DECLARATION", "cursor: pointer;", [3]],
    ["BRACE_CLOSE", "}", [4]]
  ]);
});


test('Selector with pseudo-class and pseudo-element', () => {
  const CSS = `
  .btn:hover:after {
    transform: translateX(30px);
  }
  `;

  expect(Lexer.process(CSS)).toEqual([
    ["SELECTOR", ".btn:hover:after", [1]],
    ["BRACE_OPEN", "{", [1, 18]],
    ["DECLARATION", "transform: translateX(30px);", [2]],
    ["BRACE_CLOSE", "}", [3]]
  ]);
});