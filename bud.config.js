import { generateFonts, FontAssetType, OtherAssetType } from 'fantasticon';
import * as chokidar from 'chokidar';

/**
 * Compiler configuration
 *
 * @see {@link https://roots.io/docs/sage sage documentation}
 * @see {@link https://bud.js.org/guides/configure bud.js configuration guide}
 *
 * @type {import('@roots/bud').Config}
 */
export default async (bud) => {
  const genSvgIcon = async (pathToSvg) => {
    await generateFonts({
      name: 'sagetheme',
      fontTypes: [FontAssetType.EOT, FontAssetType.WOFF2, FontAssetType.WOFF, FontAssetType.TTF, FontAssetType.SVG],
      assetTypes: [OtherAssetType.HTML, OtherAssetType.CSS, OtherAssetType.SCSS],
      inputDir: `${pathToSvg}/svgicons`,
      outputDir: `${pathToSvg}/fonts`,
      templates: {
        scss: `${pathToSvg}/svgicons/_template-iconfont_scss.hbs`,
        css: `${pathToSvg}/svgicons/_template-iconfont_css.hbs`,
        html: `${pathToSvg}/svgicons/_template-iconfont_html.hbs`,
      },
    })
  }

  const watchSvgIcon = (pathToSvg) => {
    const watcher = chokidar.watch([`${pathToSvg}/svgicons/*.svg`], {
      ignoreInitial: true
    })
    watcher
      .on('add', async () => {
        await genSvgIcon(pathToSvg)
      })
      .on('change', async () => {
        await genSvgIcon(pathToSvg)
      })
      .on('unlink', async () => {
        await genSvgIcon(pathToSvg)
      })
  }

  /**
   * Development server settings
   *
   * @see {@link https://bud.js.org/docs/bud.setUrl}
   * @see {@link https://bud.js.org/docs/bud.setProxyUrl}
   * @see {@link https://bud.js.org/docs/bud.watch}
   */
  const cert = await bud.fs.read(`${process.env.USER_WORKSPACE}developyzer/docker/traefik/config/ssl/iris.io.crt`)
  const key = await bud.fs.read(`${process.env.USER_WORKSPACE}developyzer/docker/traefik/config/ssl/iris.io.key`)

  bud
    .compilePaths(bud.path())
    .use([`@roots/bud-react`, `@roots/bud-typescript`, `@roots/bud-preset-wordpress`])
    .serve(`https://0.0.0.0:3000`, {
      cert, key, ssl: true,
    })
    .setPublicUrl(`${process.env.WP_HOME}:3000`)
    .proxy(process.env.WP_HOME)
    //.setProxyUrl(process.env.WP_HOME)
    .setPublicProxyUrl(process.env.WP_HOME)
    .watch(['resources/views', 'app']);

  /**
   * Generate WordPress `theme.json`
   *
   * @note This overwrites `theme.json` on every build.
   *
   * @see {@link https://bud.js.org/extensions/sage/theme.json}
   * @see {@link https://developer.wordpress.org/block-editor/how-to-guides/themes/theme-json}
   */
  bud.wpjson
    .setSettings({
      color: {
        custom: false,
        customDuotone: false,
        customGradient: false,
        defaultDuotone: false,
        defaultGradients: false,
        defaultPalette: false,
        duotone: [],
      },
      custom: {
        spacing: {},
        typography: {
          'font-size': {},
          'line-height': {},
        },
      },
      spacing: {
        padding: true,
        units: ['px', '%', 'em', 'rem', 'vw', 'vh'],
      },
      typography: {
        customFontSize: false,
      },
    })
    .useTailwindColors()
    .useTailwindFontFamily()
    .useTailwindFontSize();

  /**
   * Application assets & entrypoints
   *
   * @see {@link https://bud.js.org/docs/bud.entry}
   * @see {@link https://bud.js.org/docs/bud.assets}
   */
  await bud.sequence([
    // Generate SVG icons
    async bud => {
      await genSvgIcon(bud.path('./resources'));
    },
    // Watch SVG icons, only on development
    async bud => {
      bud.when(
        bud.isDevelopment,
        () => {
          watchSvgIcon(bud.path('./resources'))
        });
    },
    // Theme
    async bud => {
      await bud
        .make(
          {
            label: 'sagetheme',
            basedir: bud.path('./')
          },
          async app => {
            app
              .setPublicPath('/app/themes/sagetheme/public/')
              .compilePaths(bud.path('../../../../'))
              .entry({
                app: {import: ['@scripts/app', '@styles/app.scss'], runtime: false},
                editor: {import: ['@scripts/editor', '@styles/editor.scss'], runtime: false},
                'carrousel-sit': {import: ['@src/blocks/carrousel-sit/index'], runtime: false},
              })
              .assets(['images', 'fonts']);
            app.runtime(false);
            app.minimize();
            app.devtool('source-map');
            app.splitChunks(true);
          }
        );
    }
  ])
};
