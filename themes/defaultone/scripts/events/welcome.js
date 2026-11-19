/**
 * Theme Redefine
 * welcome.js
 */
const { version } = require("../../package.json");

hexo.on("ready", async () => {
  try {
    const response = await fetch("https://redefine-version.ohevan.com/api/v2/info", {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      throw new Error(`Version service returned HTTP ${response.status}`);
    }
    const jsonData = await response.json();
    const redefineData = jsonData?.data;
    const versionPattern = /^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.+-]+)?$/;
    const npmVersion = redefineData?.npmVersion;
    if (
      typeof npmVersion !== "string" ||
      npmVersion.trim() !== npmVersion ||
      !versionPattern.test(npmVersion)
    ) {
      throw new Error("Version service returned an invalid version");
    }

    logInfo(redefineData);
    checkVersionAndCDNAvailability(redefineData);
  } catch (error) {
    hexo.log.warn(`Check latest version failed: ${error}`);
    hexo.locals.set(`cdnTestStatus_cdnjs`, 404);
    hexo.locals.set(`cdnTestStatus_zstatic`, 404);
    hexo.locals.set(`cdnTestStatus_npmMirror`, 404);
  }
});

function logInfo(data) {
  hexo.log.info(
    `
      +======================================================================================+
      |                                                                                      |
      |    _____ _   _ _____ __  __ _____   ____  _____ ____  _____ _____ ___ _   _ _____    |
      |   |_   _| | | | ____|  \\/  | ____| |  _ \\| ____|  _ \\| ____|  ___|_ _| \\ | | ____|   |
      |     | | | |_| |  _| | |\\/| |  _|   | |_) |  _| | | | |  _| | |_   | ||  \\| |  _|     |
      |     | | |  _  | |___| |  | | |___  |  _ <| |___| |_| | |___|  _|  | || |\\  | |___    |
      |     |_| |_| |_|_____|_|  |_|_____| |_| \\_\\_____|____/|_____|_|   |___|_| \\_|_____|   |
      |                                                                                      |
      |                            current v${version}  latest v${data.npmVersion}                             |
      |                  https://github.com/EvanNotFound/hexo-theme-redefine                 |
      +======================================================================================+
                      `,
  );
}

function logFailedInfo() {
  hexo.log.info(
    `
      +======================================================================================+
      |                                                                                      |
      |    _____ _   _ _____ __  __ _____   ____  _____ ____  _____ _____ ___ _   _ _____    |
      |   |_   _| | | | ____|  \\/  | ____| |  _ \\| ____|  _ \\| ____|  ___|_ _| \\ | | ____|   |
      |     | | | |_| |  _| | |\\/| |  _|   | |_) |  _| | | | |  _| | |_   | ||  \\| |  _|     |
      |     | | |  _  | |___| |  | | |___  |  _ <| |___| |_| | |___|  _|  | || |\\  | |___    |
      |     |_| |_| |_|_____|_|  |_|_____| |_| \\_\\_____|____/|_____|_|   |___|_| \\_|_____|   |
      |                                                                                      |
      |                        current v${version}  fetch latest failed                           |
      |                  https://github.com/EvanNotFound/hexo-theme-redefine                 |
      +======================================================================================+
       `,
  );
}

function checkVersionAndCDNAvailability(data) {
  if (data.npmVersion > version) {
    hexo.log.warn(
      `\x1b[33m%s\x1b[0m`,
      `Redefine v${version} is outdated, please update to v${data.npmVersion}!`,
    );
  }

  if (data.npmMirrorCDN) {
    hexo.log.info(
      `\x1b[32m%s\x1b[0m`,
      `CDN available: NPMMirror (Recommended)`,
    );
    hexo.locals.set(`cdnTestStatus_npmMirror`, 200);
  } else {
    hexo.log.warn(`\x1b[31m%s\x1b[0m`, `NPMMirror CDN is unavailable yet.`);
    hexo.locals.set(`cdnTestStatus_npmMirror`, 404);
  }

  if (data.zstaticCDN) {
    hexo.log.info(`\x1b[32m%s\x1b[0m`, `CDN available: ZStatic`);
    hexo.locals.set(`cdnTestStatus_zstatic`, 200);
  } else {
    hexo.log.warn(`\x1b[31m%s\x1b[0m`, `ZStatic CDN is unavailable yet.`);
    hexo.locals.set(`cdnTestStatus_zstatic`, 404);
  }

  if (data.cdnjsCDN) {
    hexo.log.info(`\x1b[32m%s\x1b[0m`, `CDN available: CDNJS`);
    hexo.locals.set(`cdnTestStatus_cdnjs`, 200);
  } else {
    hexo.log.warn(`\x1b[31m%s\x1b[0m`, `CDNJS CDN is unavailable yet.`);
    hexo.locals.set(`cdnTestStatus_cdnjs`, 404);
  }
}
