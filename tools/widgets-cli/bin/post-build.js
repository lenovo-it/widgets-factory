const path = require('path');
const fsExtra = require('fs-extra');

(function postBuild() {
  const packageDir = path.resolve(__dirname, '../');
  const artifactsDir = path.resolve(packageDir, './npm');
  const napiPackageName = require(path.resolve(packageDir, './package.json')).napi.name;
  // const templatesDir = path.resolve(packageDir, './templates');

  fsExtra.readdirSync(artifactsDir).forEach(function (artifactName) {
    const currentPackagePath = path.resolve(artifactsDir, artifactName);
    // fsExtra.copySync(templatesDir, path.resolve(currentPackagePath, './templates'), { overwrite: true });

    const artifactFileName = `${napiPackageName}.${artifactName}.node`;
    const artifactOutputPath = path.resolve(packageDir, artifactFileName);
    if (fsExtra.existsSync(artifactOutputPath)) {
      fsExtra.copyFileSync(artifactOutputPath, path.resolve(currentPackagePath, artifactFileName));
    }
  });
})();
