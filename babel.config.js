module.exports = {
  presets: [
    'next/babel',
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src'
        }
      }
    ]
  ],
  overrides: [
    {
      include: ['./src'],
      exclude: ['**/*.ts', '**/*.tsx']
    }
  ]
}
