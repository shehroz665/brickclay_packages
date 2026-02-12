import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependencyType, getPackageJsonDependency } from '@schematics/angular/utility/dependencies';

export interface Schema {
  project?: string;
}

export default function (options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.logger.info('🚀 Setting up @brickclay-org/ui library...');

    // 1. Read user's Angular version from package.json
    const angularCore = getPackageJsonDependency(tree, '@angular/core');
    
    if (!angularCore) {
      throw new Error('❌ Cannot find @angular/core in package.json. Make sure this is an Angular project.');
    }

    // 2. Extract major version (e.g., "^19.0.0" -> "19" or "~18.2.0" -> "18")
    const angularVersion = angularCore.version;
    const majorVersionMatch = angularVersion.match(/(\d+)/);
    
    if (!majorVersionMatch) {
      throw new Error(`❌ Could not determine Angular version from ${angularVersion}`);
    }

    const majorVersion = parseInt(majorVersionMatch[0], 10);

    // 3. Validate Angular version is in supported range (17-21)
    if (majorVersion < 17 || majorVersion > 21) {
      throw new Error(
        `❌ @brickclay-org/ui library supports Angular versions 17-21, but found Angular ${majorVersion}.\n` +
        `Please upgrade or downgrade your Angular version.`
      );
    }

    context.logger.info(`✅ Detected Angular version: ${majorVersion}`);

    // 4. Check if user already has CDK installed
    const existingCdk = getPackageJsonDependency(tree, '@angular/cdk');
    
    if (existingCdk) {
      const existingCdkMajor = existingCdk.version.match(/(\d+)/)?.[0];
      
      // Check if existing CDK version matches Angular version
      if (existingCdkMajor && parseInt(existingCdkMajor) === majorVersion) {
        context.logger.info(`✅ Using existing @angular/cdk@${existingCdk.version}`);
      } else {
        context.logger.warn(
          `⚠️  Found @angular/cdk@${existingCdk.version} but you have Angular ${majorVersion}.\n` +
          `   Consider updating CDK to match your Angular version: npm install @angular/cdk@^${majorVersion}.0.0`
        );
      }
    } else {
      // Install matching CDK version
      const cdkVersion = `^${majorVersion}.0.0`;
      
      addPackageJsonDependency(tree, {
        type: NodeDependencyType.Default,
        name: '@angular/cdk',
        version: cdkVersion,
      });
      
      context.logger.info(`✅ Installing @angular/cdk@${cdkVersion} to match Angular ${majorVersion}`);
    }

    // 5. Schedule npm install
    context.addTask(new NodePackageInstallTask());

    context.logger.info('');
    context.logger.info('🎉 Brickclay library has been successfully configured!');
    context.logger.info('');
    context.logger.info('📚 Next steps:');
    context.logger.info('  1. Import components from "@brickclay-org/ui" in your modules or standalone components');
    context.logger.info('');

    return tree;
  };
}
