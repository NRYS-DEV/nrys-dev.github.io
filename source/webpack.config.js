const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const CopyWebpackPlugin = require('copy-webpack-plugin')
const fs = require('fs').promises

// we should search through the directories in examples, and use
// the name from the files to generate the HtmlWebpackPlugin settings.

const ITEM_PREFIX = path.join(__dirname, 'samples/items/')

module.exports = async () => {
  const { generatedEntries, generatedPlugins } = await getDirectoryEntries()

  return {
    module: {
      rules: [
        {
          test: /\.glsl$/i,
          use: 'raw-loader'
        }
      ]
    },
    mode: 'development',
    entry: {
      ...generatedEntries,
      'sample-1': {
        import: './samples/sample-1.js'
      },
      'sample-2': {
        import: './samples/sample-2.js'
      },
      'moving-truck': {
        import: './samples/moving-truck.js'
      },
      sample: {
        import: './samples/sample-template.js'
      }
    },
    devtool: 'inline-source-map',
    devServer: {
      // static: ['./dist', './assets']
      static: [
        {
          directory: path.join(__dirname, 'assets'),
          publicPath: '/assets'
        },
        {
          directory: path.join(__dirname, 'dist')
        }
      ]
    },
    plugins: [
      // new CopyWebpackPlugin({
      //   patterns: [{ from: 'assets', to: 'assets' }]
      // }),
      ...generatedPlugins
      // new HtmlWebpackPlugin({
      //   filename: 'truck.html',
      //   template: 'template.html',
      //   chunks: ['moving-truck']
      // }),
      // new HtmlWebpackPlugin({
      //   filename: 'index-1.html',
      //   template: 'template.html',
      //   chunks: ['sample-1']
      // }),
      // new HtmlWebpackPlugin({
      //   filename: 'sample.html',
      //   template: 'template.html',
      //   chunks: ['sample']
      // }),
      // new HtmlWebpackPlugin({
      //   filename: 'index-1.html',
      //   template: 'template.html',
      //   chunks: ['sample-1']
      // }),
      // new HtmlWebpackPlugin({
      //   filename: 'index-2.html',
      //   chunks: ['sample-2'],
      //   template: 'template.html'
      // })
    ],
    output: {
      filename: 'js/[name].js'
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    },
    experiments: {
      asyncWebAssembly: true
    }
  }
}

const getDirectoryEntries = async () => {
  const generatedPlugins = []
  const generatedEntries = {}

  const Items = [
    'Project',

  ]
  for (const item of Items) {
    const entries = await fs.readdir(ITEM_PREFIX + item, {
      withFileTypes: true
    })
    const candidates = entries.filter((entry) => entry.name.endsWith('.js'))

    for (const candidate of candidates) {
      const name = path.parse(candidate.name).name
      const plugin = new HtmlWebpackPlugin({
        filename: item + '/' + name + '.html',
        chunks: [name],
        template: 'template.html'
      })

      generatedEntries[name] = {
        import: ITEM_PREFIX + item + '/' + candidate.name
      }

      generatedPlugins.push(plugin)
    }
  }

  return { generatedEntries, generatedPlugins }
}
