const fs = require("node:fs");
const path = require("node:path");
const { notarize } = require("@electron/notarize");

function resolveCredentials() {
  if (process.env.APPLE_KEYCHAIN_PROFILE) {
    return {
      keychainProfile: process.env.APPLE_KEYCHAIN_PROFILE,
      ...(process.env.APPLE_KEYCHAIN ? { keychain: process.env.APPLE_KEYCHAIN } : {}),
      strategy: "keychain-profile",
    };
  }

  if (process.env.APPLE_API_KEY && process.env.APPLE_API_KEY_ID) {
    return {
      appleApiKey: process.env.APPLE_API_KEY,
      appleApiKeyId: process.env.APPLE_API_KEY_ID,
      ...(process.env.APPLE_API_ISSUER ? { appleApiIssuer: process.env.APPLE_API_ISSUER } : {}),
      strategy: "api-key",
    };
  }

  if (process.env.APPLE_ID && process.env.APPLE_APP_SPECIFIC_PASSWORD && process.env.APPLE_TEAM_ID) {
    return {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
      strategy: "apple-id",
    };
  }

  return null;
}

module.exports = async function notarizeApp(context) {
  const { electronPlatformName, appOutDir, packager } = context;

  if (electronPlatformName !== "darwin") {
    return;
  }

  if (process.env.SKIP_NOTARIZE === "1") {
    console.log("[notarize] SKIP_NOTARIZE=1, skip notarization");
    return;
  }

  const credentials = resolveCredentials();
  if (!credentials) {
    console.log("[notarize] credentials not found, skip notarization");
    console.log("[notarize] set APPLE_ID + APPLE_APP_SPECIFIC_PASSWORD + APPLE_TEAM_ID");
    console.log("[notarize] or set APPLE_API_KEY + APPLE_API_KEY_ID (+APPLE_API_ISSUER)");
    console.log("[notarize] or set APPLE_KEYCHAIN_PROFILE (+APPLE_KEYCHAIN)");
    return;
  }

  const appName = packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  if (!fs.existsSync(appPath)) {
    throw new Error(`[notarize] app not found at path: ${appPath}`);
  }

  const { strategy, ...notarizeCredentials } = credentials;
  console.log(`[notarize] begin notarization with strategy=${strategy}`);

  await notarize({
    appPath,
    ...notarizeCredentials,
  });

  console.log("[notarize] notarization completed");
};
