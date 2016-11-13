var typescript = require('rollup-plugin-typescript');
var builtins = require('rollup-plugin-node-builtins');
var globals = require('rollup-plugin-node-globals');

var rollupConfig = {
  
  moduleName : 'electrum',

  entry: 'lib/index.ts',

  sourceMap: true,

  format: 'cjs',

  dest: 'build/bundle.js',

  plugins: [    
      builtins() ,
      globals(),
      typescript()      
  ]

};

module.exports = rollupConfig;
