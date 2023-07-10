/* eslint-disable */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  css: {
    sourceMap: false,
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/_colors.scss"; @import "@/assets/_animations.scss";`,
        sassOptions: {
          quietDeps: true,
          debugInfo: true
        }
      }
    }
  }
})
