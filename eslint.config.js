import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'hrmv0.4-main/**/*']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
