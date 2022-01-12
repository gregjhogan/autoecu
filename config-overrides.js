module.exports = function override(config, env) {
  config.output.globalObject = `(typeof self !== 'undefined' ? self : this)`

  config.module.rules.push({
    test: /\.worker\.js$/,
    use: { loader: 'worker-loader' }
  })

  return config;
}
