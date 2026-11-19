/* main hexo */

"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { version } = require("../package.json");

function scriptJson(value) {
  return JSON.stringify(value)?.replace(/</g, "\\u003c");
}

/**
 * Export theme config to js
 */
hexo.extend.helper.register("export_config", function () {
  let hexo_config = {
    hostname: new URL(this.config.url).hostname || this.config.url,
    root: this.config.root,
    language: this.config.language,
  };

  if (this.config.search) {
    hexo_config.path = this.config.search.path;
  }

  let theme_config = {
    articles: this.theme.articles,
    colors: this.theme.colors,
    global: this.theme.global,
    home_banner: this.theme.home_banner,
    plugins: this.theme.plugins,
    version: version,
    code_block: this.theme.code_block,
    navbar: this.theme.navbar,
    page_templates: this.theme.page_templates,
    home: this.theme.home,

    footerStart: this.theme.footer.start,
  };

  const languageDir = path.join(__dirname, "../languages");
  let languageContent;
  try {
    const file =
      fs.readdirSync(languageDir).find((v) => v === `${this.config.language}.yml`) ||
      "en.yml";
    languageContent = fs.readFileSync(path.join(languageDir, file), "utf8");
    languageContent = yaml.load(languageContent);
  } catch {
    hexo.log.warn("Could not load theme translations. Falling back to English.");
    languageContent = yaml.load(
      fs.readFileSync(path.join(languageDir, "en.yml"), "utf8"),
    );
  }

  let data_config = {
    masonry: false,
  };

  if (this.theme.masonry) {
    data_config.masonry = true;
  }

  return `<script id="hexo-configurations">
    window.config = ${scriptJson(hexo_config)};
    window.theme = ${scriptJson(theme_config)};
    window.lang_ago = ${scriptJson(languageContent?.ago)};
    window.data = ${scriptJson(data_config)};
  </script>`;
});
