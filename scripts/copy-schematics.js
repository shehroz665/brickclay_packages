const fs = require('fs');
const path = require('path');

// Paths
const compiledSchematicsDir = path.join(__dirname, '../out-tsc/schematics/schematics');
const sourceSchematicsDir = path.join(__dirname, '../projects/brickclay-lib/schematics');
const sourcePackageJson = path.join(__dirname, '../projects/brickclay-lib/package.json');
const destDir = path.join(__dirname, '../dist/brickclay-lib/schematics');
const distPackageJson = path.join(__dirname, '../dist/brickclay-lib/package.json');

// Function to copy directory recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('📦 Copying schematics to dist...');

// Copy compiled JavaScript files
if (fs.existsSync(compiledSchematicsDir)) {
  copyRecursiveSync(compiledSchematicsDir, destDir);
  console.log('✅ Compiled schematics (JS) copied successfully');
} else {
  console.error('❌ Compiled schematics not found at:', compiledSchematicsDir);
  process.exit(1);
}

// Copy JSON files (schema.json, collection.json) from source
const jsonFiles = [
  {
    src: path.join(sourceSchematicsDir, 'collection.json'),
    dest: path.join(destDir, 'collection.json'),
  },
  {
    src: path.join(sourceSchematicsDir, 'ng-add/schema.json'),
    dest: path.join(destDir, 'ng-add/schema.json'),
  },
];

jsonFiles.forEach((file) => {
  if (fs.existsSync(file.src)) {
    const destDirPath = path.dirname(file.dest);
    if (!fs.existsSync(destDirPath)) {
      fs.mkdirSync(destDirPath, { recursive: true });
    }
    fs.copyFileSync(file.src, file.dest);
    console.log(`✅ Copied ${path.basename(file.src)}`);
  } else {
    console.error(`❌ File not found: ${file.src}`);
    process.exit(1);
  }
});

// Update package.json to include schematics configuration
if (fs.existsSync(distPackageJson)) {
  const packageJson = JSON.parse(fs.readFileSync(distPackageJson, 'utf8'));
  const srcPackageJson = JSON.parse(fs.readFileSync(sourcePackageJson, 'utf8')); // ← Read source

  // Add schematic configuration
  packageJson.schematics = './schematics/collection.json';
  packageJson.description =
    'A comprehensive Angular UI component library with calendar, checkbox, radio, and toggle components';
  packageJson['ng-add'] = {
    save: 'dependencies',
  };

  // ✅ PRESERVE peerDependencies from source package.json (no more hardcoding!)
  if (srcPackageJson.peerDependencies) {
    packageJson.peerDependencies = srcPackageJson.peerDependencies;
  }

  // ✅ PRESERVE peerDependenciesMeta from source package.json
  if (srcPackageJson.peerDependenciesMeta) {
    packageJson.peerDependenciesMeta = srcPackageJson.peerDependenciesMeta;
  }

  fs.writeFileSync(distPackageJson, JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json updated with schematic configuration');
} else {
  console.error('❌ dist/package.json not found');
  process.exit(1);
}

console.log('🎉 Build post-processing complete!');
