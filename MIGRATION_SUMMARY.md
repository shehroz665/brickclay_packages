# Icon Assets Migration - Summary

## What Changed

✅ **Migrated from base64-encoded icons to actual SVG files**

### Before:
- Icons were embedded as base64 data URIs in `icons.ts`
- Large, hard-to-maintain strings
- Increased bundle size

### After:
- Icons are now actual SVG files in `projects/brickclay-lib/src/assets/icons/`
- Icons referenced as paths: `'assets/brickclay-lib/icons/calender.svg'`
- Cleaner, maintainable, and more efficient

## Files Modified

1. **`projects/brickclay-lib/src/assets/icons/`** (new folder)
   - Contains all SVG icon files copied from `public/assets/calender/`

2. **`projects/brickclay-lib/ng-package.json`**
   - Added `"assets": ["src/assets/**/*"]` to include assets in the build

3. **`projects/brickclay-lib/src/lib/assets/icons.ts`**
   - Changed from base64 data URIs to asset paths
   - Icons now reference: `'assets/brickclay-lib/icons/[icon-name].svg'`

4. **`angular.json`** (your local dev setup)
   - Added asset configuration to copy library assets during development

5. **`projects/brickclay-lib/README.md`**
   - Added "Asset Configuration" section with setup instructions for npm users

6. **`projects/brickclay-lib/ASSETS_SETUP.md`** (new file)
   - Detailed setup guide for library consumers

## How It Works

### For NPM Package Users:

When users install your library from npm, they need to:

1. Add configuration to their `angular.json`:
```json
{
  "glob": "**/*",
  "input": "node_modules/@brickclay-org/ui/assets",
  "output": "/assets/brickclay-lib/"
}
```

2. This copies the assets from `node_modules/@brickclay-org/ui/assets` to their app's `dist/assets/brickclay-lib/` folder during build.

### For Library Development:

Your local `angular.json` is already configured to copy assets from:
- `projects/brickclay-lib/src/assets` → `/assets/brickclay-lib/`

This means during development, the icons will work exactly as they will for end users.

## Benefits

✅ **Smaller bundle size** - SVG files are only loaded when needed
✅ **Better maintainability** - Easy to update/replace icons
✅ **Professional approach** - Standard practice for Angular libraries
✅ **Flexibility** - Users can customize icons if needed
✅ **Better caching** - Browser can cache individual SVG files

## Testing

To test locally:
1. Build the library: `ng build brickclay-lib`
2. Check that assets are in: `dist/brickclay-lib/assets/`
3. Run your app: `ng serve`
4. Icons should display correctly in the calendar component

## Publishing

When you publish to npm (`npm publish`), the `dist/brickclay-lib/assets/` folder will be included in the package, and users can access the icons by following the setup instructions in the README.
