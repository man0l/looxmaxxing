const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const STOREKIT_FILENAME = 'looxmaxxing.storekit';

const withCopyStoreKitConfig = (config) =>
  withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const { projectRoot, platformProjectRoot, projectName } = cfg.modRequest;
      const source = path.join(projectRoot, 'plugins', STOREKIT_FILENAME);
      const destDir = path.join(platformProjectRoot, projectName);
      const dest = path.join(destDir, STOREKIT_FILENAME);

      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(source, dest);

      return cfg;
    },
  ]);

const withStoreKitSchemeReference = (config) =>
  withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const { platformProjectRoot, projectName } = cfg.modRequest;
      const schemePath = path.join(
        platformProjectRoot,
        `${projectName}.xcodeproj`,
        'xcshareddata',
        'xcschemes',
        `${projectName}.xcscheme`,
      );

      if (!fs.existsSync(schemePath)) {
        console.warn(`[withStoreKitConfig] scheme not found at ${schemePath}, skipping`);
        return cfg;
      }

      let xml = fs.readFileSync(schemePath, 'utf8');

      if (xml.includes('StoreKitConfigurationFileReference')) {
        return cfg;
      }

      const storeKitPath = path.join(platformProjectRoot, projectName, STOREKIT_FILENAME);
      const identifier = path.relative(path.dirname(schemePath), storeKitPath);

      const reference =
        `      <StoreKitConfigurationFileReference\n` +
        `         identifier = "${identifier}">\n` +
        `      </StoreKitConfigurationFileReference>\n`;

      xml = xml.replace(/(<LaunchAction[^>]*>\n)/, `$1${reference}`);

      fs.writeFileSync(schemePath, xml, 'utf8');

      return cfg;
    },
  ]);

// Xcode only resolves the scheme's StoreKitConfigurationFileReference (and stops
// showing it in red / "None" in Product > Scheme > Edit Scheme > Options) once the
// .storekit file is also registered as a PBXFileReference in the project itself --
// the same thing "Add StoreKit Configuration Settings to Workspace..." does from the UI.
const withStoreKitProjectReference = (config) =>
  withXcodeProject(config, (cfg) => {
    try {
      const project = cfg.modResults;
      const projectName = cfg.modRequest.projectName;

      const alreadyReferenced = Object.values(
        project.hash.project.objects.PBXFileReference || {},
      ).some((ref) => typeof ref === 'object' && ref.path === `"${STOREKIT_FILENAME}"`);

      if (!alreadyReferenced) {
        const groupKey = project.findPBXGroupKey({ name: projectName });
        project.addFile(STOREKIT_FILENAME, groupKey);
      }
    } catch (error) {
      console.warn(`[withStoreKitConfig] could not register .storekit file in pbxproj: ${error}`);
    }

    return cfg;
  });

module.exports = function withStoreKitConfig(config) {
  config = withCopyStoreKitConfig(config);
  config = withStoreKitSchemeReference(config);
  config = withStoreKitProjectReference(config);
  return config;
};
