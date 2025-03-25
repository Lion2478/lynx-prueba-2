import { defineConfig } from '@lynx-js/rspeedy'
import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginReactLynx } from '@lynx-js/react-rsbuild-plugin'

export default defineConfig({
  plugins: [
    pluginQRCode(),
    pluginReactLynx(),
  ],
  server: {
    port: 8080
  },
  source: {
    define: {
      'process.env.PORT': JSON.stringify('8080')
    }
  }
})
