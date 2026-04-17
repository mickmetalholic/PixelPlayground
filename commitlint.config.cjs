const ALLOWED_TYPES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
];

const CJK_REGEX = /[\u4E00-\u9FFF]/u;

const toStringPart = (value) => {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join('\n');
  }
  return '';
};

const hasCjk = (input) => CJK_REGEX.test(input);

module.exports = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'no-cjk-in-message': (parsed) => {
          const subject = toStringPart(parsed.subject).trim();
          const body = toStringPart(parsed.body).trim();
          const footer = toStringPart(parsed.footer).trim();

          const hasForbiddenCjk = [subject, body, footer]
            .filter(Boolean)
            .some(hasCjk);

          return [
            !hasForbiddenCjk,
            'subject, body, and footer must not contain CJK characters (U+4E00-U+9FFF)',
          ];
        },
      },
    },
  ],
  rules: {
    'type-enum': [2, 'always', ALLOWED_TYPES],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'no-cjk-in-message': [2, 'always'],
  },
  ignores: [
    (message = '') => /^Merge branch '.+'$/.test(message),
    (message = '') => /^Merge remote-tracking branch '.+'$/.test(message),
    (message = '') => /^Merge pull request #\d+/.test(message),
    (message = '') => /^Revert "(?:.|\n)+"$/.test(message),
    (message = '') => /^Revert '(?:.|\n)+'$/.test(message),
  ],
};
