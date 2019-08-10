export type TokenType = 
    'LEFT_PAREN' | 'RIGHT_PAREN' | 'LEFT_BRACE' | 'RIGHT_BRACE' |
    'COMMA' | 'DOT' | 'MINUS' | 'PLUS' | 'SEMICOLON' | 'SLASH' | 'STAR' |

    'BANG' | 'BANG_EQUAL' | 'EQUAL' | 'EQUAL_EQUAL' |
    'GREATER' | 'GREATER_EQUAL' | 'LESS' | 'LESS_EQUAL' |
    
    'IDENTIFIER' | 'STRING' | 'NUMBER' |

    'AND' | 'CLASS' | 'ELSE' | 'FALSE' | 'FUN' | 'FOR' | 'IF' | 'NIL' | 'OR' |
    'PRINT' | 'RETURN' | 'SUPER' | 'THIS' | 'TRUE' | 'VAR' | 'WHILE' |
  
    'EOF';    

export const Keywords: {[k: string]: TokenType} = {
    and: 'AND',
    class: 'CLASS',
    else: 'ELSE',
    false: 'FALSE',
    fun: 'FUN',
    for: 'FOR',
    if: 'IF',
    nil: 'NIL',
    or: 'OR',
    print: 'PRINT',
    return: 'RETURN',
    super: 'SUPER',
    this: 'THIS',
    true: 'TRUE',
    var: 'VAR',
    while: 'WHILE'
};

export const TokenTypes = makeEnum([
  // Single-character tokens.
  'LEFT_PAREN', 'RIGHT_PAREN', 'LEFT_BRACE', 'RIGHT_BRACE',
  'COMMA', 'DOT', 'MINUS', 'PLUS', 'SEMICOLON', 'SLASH', 'STAR',

  // One or two character tokens.
  'BANG', 'BANG_EQUAL', 'EQUAL', 'EQUAL_EQUAL',
  'GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL',

  // Literals.
  'IDENTIFIER', 'STRING', 'NUMBER',

  // Keywords.
  'AND', 'CLASS', 'ELSE', 'FALSE', 'FUN', 'FOR', 'IF', 'NIL', 'OR',
  'PRINT', 'RETURN', 'SUPER', 'THIS', 'TRUE', 'VAR', 'WHILE',

  'EOF'
]);

// Creates a js object from a string[] where each key === value.
function makeEnum(vars: TokenType[]): {[k: string]: TokenType } {
    const _e: {[key: string]: TokenType } = {};
    for (const v of vars) {
        _e[v] = v;
    }
    return _e;
}
