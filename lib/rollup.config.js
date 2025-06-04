import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/markdown-to-json-ld.js',
    format: 'umd',
    name: 'MarkdownToJsonLd',
    globals: {
      'js-yaml': 'jsyaml'
    }
  },
  external: ['js-yaml'],
  plugins: [
    nodeResolve({
      extensions: ['.js']
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
      exclude: 'node_modules/**'
    }),
    terser()
  ]
};