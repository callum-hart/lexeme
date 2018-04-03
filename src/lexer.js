/**
 * Convert CSS source code into parser friendly tokens.
 *
 * It should be noted that pre-tokenization CSS source is transformed
 * to a unified format. This allows us to safely assume the structure
 * of all source code is identical and contains valid CSS, enabling
 * easier and faster tokenization.
 *
 * A single token has the following shape:
 *
 * [
 *   tokenType*,
 *   tokenValue*,
 *   locationData*
 * ]
 *
 * locationData: has the shape: [ line*, col ]
 *
 */

const prettier = require('prettier');


// token types
const BRACE_OPEN        = 'BRACE_OPEN';        // {
const BRACE_CLOSE       = 'BRACE_CLOSE';       // }
const MEDIA_QUERY       = 'MEDIA_QUERY';       // @media (min-width: 300px) and (max-width: 600px)
const KEYFRAME          = 'KEYFRAME';          // @keyframes
const KEYFRAME_SELECTOR = 'KEYFRAME_SELECTOR'; // from, to, 0-100%
const FONT_FACE         = 'FONT_FACE';         // @font-face
const CHARSET           = 'CHARSET';           // @charset
const SUPPORTS          = 'SUPPORTS';          // @supports
const DECLARATION       = 'DECLARATION';       // property: value
const SELECTOR          = 'SELECTOR';          // a.link

const BLANK             = '';


function process(CSS) {
  return format(CSS.replace(/\/\*([\s\S]*?)\*\//gm, BLANK) /* remove comments */)
    .replace(/{$|;$|}$/gm, '$&🐹')
    .split('🐹')
    .filter(chunk => chunk.trim() !== BLANK)
    .reduce((arr, chunk, pos) => {
      const line = chunk.replace(/\n\s+|\n/gm, BLANK);
      const token = getToken(line, pos);

      if (token) {
        if (token.plural) {
          arr.push(...token);
        } else {
          arr.push(token);
        }
      }

      return arr;
  }, []);
}

/**
 * Transform CSS source code into a unified format (prior to parsing).
 *
 * Formatting courtesy of prettier which provides CSS syntax validation
 * for free.
 *
 * @param   {String} CSS  - raw CSS
 * @return  {String}      - formatted CSS
 * @throws  {Error}       - when CSS is invalid
 */
function format(CSS) {
  try {
    return prettier.format(CSS, { parser: 'css'});
  } catch (e) {
    console.log(`[Format] Invalid CSS found. \n └─ ${e.name}: ${e.loc.start.reason} \n ${e.codeFrame}`);
    throw new Error('Invalid CSS found');
  }
}

function getToken(value, pos) {
  if (isClosingBrace(value)) {
    return closingBrace(pos);
  }

  if (isMediaQuery(value)) {
    return atRule(pos, MEDIA_QUERY, value);
  }

  if (isKeyFrame(value)) {
    return atRule(pos, KEYFRAME, value);
  }

  if (isFontFace(value)) {
    return atRule(pos, FONT_FACE, value);
  }

  if (isCharSet(value)) {
    return atRule(pos, CHARSET, value);
  }

  if (isSupports(value)) {
    return atRule(pos, SUPPORTS, value);
  }

  if (isDeclaration(value)) {
    return declaration(pos, value);
  }

  if (isKeyFrameSelector(value)) {
    return selector(pos, KEYFRAME_SELECTOR, value);
  }

  if (isSelector(value)) {
    return selector(pos, SELECTOR, value);
  }
}

// Token identifiers --

function isClosingBrace(value) {
  // line only contains a closing brace i.e: `}`
  return value.match(/}$/);
}

function isMediaQuery(value) {
  // line is a @media at-rule i.e: `@media (min-width: 300px) {`
  return value.match(/^@media.+{$/);
}

function isKeyFrame(value) {
  // line is a @keyframes at-rule i.e: `@keyframes bounce {`
  return value.match(/^@keyframes.+{$/);
}

function isFontFace(value) {
  // line is a @font-face at-rule i.e: `@font-face {`
  return value.match(/^@font-face.+{$/);
}

function isCharSet(value) {
  // line is a @charset at-rule i.e: `@charset "UTF-8";`
  return value.match(/^@charset.*;$/);
}

function isSupports(value) {
  // line is a @supports at-rule i.e: `@supports (display: flex) {`
  return value.match(/^@supports.+{$/);
}

function isDeclaration(value) {
  // line is a CSS declaration i.e: `background-color: rgba(0,0,0,.1);`
  return value.match(/.\S*[^\n]+\s*;/);
}

function isKeyFrameSelector(value) {
  // line is a keyframe-selector (from, to, 0-100%) i.e: `from {`
  return value.match(/^from\s+{|^to\s+{|^\d{1,3}%\s+{/);
}

function isSelector(value) {
  // line is a selector, canbe be a grouped selector i.e: `a.link {` or `h1, h2 {`
  return value.match(/.+{|.+,/);
}


// Tokens --

function openingBrace(pos, value) {
  return [
    BRACE_OPEN,
    '{',
    [
      pos + 1,
      value.indexOf('{') + 1
    ]
  ];
}

function closingBrace(pos) {
  return [
    BRACE_CLOSE,
    '}',
    [ pos + 1 ]
  ];
}

/**
 * Get token(s) for a given at-rule. Can be:
 *
 * - `@media`
 * - `@keyframe`
 * - `@font-face`
 * - `@charset`
 * - `@supports`
 *
 * An at-rule can consist of 1 or 2 tokens, depending on its type:
 *
 * 1. first token is always the rule i.e: `@keyframes bounce`
 * 2. second [optional] token is an opening brace (if at-rule has one) i.e: `{`
 *
 * @param  {Number} pos   - index of current line in file
 * @param  {String} type  - type of at-rule
 * @param  {String} value - fully qualified at-rule
 * @return {Array}        - array of 1 or 2 tokens
 */
function atRule(pos, type, value) {
  const tokens = new Array();

  switch (type) {
    case CHARSET:
      tokens.push(
        CHARSET,
        value,
        [ pos + 1 ]
      );
      break;
    default:
      tokens.plural = true;

      tokens.push(
        [
          type,
          value.replace(/\s+{/, BLANK),
          [ pos + 1 ]
        ],
        [...openingBrace(pos, value)]
      );
      break;
  }

  return tokens;
}

function declaration(pos, declaration) {
  return [
    DECLARATION,
    declaration,
    [ pos + 1 ]
  ]
}

/**
 * Get token(s) for a given selector. Can be:
 *
 * - CSS selector
 * - Keyframe selector
 *
 * @param  {Number} pos   - index of current line in file
 * @param  {String} type  - type of selector
 * @param  {String} value - fully qualified selector
 * @return {Array}        - array containing selector type and brace
 */
function selector(pos, type, value) {
  const tokens = new Array();
  tokens.plural = true;

  tokens.push(
    [
      type,
      value.replace(/\s+{/, BLANK),
      [ pos + 1 ]
    ],
    [...openingBrace(pos, value)]
  );

  return tokens;
}

module.exports = {
  process,
  BRACE_CLOSE,
  MEDIA_QUERY,
  DECLARATION,
  SELECTOR
}