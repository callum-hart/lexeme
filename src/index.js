const Lexer = require('./lexer');


function tokenize(CSS) {
  const tokens = Lexer.process(CSS);
  const {
    BRACE_CLOSE,
    MEDIA_QUERY,
    DECLARATION,
    SELECTOR
  } = Lexer;

  return {
    tokens() {
      return tokens;
    },
    selectors() {
      return tokens.filter(([type]) => type === SELECTOR);
    },
    declarations() {
      return tokens.filter(([type]) => type === DECLARATION);
    },
    mediaQueries() {
      return tokens.filter(([type]) => type === MEDIA_QUERY);
    },
    rulesets() {
      let ruleset = new Map();

      return tokens.filter(([type]) => {
        return type === SELECTOR ||
          type === DECLARATION ||
          type === BRACE_CLOSE;
      }).reduce((arr, [token, value]) => {
        switch (token) {
          case SELECTOR:
            ruleset.set('selector', value);
            break;
          case DECLARATION:
            if (ruleset.has('selector')) {
              if (ruleset.has('declarations')) {
                ruleset.set('declarations', [...ruleset.get('declarations'), value]);
              } else {
                ruleset.set('declarations', [value]);
              }
            }
            break;
          case BRACE_CLOSE:
            if (ruleset.size) {
              arr.push(ruleset);
              ruleset = new Map();
            }
            break;
        }

        return arr;
      }, []);
    },
    rulesetsAsObjects() {
      // turn rulesets from {Array<Map>} to {Array<Object>}
      return this.rulesets().map(ruleset => {
        return Array.from(ruleset).reduce((obj, [key, value]) => (
          Object.assign(obj, {[key]: value})
        ), {});
      });
    }
  }
}

module.exports = { tokenize };