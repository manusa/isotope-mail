// Configuration could be added to webpack loader, but jest specifically requires this file to read the babel config
module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-dynamic-import'
  ]
};
