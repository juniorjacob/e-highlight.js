/*
Language: C-like foundation grammar for C/C++ grammars
Author: Ivan Sagalaev <maniac@softwaremaniacs.org>
Contributors: Evgeny Stepanischev <imbolk@gmail.com>, Zaven Muradyan <megalivoithos@gmail.com>, Roel Deckers <admin@codingcat.nl>, Sam Wu <samsam2310@gmail.com>, Jordi Petit <jordi.petit@gmail.com>, Pieter Vantorre <pietervantorre@gmail.com>, Google Inc. (David Benjamin) <davidben@google.com>
Category: common, system
*/

/* In the future the intention is to split out the C/C++ grammars distinctly
since they are separate languages.  They will likely share a common foundation
though, and this file sets the groundwork for that - so that we get the breaking
change in v10 and don't have to change the requirements again later.

See: https://github.com/highlightjs/highlight.js/issues/2146
*/

export default function(hljs) {
  function optional(s) {
    return '(?:' + s + ')?';
  }
  var DECLTYPE_AUTO_RE = 'decltype\\(auto\\)'
  var NAMESPACE_RE = '[a-zA-Z_]\\w*::'
  var TEMPLATE_ARGUMENT_RE = '<.*?>';
  var FUNCTION_TYPE_RE = '(' +
    DECLTYPE_AUTO_RE + '|' +
    optional(NAMESPACE_RE) +'[a-zA-Z_]\\w*' + optional(TEMPLATE_ARGUMENT_RE) +
  ')';
  var CPP_SYMBOLS = {
    className: 'symbol',
    begin: '==|->|::|&&|[*=+%-&]'
  };
  var CPP_PRIMITIVE_TYPES = {
    className: 'keyword_type',
    begin: '\\b[a-z\\d_]*_t\\b|__[imp][n61t][t42r]([8136]|)([di246]|)|' + 'STATUS_([A-Z0-9_]+)'
  };
  var CPP_LOCATION = {
    className: 'cpp_location',
    begin: '[a-zA-Z0-9_]+:\\n'
  };

  // https://en.cppreference.com/w/cpp/language/escape
  // \\ \n \t \a \b \f \r \v \' \" | (\\ \x \xFF \u2837 \u00323747 \374)
  var CHARACTER_ESCAPES = '\\\\[\'\"?\\abfnrtv]|\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)'
  var ESCAPE_STRINGS = {
    className: 'escape_string',
    begin: CHARACTER_ESCAPES
  };

  var STRINGS = {
    className: 'string',
    variants: [
      {
        begin: '(u8?|U|L)?"', end: CHARACTER_ESCAPES + '|"',
        illegal: '\\n',
        contains: [ESCAPE_STRINGS, hljs.BACKSLASH_ESCAPE]
      },
      {
        begin: '(u8?|U|L)?\'', end: '\'',
        illegal: '.'
      },
      hljs.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/,
      })
    ],
    contains: [
      ESCAPE_STRINGS
    ]
  };

  var NUMBERS = {
    className: 'number',
    variants: [
      { begin: '\\b(0b[01\']+)' },
      { begin: '(-?)\\b([\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)(u|U|l|L|ul|UL|f|F|b|B)' },
      { begin: '(-?)(\\b0[xX][a-fA-F0-9\']+|(\\b[\\d\']+(\\.[\\d\']*)?|\\.[\\d\']+)([eE][-+]?[\\d\']+)?)' }
    ],
    relevance: 0
  };

  var PREPROCESSOR = {
    className: 'meta',
    begin: /#\s*[a-z]+\b/, end: /$/,
    keywords: {
      'meta-keyword':
        'if else elif endif define undef warning error line ' +
        'pragma _Pragma ifdef ifndef include'
    },
    contains: [
      {
        begin: /\\\n/, relevance: 0
      },
      hljs.inherit(STRINGS, {className: 'meta-string'}),
      {
        className: 'meta-string',
        begin: /<.*?>/, end: /$/,
        illegal: '\\n',
      },
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE
    ]
  };

  var TITLE_MODE = {
    className: 'title',
    begin: /*optional(NAMESPACE_RE) +*/ hljs.IDENT_RE,
    relevance: 0,
    contains: [
      CPP_SYMBOLS
    ]
  };

  var FUNCTION_TITLE = optional(NAMESPACE_RE) + hljs.IDENT_RE + '\\s*\\(';

  var CPP_KEYWORDS = {
    keyword_type: 'char wchar_t char16_t char32_t int unsigned byte DWORD',
    keyword: 'int float while private catch import module export virtual class operator sizeof ' +
      'dynamic_cast|10 typedef const_cast|10 const for static_cast|10 union namespace ' +
      'unsigned long volatile static protected bool template mutable if public friend ' +
      'do goto auto enum else break extern using asm case typeid ' +
      'short reinterpret_cast|10 default double register explicit signed typename try this ' +
      'switch continue inline delete alignas alignof constexpr consteval constinit decltype ' +
      'concept co_await co_return co_yield requires ' +
      'noexcept static_assert thread_local restrict final override ' +
      'atomic_bool atomic_char atomic_schar ' +
      'atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong ' +
      'atomic_ullong new throw return ' +
      'and and_eq bitand bitor compl not not_eq or or_eq xor xor_eq ' +
      'NTSTATUS',
    built_in: 'string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream ' +
      'auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set ' +
      'unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos ' +
      'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp ' +
      'fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper ' +
      'isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow ' +
      'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp ' +
      'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan ' +
      'vfprintf vprintf vsprintf endl initializer_list unique_ptr _Bool complex _Complex imaginary _Imaginary',
    literal: 'bool true false nullptr NULL void ' +
    'printf malloc memchr ' +
    'memcpy memcpy_s memset memset_s memmove memmove_s memcmp memcmp_s ' +
    'strcpy strcpy_s strncpy strncpy_s strcat strcat_s strncat strncat_s ' +
    'strcmp strcmp_s strcoll strcoll_s strncmp strncmp_s strxfrm strxfrm_s ' +
    'strchr strchr_s strcspn strcspn_s strrchr strrchr_s strspn strspn_s strstr ' +
    'strstr_s strtok strtok_s strerror strerror_s strlen strlen_s',
    symbol: '== -> :: && * = + % -'
  };

  var EXPRESSION_CONTAINS = [
    CPP_PRIMITIVE_TYPES,
    CPP_SYMBOLS,
    hljs.C_LINE_COMMENT_MODE,
    hljs.C_BLOCK_COMMENT_MODE,
    NUMBERS,
    ESCAPE_STRINGS,
    STRINGS
  ];

  var EXPRESSION_CONTEXT = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {begin: /=/, end: /;/},
      {begin: /\(/, end: /\)/},
      {beginKeywords: 'new throw return else', end: /;/}
    ],
    keywords: CPP_KEYWORDS,
    contains: EXPRESSION_CONTAINS.concat([
      {
        begin: /\(/, end: /\)/,
        keywords: CPP_KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat(['self']),
        relevance: 0
      },
      CPP_SYMBOLS
    ]),
    relevance: 0
  };

  var FUNCTION_DECLARATION = {
    className: 'function',
    begin: '(' + FUNCTION_TYPE_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
    returnBegin: true, end: /[{;=]/,
    excludeEnd: true,
    keywords: CPP_KEYWORDS,
    illegal: /[^\w\s\*&:<>]/,
    contains: [
      { // to prevent it from being confused as the function title
        begin: DECLTYPE_AUTO_RE,
        keywords: CPP_KEYWORDS,
        relevance: 0,
      },
      {
        begin: FUNCTION_TITLE, returnBegin: true,
        contains: [CPP_SYMBOLS, TITLE_MODE],
        relevance: 0
      },
      {
        className: 'params',
        begin: /\(/, end: /\)/,
        keywords: CPP_KEYWORDS,
        relevance: 0,
        contains: [
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          ESCAPE_STRINGS,
          STRINGS,
          NUMBERS,
          CPP_PRIMITIVE_TYPES,
          CPP_SYMBOLS,
          CPP_LOCATION,
          // Count matching parentheses.
          {
            begin: /\(/, end: /\)/,
            keywords: CPP_KEYWORDS,
            relevance: 0,
            contains: [
              'self',
              hljs.C_LINE_COMMENT_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              ESCAPE_STRINGS,
              STRINGS,
              NUMBERS,
              CPP_PRIMITIVE_TYPES,
              CPP_SYMBOLS,
              CPP_LOCATION
            ]
          }
        ]
      },
      CPP_PRIMITIVE_TYPES,
      CPP_SYMBOLS,
      CPP_LOCATION,
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      PREPROCESSOR
    ]
  };

  return {
    aliases: ['c', 'cc', 'h', 'c++', 'h++', 'hpp', 'hh', 'hxx', 'cxx'],
    keywords: CPP_KEYWORDS,
    // the base c-like language will NEVER be auto-detected, rather the
    // derivitives: c, c++, arduino turn auto-detect back on for themselves
    disableAutodetect: true,
    illegal: '</',
    contains: [].concat(
      EXPRESSION_CONTEXT,
      FUNCTION_DECLARATION,
      EXPRESSION_CONTAINS,
      CPP_LOCATION,
      [
      PREPROCESSOR,
      { // containers: ie, `vector <int> rooms (9);`
        begin: '\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', end: '>',
        keywords: CPP_KEYWORDS,
        contains: ['self', CPP_PRIMITIVE_TYPES, CPP_SYMBOLS, CPP_LOCATION]
      },
      {
        begin: hljs.IDENT_RE /*+ '::'*/,
        keywords: CPP_KEYWORDS,
        contains: [
          CPP_SYMBOLS,
          CPP_LOCATION
        ]
      },
      {
        className: 'class',
        beginKeywords: 'class struct', end: /[{;:]/,
        contains: [
          {begin: /</, end: />/, contains: ['self']}, // skip generic stuff
          hljs.TITLE_MODE,
          CPP_SYMBOLS,
          CPP_LOCATION
        ]
      }
    ]),
    exports: {
      escape_strings: ESCAPE_STRINGS,
      preprocessor: PREPROCESSOR,
      strings: STRINGS,
      keywords: CPP_KEYWORDS
    }
  };
}
