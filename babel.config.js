module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    'hot-updater/babel-plugin'
  ],
  env: {
    production: {
      plugins: [
        ['transform-remove-console', {
          exclude: ['error', 'warn'],
        }],
      ],
    },
  },
};
