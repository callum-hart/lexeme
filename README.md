```
  /LL
| LL
| LL         /eeeeee   /xx   /xx   /eeeeee   /mmmmmm/mmmm    /eeeeee
| LL        /ee__  ee |  xx /xx/  /ee__  ee | mm_  mm_  mm  /ee__  ee
| LL       | eeeeeeee  \  xxxx/  | eeeeeeee | mm \ mm \ mm | eeeeeeee
| LL       | ee_____/   >xx  xx  | ee_____/ | mm | mm | mm | ee_____/
| LLLLLLLL |  eeeeeee  /xx/\  xx |  eeeeeee | mm | mm | mm |  eeeeeee
|________/  \_______/ |__/  \__/  \_______/ |__/ |__/ |__/  \_______/
```

Lexeme is a [lexical analyzer](https://en.wikipedia.org/wiki/Lexical_analysis) that turns CSS into parser friendly tokens.

## Install

Install Lexeme from [npm](https://www.npmjs.com/package/lexeme):

```
npm install lexeme
```

Or with yarn:

```
yarn add lexeme
```

Then require it into any module:

```
const { tokenize } = require('lexeme');
```

## Tokens

A single token is represented as an `Array` with the following shape:

```js
[
  // The token type, for example `BRACE_OPEN`
  type{String},

  // The value of the token, for example `{`
  value{String},

  // The position of the string being tokenized, for example [1,10]
  location{Array<line<number>, column<?number>}
]
```

**Token Types**

| Type | Example |
| --- |---|
| BRACE_OPEN | `{` |
| BRACE_CLOSE | `}` |
| MEDIA_QUERY | `@media (min-width: 300px)` |
| KEYFRAME | `@keyframes slide` |
| KEYFRAME_SELECTOR | `from` \| `to` \| `0-100%` |
| FONT_FACE | `@font-face` |
| CHARSET | `@charset` |
| SUPPORTS | `@supports` |
| DECLARATION | `display: flex;` |
| SELECTOR | `nav` \| `span.icon` \| `h1, h2, h3` |

Note: Inline and multi-line comments in CSS are ignored.

## API

### tokenize

```
tokenize(CSS)
```

- **Description:**

  Transforms CSS into tokens.

- **Parameters:**
  - `CSS{String}`: The CSS source code.

- **Returns:**

  An interface to query tokens:

  ```
  {
    tokens: ƒ tokens()
    selectors: ƒ selectors()
    declarations: ƒ declarations()
    mediaQueries: ƒ mediaQueries()
    rulesets: ƒ rulesets()
    rulesetsAsObjects: ƒ rulesetsAsObjects()
  }
  ```

### .tokens()

```
tokenize(CSS).tokens();
```

- **Returns:**

  An `Array` containing all tokens.

### .selectors()

```
tokenize(CSS).selectors();
```

- **Returns:**

  An `Array` containing tokens of the type `SELECTOR`.

### .declarations()

```
tokenize(CSS).declarations();
```

- **Returns:**

  An `Array` containing tokens of the type `DECLARATION`.

### .mediaQueries()

```
tokenize(CSS).mediaQueries();
```

- **Returns:**

  An `Array` containing tokens of the type `MEDIA_QUERY`.

### .rulesets()

```
tokenize(CSS).rulesets();
```

- **Returns:**

  An `Array` containing a `Map` for each ruleset:

  ```
  [
    Map {
      selector{String},
      declarations{Array<String>}
    },
    Map {
      ...
    }
  ]
  ```

### .rulesetsAsObjects()

```
tokenize(CSS).rulesetsAsObjects();
```

- **Returns:**

  An `Array` containing an `Object` for each ruleset:

  ```
  [
    {
      selector{String},
      declarations{Array<String>}
    },
    {
      ...
    }
  ]
  ```

## Tests

Run all tests with:

```
npm test
```

Or run a specific test with:

```
npm test tokens
```

## Licence

[MIT](https://github.com/callum-hart/lexeme/blob/master/LICENSE)

Copyright (c) 2018-present, Callum Hart