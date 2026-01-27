# Brickclay Library - Assets Setup

When installing `brickclay-lib` from npm, you need to configure your Angular project to copy the library's assets to your application.

## Method 1: Configure angular.json (Recommended)

Add the following to your `angular.json` under the `build` target's `assets` array:

```json
{
  "projects": {
    "your-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/favicon.ico",
              "src/assets",
              {
                "glob": "**/*",
                "input": "node_modules/brickclay-lib/assets",
                "output": "/assets/brickclay-lib/"
              }
            ]
          }
        }
      }
    }
  }
}
```

This will copy all assets from `node_modules/brickclay-lib/assets` to your app's `/assets/brickclay-lib/` folder during build.

## Method 2: Manual Copy (Alternative)

If you prefer to customize the icons, you can manually copy them:

```bash
# Copy icons to your assets folder
cp -r node_modules/brickclay-lib/assets/icons src/assets/brickclay-lib/
```

## Verification

After setup, the icons should be accessible at:

- `assets/brickclay-lib/icons/calender.svg`
- `assets/brickclay-lib/icons/chevron-left.svg`
- `assets/brickclay-lib/icons/chevron-right.svg`
- `assets/brickclay-lib/icons/timer.svg`

## Troubleshooting

If icons don't load:

1. Check that the assets are copied to `dist/your-app/assets/brickclay-lib/icons/` after build
2. Verify the `angular.json` configuration is correct
3. Clear your build cache and rebuild: `ng build --no-cache`
