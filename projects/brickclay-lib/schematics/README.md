# @brickclay-org/ui Library Schematics

This directory contains Angular schematics for the @brickclay-org/ui library, providing automated setup and installation.

## What is ng-add?

The `ng-add` schematic is executed when users run:

```bash
ng add @brickclay-org/ui
```

## What Does It Do?

The schematic automatically:

1. **Detects Angular Version**: Reads the user's `@angular/core` version from package.json
2. **Validates Compatibility**: Ensures Angular version is between 17-21 (supported range)
3. **Installs Matching CDK**: Installs `@angular/cdk` with a version matching the user's Angular version
4. **Installs Dependencies**: Ensures `moment` is installed (peer dependency)
5. **Provides Feedback**: Shows clear console messages about what's being installed

## How It Works

### Version Detection

The schematic uses `@schematics/angular/utility/dependencies` to:

- Read the user's `package.json`
- Extract the Angular version
- Calculate the matching CDK version

### Example Flow

**User has Angular 19:**

```bash
ng add @brickclay-org/ui
# Output:
# 🚀 Setting up @brickclay-org/ui library...
# ✅ Detected Angular version: 19
# ✅ Installing @angular/cdk@^19.0.0 to match Angular 19
# ✅ Installing moment@^2.29.0
# 🎉 @brickclay-org/ui library has been successfully configured!
```

**User has Angular 17:**

```bash
ng add @brickclay-org/ui
# Output:
# 🚀 Setting up @brickclay-org/ui library...
# ✅ Detected Angular version: 17
# ✅ Installing @angular/cdk@^17.0.0 to match Angular 17
# ✅ Using existing moment@^2.30.1
# 🎉 @brickclay-org/ui library has been successfully configured!
```

**User has Angular 22 (unsupported):**

```bash
ng add @brickclay-org/ui
# Output:
# ❌ @brickclay-org/ui library supports Angular versions 17-21, but found Angular 22.
# Please upgrade or downgrade your Angular version.
```

## File Structure

```
schematics/
├── collection.json          # Schematic collection definition
└── ng-add/
    ├── index.ts            # Main schematic logic
    └── schema.json         # Schematic options schema
```

## Key Files

### collection.json

Defines the available schematics in this collection. Currently only includes `ng-add`.

### ng-add/index.ts

Contains the main logic:

- Version detection
- Dependency resolution
- Package installation
- User feedback

### ng-add/schema.json

Defines the schema for the schematic options (currently just the project name).

## How It Compares to Angular Material

This implementation follows the same pattern as `@angular/material`:

| Feature                 | Angular Material | @brickclay-org/ui |
| ----------------------- | ---------------- | ------- |
| Detects Angular version | ✅               | ✅      |
| Installs matching CDK   | ✅               | ✅      |
| Version validation      | ✅               | ✅      |
| Clear user feedback     | ✅               | ✅      |
| Handles existing deps   | ✅               | ✅      |

## Development

### Building Schematics

```bash
npm run build:schematics
```

This compiles the TypeScript files in `schematics/` to JavaScript.

### Testing Locally

See [TESTING_NG_ADD.md](../TESTING_NG_ADD.md) for detailed testing instructions.

### Debugging

To see detailed schematic execution:

```bash
ng add @brickclay-org/ui --verbose
```

## Publishing

When publishing the library, ensure:

1. ✅ Schematics are compiled: `npm run build:schematics`
2. ✅ Library is built: `ng build`
3. ✅ Schematic files are in dist: Check `dist/brickclay-lib/schematics/`
4. ✅ package.json references schematics: `"schematics": "./schematics/collection.json"`

## Troubleshooting

**Schematic not found:**

- Verify `package.json` has `"schematics": "./schematics/collection.json"`
- Check that compiled JS files exist in `dist/brickclay-lib/schematics/`

**Wrong CDK version installed:**

- Check the version detection logic in `index.ts`
- Verify peer dependencies in library's `package.json`

**TypeScript errors:**

- Ensure `@angular-devkit/schematics` and `@schematics/angular` are installed
- Check `tsconfig.schematics.json` configuration
