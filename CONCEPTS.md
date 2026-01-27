# Angular Library Development & Maintenance Guide

A comprehensive guide for building, maintaining, and publishing professional Angular component libraries with Tailwind CSS integration.

---

## 📑 Table of Contents

1. [Understanding Library Structure](#1-understanding-library-structure)
   - [What is an Angular Library?](#what-is-an-angular-library)
   - [Typical Library Structure](#typical-library-structure)
   - [Key Files Explained](#key-files-explained)

2. [Assets Management in Libraries](#2-assets-management-in-libraries)
   - [The Problem](#the-problem)
   - [The Solution: ng-package.json assets Field](#the-solution-ng-packagejson-assets-field)
   - [What Happens During Build](#what-happens-during-build)
   - [Why This Matters](#why-this-matters)

3. [Angular.json Assets Configuration](#3-angularjson-assets-configuration)
   - [The Challenge: Library Assets in User Projects](#the-challenge-library-assets-in-user-projects)
   - [The Solution: Configure User's angular.json](#the-solution-configure-users-angularjson)
   - [Understanding the Asset Configuration Object](#understanding-the-asset-configuration-object)
   - [Complete Example with Multiple Libraries](#complete-example-with-multiple-libraries)
   - [What Happens During Build](#what-happens-during-build-1)
   - [Why This is Necessary](#why-this-is-necessary)
   - [Alternative: Using Full Paths](#alternative-using-full-paths)
   - [Multiple Asset Configurations for Same Library](#multiple-asset-configurations-for-same-library)
   - [Testing Assets Configuration](#testing-assets-configuration)

4. [Understanding Dependencies](#4-understanding-dependencies)
   - [A. dependencies (Regular Dependencies)](#a-dependencies-regular-dependencies)
   - [B. peerDependencies (Peer Dependencies)](#b-peerdependencies-peer-dependencies)
   - [C. devDependencies (Development Dependencies)](#c-devdependencies-development-dependencies)
   - [Complete Example](#complete-example)

5. [Version Ranges Explained](#5-version-ranges-explained)
   - [Semantic Versioning (Semver)](#semantic-versioning-semver)
   - [Version Range Patterns](#version-range-patterns)
   - [Best Practices for Peer Dependencies](#best-practices-for-peer-dependencies)
   - [Testing Version Compatibility](#testing-version-compatibility)

6. [Tailwind Integration Deep Dive](#6-tailwind-integration-deep-dive)
   - [The Challenge](#the-challenge)
   - [Why This Is Problematic](#why-this-is-problematic)
   - [The Solution: Multi-Step Configuration](#the-solution-multi-step-configuration)
   - [Complete Flow Visualization](#complete-flow-visualization)
   - [Why Can't You Pre-process in the Library?](#why-cant-you-pre-process-in-the-library)
   - [Alternative: Pure CSS (No Tailwind Required)](#alternative-pure-css-no-tailwind-required)
   - [Best Practice: Document Requirements Clearly](#best-practice-document-requirements-clearly)

7. [Package.json Exports Field](#7-packagejson-exports-field)
   - [The Problem](#the-problem-1)
   - [The Solution: Exports Field](#the-solution-exports-field)
   - [Understanding Each Export](#understanding-each-export)
   - [Multiple Exports Example](#multiple-exports-example)
   - [Wildcard Exports](#wildcard-exports)
   - [How to Add Exports Field](#how-to-add-exports-field)
   - [Testing Exports](#testing-exports)
   - [Common Export Patterns](#common-export-patterns)

8. [ViewEncapsulation Explained](#8-viewencapsulation-explained)
   - [Three Types of ViewEncapsulation](#three-types-of-viewencapsulation)
   - [A. ViewEncapsulation.Emulated (Default)](#a-viewencapsulationemulated-default)
   - [B. ViewEncapsulation.None](#b-viewencapsulationnone)
   - [C. ViewEncapsulation.ShadowDom](#c-viewencapsulationshadowdom)
   - [Comparison Table](#comparison-table)
   - [Why Your Library Uses None](#why-your-library-uses-none)
   - [Migration Example](#migration-example)

9. [Best Practices for Library Maintenance](#9-best-practices-for-library-maintenance)
   - [A. Versioning Strategy](#a-versioning-strategy)
   - [B. Documentation](#b-documentation)
   - [C. Testing Strategy](#c-testing-strategy)
   - [D. Build & Publish Workflow](#d-build--publish-workflow)
   - [E. What to Include Where](#e-what-to-include-where)
   - [F. Continuous Integration](#f-continuous-integration)
   - [G. Security Best Practices](#g-security-best-practices)

10. [Common Pitfalls to Avoid](#10-common-pitfalls-to-avoid)
    - [❌ Don't Do These](#-dont-do-these)
    - [✅ Do These Instead](#-do-these-instead)

11. [Library Checklist](#11-library-checklist)
    - [Before Each Release](#before-each-release)
    - [Quick Reference Commands](#quick-reference-commands)

12. [Summary](#summary)
    - [Core Requirements](#core-requirements)
    - [This is Standard Practice](#this-is-standard-practice)

13. [Additional Resources](#additional-resources)

---

## 1. Understanding Library Structure

### What is an Angular Library?

An Angular library is a **reusable package** that contains components, services, directives, etc. that can be:

- Published to npm
- Installed in multiple projects
- Versioned independently
- Shared across teams

### Typical Library Structure

```
projects/brickclay-lib/
├── src/
│   ├── public-api.ts          # Exports everything publicly available
│   ├── styles.css             # Main stylesheet (imports all component styles)
│   ├── assets/                # Static assets (icons, images, fonts)
│   │   └── icons/
│   └── lib/
│       ├── toggle/
│       │   ├── toggle.ts      # Component TypeScript
│       │   ├── toggle.html    # Template
│       │   └── toggle.css     # Component styles
│       ├── checkbox/
│       │   ├── checkbox.ts
│       │   ├── checkbox.html
│       │   └── checkbox.css
│       └── radio/
│           ├── radio.ts
│           ├── radio.html
│           └── radio.css
├── package.json               # Library metadata & dependencies
└── ng-package.json           # Build configuration for ng-packagr
```

### Key Files Explained

**`public-api.ts`** - The entry point:

```typescript
// Export all components, services, directives that users can import
export * from './lib/toggle/toggle';
export * from './lib/checkbox/checkbox';
export * from './lib/radio/radio';
```

**`ng-package.json`** - Build configuration:

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/brickclay-lib",
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": ["src/assets/**/*", "src/styles.css"]
}
```

[↑ Back to Table of Contents](#-table-of-contents)

---

## 2. Assets Management in Libraries

### The Problem

When you build an Angular library, **only TypeScript/JavaScript code is bundled by default**. Other files are ignored:

- ❌ CSS files (unless referenced in `styleUrls`)
- ❌ Images, icons, fonts
- ❌ JSON configuration files
- ❌ Any static assets

**Example:**

```typescript
@Component({
  selector: 'lib-toggle',
  styleUrls: ['./toggle.css'], // ✅ This gets bundled
  templateUrl: './toggle.html', // ✅ This gets bundled
})
export class ToggleComponent {}
```

But if you have:

```
src/
├── assets/
│   └── icons/
│       └── calendar-icon.svg  // ❌ This is IGNORED during build
└── styles.css                 // ❌ This is IGNORED unless specified
```

### The Solution: ng-package.json `assets` Field

Tell ng-packagr to **explicitly copy** these files to the distribution folder:

```json
{
  "$schema": "../../node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/brickclay-lib",
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": [
    "src/assets/**/*", // Copy all files from assets folder
    "src/styles.css", // Copy main stylesheet
    "src/lib/toggle/toggle.css", // Copy individual component CSS
    "src/lib/checkbox/checkbox.css",
    "src/lib/radio/radio.css"
  ]
}
```

### What Happens During Build

**Before build:**

```
projects/brickclay-lib/src/
├── assets/
│   └── icons/
│       └── calendar-icon.svg
├── styles.css
└── lib/
    ├── toggle/
    │   └── toggle.css
    ├── checkbox/
    │   └── checkbox.css
    └── radio/
        └── radio.css
```

**After build (`ng build brickclay-lib`):**

```
dist/brickclay-lib/
├── fesm2022/
│   └── minahil.mjs           # Bundled JavaScript
├── esm2022/                  # ES modules
├── assets/
│   └── icons/
│       └── calendar-icon.svg  # ✅ Copied
├── styles.css                 # ✅ Copied
├── toggle.css                 # ✅ Copied
├── checkbox.css               # ✅ Copied
├── radio.css                  # ✅ Copied
├── index.d.ts                 # TypeScript definitions
└── package.json               # Package metadata
```

**After npm publish and user installs:**

```
node_modules/minahil/
├── fesm2022/
├── assets/
│   └── icons/
│       └── calendar-icon.svg  # ✅ Available
├── styles.css                 # ✅ Available
├── toggle.css                 # ✅ Available
└── ...
```

### Why This Matters

If assets are NOT configured:

- ❌ CSS files with `@apply` directives won't be available
- ❌ Icons/images referenced in components won't work
- ❌ Users will get "file not found" errors

[↑ Back to Table of Contents](#-table-of-contents)

---

## 3. Angular.json Assets Configuration

### The Challenge: Library Assets in User Projects

When users install your library from npm, the assets (icons, images, fonts) are in:

```
node_modules/minahil/assets/icons/calendar-icon.svg
```

But Angular's build process **only copies assets from the consuming app's `src/assets/`** folder by default.

**Problem:**

```typescript
// In your library component
@Component({
  template: `<img src="assets/icons/calendar-icon.svg" />`
})
```

When users build their app:

- ❌ `assets/icons/calendar-icon.svg` doesn't exist in their `src/assets/`
- ❌ Image doesn't load (404 error)
- ❌ Icons are missing

### The Solution: Configure User's angular.json

Users need to tell Angular's build system to **copy your library's assets** to their build output.

**File:** User's `angular.json`

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              "src/favicon.ico",
              "src/assets",
              {
                "glob": "**/*",
                "input": "node_modules/minahil/assets",
                "output": "assets"
              }
            ]
          }
        }
      }
    }
  }
}
```

### Understanding the Asset Configuration Object

```json
{
  "glob": "**/*",
  "input": "node_modules/minahil/assets",
  "output": "assets"
}
```

Let's break down each property:

#### **`glob`: Pattern Matching**

- **Purpose:** Specifies which files to copy
- **Pattern:** Uses glob syntax (like regex for file paths)

**Examples:**

```json
"glob": "**/*"           // All files and folders recursively
"glob": "*.svg"          // Only SVG files in root
"glob": "icons/**/*.svg" // SVG files in icons folder and subfolders
"glob": "*.{png,jpg}"    // Only PNG and JPG files
```

**Common glob patterns:**

- `*` - Matches any characters except `/`
- `**` - Matches any characters including `/` (recursive)
- `?` - Matches single character
- `{a,b}` - Matches `a` or `b`

#### **`input`: Source Directory**

- **Purpose:** Where to find the files (source)
- **Path:** Relative to workspace root or absolute

**Examples:**

```json
"input": "node_modules/minahil/assets"     // Library assets
"input": "node_modules/@company/lib/icons" // Specific subfolder
"input": "src/extra-assets"                // Project folder
```

**Important:** This path is relative to the **workspace root** (where `angular.json` is).

#### **`output`: Destination Directory**

- **Purpose:** Where to copy the files in the build output
- **Path:** Relative to the build output folder (`dist/my-app/`)

**Examples:**

```json
"output": "assets"           // → dist/my-app/assets/
"output": "assets/lib-icons" // → dist/my-app/assets/lib-icons/
"output": "."                // → dist/my-app/ (root)
```

### Complete Example with Multiple Libraries

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "assets": [
              // App's own assets
              "src/favicon.ico",
              "src/assets",

              // Library 1: Minahil component library
              {
                "glob": "**/*",
                "input": "node_modules/minahil/assets",
                "output": "assets"
              },

              // Library 2: Icon library (specific icons only)
              {
                "glob": "*.svg",
                "input": "node_modules/@mycompany/icons/dist",
                "output": "assets/icons"
              },

              // Library 3: Font library
              {
                "glob": "**/*.{woff,woff2,ttf}",
                "input": "node_modules/custom-fonts/fonts",
                "output": "assets/fonts"
              }
            ]
          }
        }
      }
    }
  }
}
```

### What Happens During Build

**User runs:** `ng build`

**Angular processes assets:**

1. **App's assets:**

   ```
   src/assets/logo.png → dist/my-app/assets/logo.png
   ```

2. **Library assets (minahil):**

   ```
   node_modules/minahil/assets/icons/calendar.svg
   → dist/my-app/assets/icons/calendar.svg
   ```

3. **Final build output:**
   ```
   dist/my-app/
   ├── index.html
   ├── main.js
   ├── styles.css
   └── assets/
       ├── logo.png              (from app)
       └── icons/
           └── calendar.svg      (from library)
   ```

### Why This is Necessary

**Without angular.json configuration:**

```typescript
// Your library component
template: `<img src="assets/icons/calendar.svg" />`;
```

- Browser requests: `https://myapp.com/assets/icons/calendar.svg`
- File doesn't exist in build output → ❌ 404 Error

**With angular.json configuration:**

- Library assets copied to build output
- Browser requests: `https://myapp.com/assets/icons/calendar.svg`
- File exists → ✅ Loads successfully

### Alternative: Using Full Paths

Instead of configuring angular.json, you could use full paths in your library:

```typescript
// ❌ Don't do this - requires user configuration
template: `<img src="assets/icons/calendar.svg" />`;

// ✅ Alternative - works without configuration but ugly
template: `<img src="node_modules/minahil/assets/icons/calendar.svg" />`;
```

But this approach:

- ❌ Doesn't work in production builds
- ❌ Exposes internal structure
- ❌ Not recommended

**Best practice:** Use standard `assets/` paths and document angular.json configuration.

### Multiple Asset Configurations for Same Library

You can have multiple asset configurations for the same library:

```json
{
  "assets": [
    // Copy icons only
    {
      "glob": "**/*.svg",
      "input": "node_modules/minahil/assets/icons",
      "output": "assets/icons"
    },
    // Copy fonts separately
    {
      "glob": "**/*.{woff,woff2}",
      "input": "node_modules/minahil/assets/fonts",
      "output": "assets/fonts"
    }
  ]
}
```

### Testing Assets Configuration

**In development:**

```bash
ng serve
```

- Assets are served from memory
- Check browser console for 404 errors

**In production build:**

```bash
ng build --configuration production
```

- Check `dist/my-app/assets/` folder
- Verify all library assets are present

[↑ Back to Table of Contents](#-table-of-contents)

---

## 4. Understanding Dependencies

### A. dependencies (Regular Dependencies)

**Use for:** Libraries that your code **directly imports and uses at runtime**

```json
{
  "dependencies": {
    "tslib": "^2.3.0"
  }
}
```

**Characteristics:**

- ✅ Installed automatically when users install your library
- ✅ Bundled into your library code (or available at runtime)
- ✅ Users get them automatically
- ✅ Version is controlled by your library

**When to use:**

- Small utility libraries
- Libraries users shouldn't manage themselves
- Libraries without version conflicts

**Examples:**

```json
{
  "dependencies": {
    "tslib": "^2.3.0", // TypeScript runtime helpers
    "lodash-es": "^4.17.21", // Small utility
    "nanoid": "^3.1.0" // ID generator
  }
}
```

**⚠️ Warning - DON'T put these in dependencies:**

- ❌ Angular packages (use peerDependencies)
- ❌ Large libraries users might already have (use peerDependencies)
- ❌ Framework packages (use peerDependencies)

### B. peerDependencies (Peer Dependencies)

**Use for:** Libraries that **must exist in the consuming app** but shouldn't be bundled

```json
{
  "peerDependencies": {
    "@angular/common": ">=17.0.0 <21.0.0",
    "@angular/core": ">=17.0.0 <21.0.0",
    "tailwindcss": "^3.0.0 || ^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "moment": "^2.29.0"
  }
}
```

**Characteristics:**

- ⚠️ npm warns if missing or wrong version
- ✅ npm v7+ auto-installs if missing
- ❌ npm v6 only warns, doesn't auto-install
- ✅ Prevents duplicate installations
- ✅ Uses the consuming app's version

#### Why Peer Dependencies?

**Example Problem without peer dependencies:**

```typescript
// Your library imports Angular
import { Component } from '@angular/core';

// If Angular is in dependencies:
// → Your library bundles Angular (5MB)
// → User's app also has Angular (5MB)
// → Result: 10MB total, version conflicts, broken app
```

**Solution with peer dependencies:**

```typescript
// Your library imports Angular
import { Component } from '@angular/core';

// Angular is in peerDependencies:
// → Your library uses user's Angular installation
// → User's app has one Angular version (5MB)
// → Result: 5MB total, no conflicts, works perfectly
```

#### What to Include

**✅ Always include:**

- Framework packages (Angular, React, Vue)
- Large libraries (Tailwind, Moment, date-fns)
- CSS processors (PostCSS, Autoprefixer, Sass)
- Libraries that should be singletons (one instance only)
- Libraries users commonly already have

**❌ Don't include:**

- Small utilities (< 50KB)
- Libraries specific to your implementation
- Internal dependencies

#### Real-World Example

**Your library (minahil):**

```json
{
  "name": "minahil",
  "peerDependencies": {
    // Framework - MUST be singleton
    "@angular/common": ">=17.0.0 <21.0.0",
    "@angular/core": ">=17.0.0 <21.0.0",

    // Styling - Large libraries users might have
    "tailwindcss": "^3.0.0 || ^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",

    // Utilities - Large library (2MB+)
    "moment": "^2.29.0"
  }
}
```

#### Peer Dependency Behaviors

**Scenario 1: User has compatible version**

```bash
# User has tailwindcss 3.4.14
# Your library requires tailwindcss ^3.0.0
# Result: ✅ Uses 3.4.14, no warning, no action
```

**Scenario 2: User has incompatible version**

```bash
# User has tailwindcss 2.2.19
# Your library requires tailwindcss ^3.0.0
# Result: ⚠️ Warning shown, doesn't auto-upgrade, may break
```

**Scenario 3: User doesn't have it**

```bash
# User doesn't have tailwindcss
# Your library requires tailwindcss ^3.0.0
# npm v7+: ✅ Auto-installs latest 3.x
# npm v6: ⚠️ Warning shown, must install manually
```

### C. devDependencies (Development Dependencies)

**Use for:** Tools needed only during **development/build**, not at runtime

```json
{
  "devDependencies": {
    "@angular/compiler-cli": "^20.3.0",
    "@angular/cli": "^20.3.6",
    "ng-packagr": "^20.3.0",
    "typescript": "~5.9.2",
    "jasmine-core": "~5.9.0",
    "karma": "~6.4.0"
  }
}
```

**Characteristics:**

- ✅ Installed when you develop the library
- ❌ NOT installed when users install your library
- ✅ Used for building, testing, linting
- ✅ Keeps user installations lean

**What to include:**

```json
{
  "devDependencies": {
    // Build tools
    "ng-packagr": "^20.3.0",
    "@angular/compiler-cli": "^20.3.0",

    // Testing
    "jasmine-core": "~5.9.0",
    "karma": "~6.4.0",
    "@types/jasmine": "~5.1.0",

    // Language
    "typescript": "~5.9.2",

    // Linting/Formatting
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",

    // Development CSS tools
    "tailwindcss": "^3.4.14",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.23"
  }
}
```

**Note:** Tailwind, PostCSS, Autoprefixer are in **BOTH** devDependencies (for library development) **AND** peerDependencies (required by users).

### Complete Example

```json
{
  "name": "minahil",
  "version": "0.1.7",

  "peerDependencies": {
    "@angular/common": ">=17.0.0 <21.0.0",
    "@angular/core": ">=17.0.0 <21.0.0",
    "tailwindcss": "^3.0.0 || ^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "moment": "^2.29.0"
  },

  "dependencies": {
    "tslib": "^2.3.0"
  },

  "devDependencies": {
    "@angular/build": "^20.3.6",
    "@angular/cli": "^20.3.6",
    "@angular/compiler-cli": "^20.3.0",
    "ng-packagr": "^20.3.0",
    "typescript": "~5.9.2",
    "tailwindcss": "^3.4.14",
    "postcss": "^8.5.6",
    "autoprefixer": "^10.4.23"
  }
}
```

[↑ Back to Table of Contents](#-table-of-contents)

---

## 5. Version Ranges Explained

### Semantic Versioning (Semver)

Format: `MAJOR.MINOR.PATCH` (e.g., `3.4.14`)

- **MAJOR (3):** Breaking changes, incompatible API changes
  - `3.0.0` → `4.0.0` - May break your code
- **MINOR (4):** New features, backward compatible
  - `3.4.0` → `3.5.0` - Safe, adds features
- **PATCH (14):** Bug fixes, backward compatible
  - `3.4.14` → `3.4.15` - Safe, fixes bugs

### Version Range Patterns

#### **Caret (`^`) - Compatible with**

```json
"^3.4.14"
```

**Allows:**

- ✅ `3.4.14` - Exact version
- ✅ `3.4.15` - Patch updates
- ✅ `3.5.0` - Minor updates
- ✅ `3.999.999` - Any minor/patch in v3

**Blocks:**

- ❌ `4.0.0` - Major version change (potentially breaking)

**Use when:** You want bug fixes and new features, but no breaking changes

#### **Tilde (`~`) - Approximately equivalent to**

```json
"~3.4.14"
```

**Allows:**

- ✅ `3.4.14` - Exact version
- ✅ `3.4.15` - Patch updates
- ✅ `3.4.999` - Any patch in 3.4.x

**Blocks:**

- ❌ `3.5.0` - Minor version change
- ❌ `4.0.0` - Major version change

**Use when:** You want only bug fixes, no new features

#### **Range (`>=` and `<`) - Between versions**

```json
">=17.0.0 <21.0.0"
```

**Allows:**

- ✅ `17.0.0` - Minimum version
- ✅ `17.5.0` - Any 17.x
- ✅ `18.0.0` - Any 18.x
- ✅ `19.0.0` - Any 19.x
- ✅ `20.999.999` - Any 20.x

**Blocks:**

- ❌ `16.999.999` - Below minimum
- ❌ `21.0.0` - At or above maximum

**Use when:** Supporting multiple major versions (e.g., Angular 17, 18, 19, 20)

#### **OR (`||`) - Multiple ranges**

```json
"^3.0.0 || ^4.0.0"
```

**Allows:**

- ✅ `3.0.0` → `3.999.999` - Any v3
- ✅ `4.0.0` → `4.999.999` - Any v4

**Blocks:**

- ❌ `2.x.x` - Too old
- ❌ `5.x.x` - Too new

**Use when:** Supporting multiple major versions (e.g., Tailwind v3 and v4)

#### **Exact version - No flexibility**

```json
"3.4.14"
```

**Allows:**

- ✅ `3.4.14` - Only this exact version

**Blocks:**

- ❌ Everything else

**Use when:** Rarely - only if you need exact version match (not recommended for peer deps)

### Best Practices for Peer Dependencies

#### **For Frameworks (Angular)**

```json
"@angular/core": ">=17.0.0 <21.0.0"
```

**Why:**

- Users might not upgrade Angular immediately
- Support multiple major versions
- Gives flexibility
- Reduces breaking changes

**DON'T:**

```json
"@angular/core": "^20.0.0"  // ❌ Too restrictive
```

#### **For Libraries with Multiple Major Versions (Tailwind)**

```json
"tailwindcss": "^3.0.0 || ^4.0.0"
```

**Why:**

- Tailwind v3 and v4 both widely used
- Users can choose their version
- Your library works with both

#### **For Utility Libraries (Moment)**

```json
"moment": "^2.29.0"
```

**Why:**

- Moment v2 is stable
- No v3 yet
- Accept any v2.29.x or higher

### Real-World Example

```json
{
  "peerDependencies": {
    // Framework - support multiple versions
    "@angular/common": ">=17.0.0 <21.0.0",
    "@angular/core": ">=17.0.0 <21.0.0",

    // Tailwind - support v3 and v4
    "tailwindcss": "^3.0.0 || ^4.0.0",

    // CSS tools - stable versions
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",

    // Utilities - minimum version
    "moment": "^2.29.0"
  }
}
```

### Testing Version Compatibility

```bash
# Test with minimum versions
npm install tailwindcss@3.0.0

# Test with maximum versions
npm install tailwindcss@3.999.999

# Test with different major version
npm install tailwindcss@4.0.0

# Check for warnings
npm install your-library
```

[↑ Back to Table of Contents](#-table-of-contents)

---

## 6. Tailwind Integration Deep Dive

### The Challenge

Your library uses Tailwind CSS in **two ways:**

#### **1. Utility Classes in HTML Templates**

```html
<!-- toggle.html -->
<div class="inline-flex items-center gap-2 cursor-pointer">
  <button class="relative rounded-full transition-colors duration-200">
    <span class="inline-block transform rounded-full bg-white shadow"></span>
  </button>
</div>
```

#### **2. `@apply` Directives in CSS**

```css
/* toggle.css */
.toggle-base {
  @apply relative inline-flex items-center rounded-full;
  @apply transition-colors duration-200 ease-in-out;
  @apply border-2 border-transparent;
}
```

### Why This Is Problematic

#### **Problem 1: Utility Classes Not Generated**

**How Tailwind works:**

1. Scans files for class names
2. Generates CSS only for classes it finds
3. By default, scans only: `src/**/*.{html,ts}`

**Your library location:**

- After npm install: `node_modules/minahil/`
- Not in default scan path
- Tailwind doesn't see your classes
- CSS not generated
- Components have no styles

**Example:**

```html
<!-- Your library template -->
<div class="inline-flex items-center gap-2"></div>
```

**Without configuration:**

```css
/* User's generated styles.css */
/* ❌ .inline-flex NOT GENERATED */
/* ❌ .items-center NOT GENERATED */
/* ❌ .gap-2 NOT GENERATED */
```

**Result:** Components appear unstyled

#### **Problem 2: `@apply` Directives Not Processed**

**What `@apply` is:**

- Special Tailwind directive
- NOT real CSS
- Needs PostCSS plugin to process
- Converts to actual CSS

**Your library build:**

```css
/* toggle.css (source) */
.toggle-base {
  @apply relative inline-flex items-center;
}

/* ⬇️ After ng build brickclay-lib */

/* toggle.css (in dist) */
.toggle-base {
  @apply relative inline-flex items-center; /* ❌ Still @apply! */
}
```

**The problem:**

- `@apply` stays as-is (not processed during library build)
- Distributed to users as-is
- Users' browsers don't understand `@apply`
- Styles don't work

**Browser console:**

```
Invalid CSS: Unknown directive @apply
```

### The Solution: Multi-Step Configuration

Users must configure their project to:

1. ✅ Scan your library for utility classes
2. ✅ Process your library's CSS with Tailwind
3. ✅ Import your stylesheets

#### **Step 1: Export CSS as Source Files**

**In your library's `ng-package.json`:**

```json
{
  "assets": [
    "src/styles.css",
    "src/lib/toggle/toggle.css",
    "src/lib/checkbox/checkbox.css",
    "src/lib/radio/radio.css"
  ]
}
```

**What this does:**

- Copies CSS files to `dist/minahil/`
- CSS files keep `@apply` directives (not processed yet)
- Available for users to import and process

#### **Step 2: Users Configure Tailwind Scanning**

##### **For Tailwind v3:**

**File:** User's `tailwind.config.js`

```js
module.exports = {
  content: [
    './src/**/*.{html,ts}', // Scan app files
    './node_modules/minahil/**/*.{html,ts,js,mjs,css}', // Scan library files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**What `content` does:**

- Tells Tailwind where to look for class names
- `./src/**/*.{html,ts}` - User's own files
- `./node_modules/minahil/**/*.{html,ts,js,mjs,css}` - Your library files

**Breakdown:**

- `./node_modules/minahil/` - Your library location
- `**/*` - All folders recursively
- `.{html,ts,js,mjs,css}` - File types to scan
  - `.html` - Template files
  - `.ts` - TypeScript (may contain template strings)
  - `.js` - JavaScript files
  - `.mjs` - ES modules
  - `.css` - CSS files (for `@apply` processing)

**Result:**

- ✅ Tailwind scans your library
- ✅ Finds `inline-flex`, `gap-2`, etc.
- ✅ Generates CSS for those classes

also add this in styles.css:

```css
@import "../node_modules/minahil/src/styles.css";  // this

@tailwind base;
@tailwind components;
@tailwind utilities;

```

##### **For Tailwind v4:**

**File:** User's `src/styles.css`

```css
@import 'tailwindcss';
@source "../node_modules/minahil";
```

**What `@source` does:**

- Tailwind v4's way of specifying scan paths
- Equivalent to v3's `content` array
- Simpler, CSS-based configuration

#### **Step 3: Users Import Library Styles**

##### **For Tailwind v3:**

**File:** User's `src/styles.css`

```css
/* Import library styles FIRST */
@import 'minahil/styles.css';

/* Then import Tailwind */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Order matters:**

1. `@import 'minahil/styles.css'` - Loads your CSS with `@apply`
2. `@tailwind components` - Processes `@apply` directives
3. `@tailwind utilities` - Generates utility classes

##### **For Tailwind v4:**

**File:** User's `src/styles.css`

```css
@import 'tailwindcss';
@source "../node_modules/minahil";
@import 'minahil/styles.css';
```

### Complete Flow Visualization

#### **Without Configuration:**

```
Your Library Template:
<div class="inline-flex gap-2">
         ↓
User's Tailwind (doesn't scan library):
❌ inline-flex - NOT GENERATED
❌ gap-2 - NOT GENERATED
         ↓
Browser:
<div class="inline-flex gap-2">  <!-- No styles! -->
```

```
Your Library CSS:
.toggle-base {
  @apply relative inline-flex;
}
         ↓
User's build (doesn't process):
❌ @apply stays as-is
         ↓
Browser:
❌ Invalid CSS: @apply not understood
```

#### **With Configuration:**

```
Your Library Template:
<div class="inline-flex gap-2">
         ↓
User's Tailwind (scans node_modules/minahil):
✅ Finds "inline-flex"
✅ Finds "gap-2"
✅ Generates CSS for both
         ↓
User's stylesheet:
.inline-flex { display: inline-flex; }
.gap-2 { gap: 0.5rem; }
         ↓
Browser:
<div class="inline-flex gap-2">  <!-- Styled! -->
```

```
Your Library CSS:
.toggle-base {
  @apply relative inline-flex;
}
         ↓
User imports in styles.css:
@import 'minahil/styles.css';
         ↓
Tailwind processes during user's build:
.toggle-base {
  position: relative;
  display: inline-flex;
}
         ↓
Browser:
✅ Real CSS, works perfectly!
```

### Why Can't You Pre-process in the Library?

**Question:** Why not convert `@apply` during library build?

**Answer:** You could, but then:

❌ **Problem 1: Utility classes still won't work**

```html
<div class="inline-flex gap-2">
  <!-- These classes still need user's Tailwind to generate -->
</div>
```

❌ **Problem 2: Larger bundle**

```css
/* Instead of: */
@apply inline-flex items-center gap-2; /* 3 utilities */

/* You'd bundle: */
display: inline-flex;
align-items: center;
gap: 0.5rem;
/* Multiply this across all components = larger CSS */
```

❌ **Problem 3: No Tailwind benefits**

- Can't use user's Tailwind config
- Can't customize with user's theme
- Can't use user's custom utilities

✅ **Keeping `@apply`:**

- User's Tailwind processes everything
- Uses user's config/theme
- Smaller, more flexible

### Alternative: Pure CSS (No Tailwind Required)

If you don't want users to configure Tailwind:

**Option 1:** Convert `@apply` to plain CSS

```css
.toggle-base {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
}
```

**Option 2:** Remove utility classes from templates

```html
<!-- Instead of: -->
<div class="inline-flex items-center gap-2">
  <!-- Use: -->
  <div class="toggle-wrapper">
    /* CSS: */ .toggle-wrapper { display: inline-flex; align-items: center; gap: 0.5rem; }
  </div>
</div>
```

**Trade-offs:**

- ✅ Works without Tailwind
- ✅ No user configuration needed
- ❌ Larger CSS bundle
- ❌ Less flexible
- ❌ More CSS to maintain

### Best Practice: Document Requirements Clearly

**In your README:**

````markdown
## Requirements

This library requires Tailwind CSS to be installed and configured.

### For Tailwind v3:

1. **Install dependencies:**
   ```bash
   npm install tailwindcss postcss autoprefixer
   ```
````

2. **Configure `tailwind.config.js`:**

   ```js
   module.exports = {
     content: ['./src/**/*.{html,ts}', './node_modules/minahil/**/*.{html,ts,js,mjs,css}'],
   };
   ```

3. **Import styles in `src/styles.css`:**

   ```css
   @import 'minahil/styles.css';

   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### For Tailwind v4:

**In `src/styles.css`:**

```css
@import 'tailwindcss';
@source "../node_modules/minahil";
@import 'minahil/styles.css';
```

````

[↑ Back to Table of Contents](#-table-of-contents)

---

## 7. Package.json Exports Field

### The Problem

When users try to import your library's CSS:

```css
@import 'minahil/styles.css';
````

Node.js needs to know:

- ❓ Where is `minahil` package located? → `node_modules/minahil/`
- ❓ What does `styles.css` refer to? → `???`

**Without exports field:**

```
Error: Cannot find module 'minahil/styles.css'
```

**Workaround (ugly):**

```css
@import '../node_modules/minahil/styles.css'; /* ❌ Hardcoded path */
```

### The Solution: Exports Field

Tell Node.js how to resolve subpaths in your package.

**File:** `dist/brickclay-lib/package.json` (after build)

```json
{
  "name": "minahil",
  "version": "0.1.7",
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "esm2022": "./esm2022/minahil.mjs",
      "esm": "./esm2022/minahil.mjs",
      "default": "./fesm2022/minahil.mjs"
    },
    "./styles.css": "./styles.css",
    "./package.json": "./package.json"
  }
}
```

### Understanding Each Export

#### **1. Main Export (`"."`):**

```json
".": {
  "types": "./index.d.ts",
  "esm2022": "./esm2022/minahil.mjs",
  "esm": "./esm2022/minahil.mjs",
  "default": "./fesm2022/minahil.mjs"
}
```

**What it does:**

```typescript
import { ToggleComponent } from 'minahil';
//       ↓
// Resolves to: node_modules/minahil/fesm2022/minahil.mjs
```

**Conditions explained:**

- `types` - TypeScript type definitions (`.d.ts` files)
- `esm2022` - ES2022 modules (modern JavaScript)
- `esm` - Generic ES modules fallback
- `default` - Default export for everything else

**Build tools choose based on support:**

- TypeScript → Uses `types`
- Modern bundlers → Use `esm2022` or `esm`
- Older tools → Use `default`

#### **2. Stylesheet Export:**

```json
"./styles.css": "./styles.css"
```

**What it does:**

```css
@import 'minahil/styles.css';
/*       ↓
   Resolves to: node_modules/minahil/styles.css
*/
```

**Why needed:**

- CSS imports need explicit mapping
- Prevents "file not found" errors
- Provides clean import paths

#### **3. Package.json Export:**

```json
"./package.json": "./package.json"
```

**What it does:**

```javascript
const pkg = require('minahil/package.json');
//       ↓
// Resolves to: node_modules/minahil/package.json
```

**Why needed:**

- Some tools read package.json metadata
- Version checking
- Dependency inspection

### Multiple Exports Example

**If you have multiple CSS files:**

```json
{
  "exports": {
    ".": {
      "default": "./fesm2022/minahil.mjs"
    },
    "./styles.css": "./styles.css",
    "./toggle.css": "./toggle/toggle.css",
    "./checkbox.css": "./checkbox/checkbox.css",
    "./radio.css": "./radio/radio.css",
    "./assets/*": "./assets/*"
  }
}
```

**Users can import:**

```css
@import 'minahil/styles.css'; /* Main styles */
@import 'minahil/toggle.css'; /* Toggle only */
@import 'minahil/checkbox.css'; /* Checkbox only */
```

```html
<img src="node_modules/minahil/assets/icons/calendar.svg" />
```

### Wildcard Exports

```json
{
  "exports": {
    "./assets/*": "./assets/*"
  }
}
```

**Allows:**

```javascript
import icon from 'minahil/assets/icons/calendar.svg';
```

**Resolves to:**

```
node_modules/minahil/assets/icons/calendar.svg
```

### How to Add Exports Field

#### **Option 1: Manual (After Each Build)**

```bash
# Build library
ng build brickclay-lib

# Manually edit dist/brickclay-lib/package.json
# Add exports field

# Publish
cd dist/brickclay-lib
npm publish
```

#### **Option 2: Automated (Post-Build Script)**

**Create:** `scripts/post-build.js`

```javascript
const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '../dist/brickclay-lib/package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add exports field
packageJson.exports = {
  '.': {
    types: './index.d.ts',
    esm2022: './esm2022/minahil.mjs',
    esm: './esm2022/minahil.mjs',
    default: './fesm2022/minahil.mjs',
  },
  './styles.css': './styles.css',
  './package.json': './package.json',
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with exports field');
```

**Update:** `package.json` scripts

```json
{
  "scripts": {
    "build:lib": "ng build brickclay-lib && node scripts/post-build.js"
  }
}
```

**Usage:**

```bash
npm run build:lib
```

### Testing Exports

**Test locally before publishing:**

```bash
# Build library
npm run build:lib

# Pack to tarball
cd dist/brickclay-lib
npm pack

# This creates minahil-0.1.7.tgz

# Install in test project
cd /path/to/test-project
npm install /path/to/minahil-0.1.7.tgz

# Test imports
# src/styles.css
@import 'minahil/styles.css';  # Should work
```

### Common Export Patterns

#### **Pattern 1: Subpath exports**

```json
{
  "exports": {
    "./components/*": "./lib/*/index.js"
  }
}
```

```typescript
import { Toggle } from 'minahil/components/toggle';
```

#### **Pattern 2: Conditional exports**

```json
{
  "exports": {
    ".": {
      "import": "./esm/index.js",
      "require": "./cjs/index.js"
    }
  }
}
```

```typescript
// ESM
import { Toggle } from 'minahil';

// CommonJS
const { Toggle } = require('minahil');
```

#### **Pattern 3: Development vs Production**

```json
{
  "exports": {
    ".": {
      "development": "./dev/index.js",
      "production": "./prod/index.js",
      "default": "./index.js"
    }
  }
}
```

[↑ Back to Table of Contents](#-table-of-contents)

---

## 8. ViewEncapsulation Explained

View Encapsulation controls how component styles are scoped and applied.

### Three Types of ViewEncapsulation

### A. ViewEncapsulation.Emulated (Default)

```typescript
@Component({
  selector: 'lib-toggle',
  templateUrl: './toggle.html',
  styleUrls: ['./toggle.css'],
  encapsulation: ViewEncapsulation.Emulated  // Default
})
```

**What Angular does:**

**Your code:**

```html
<div class="toggle-base">
  <span class="toggle-knob"></span>
</div>
```

**Angular transforms to:**

```html
<div class="toggle-base" _ngcontent-abc-123>
  <span class="toggle-knob" _ngcontent-abc-123></span>
</div>
```

**Your CSS:**

```css
.toggle-base {
  background: black;
}
```

**Angular transforms to:**

```css
.toggle-base[_ngcontent-abc-123] {
  background: black;
}
```

**Result:**

- ✅ Styles scoped to component only
- ✅ No style leakage to other components
- ✅ Can't accidentally override global styles
- ❌ Can't style from outside the component
- ❌ Tailwind utility classes don't work properly
- ❌ Parent components can't style child components

**Example problem with Tailwind:**

```html
<div class="flex gap-2"><!-- In template --></div>
```

```css
/* Generated by Tailwind */
.flex { display: flex; }

/* Angular makes it */
.flex[_ngcontent-xyz-789] { display: flex; }

/* But your HTML doesn't have that attribute */
<div class="flex" _ngcontent-abc-123>  <!-- Different attribute! -->
/* ❌ Style doesn't match, doesn't apply */
```

**When to use:**

- ✅ Regular Angular components
- ✅ Not using Tailwind utilities in templates
- ✅ Want strong style isolation
- ❌ NOT for Tailwind-based libraries

### B. ViewEncapsulation.None

```typescript
@Component({
  selector: 'lib-toggle',
  templateUrl: './toggle.html',
  styleUrls: ['./toggle.css'],
  encapsulation: ViewEncapsulation.None
})
```

**What Angular does:**

**Your code:**

```html
<div class="toggle-base">
  <span class="toggle-knob"></span>
</div>
```

**Angular output:**

```html
<div class="toggle-base">
  <span class="toggle-knob"></span>
</div>
```

_No transformation!_

**Your CSS:**

```css
.toggle-base {
  background: black;
}
```

**Angular output:**

```css
.toggle-base {
  background: black;
}
```

_No transformation!_

**Result:**

- ✅ Styles apply globally
- ✅ Tailwind utility classes work perfectly
- ✅ Can style from outside
- ✅ Parent/child components can share styles
- ⚠️ Potential style conflicts (mitigate with unique class names)
- ⚠️ Styles leak to entire app

**Example with Tailwind:**

```html
<div class="flex gap-2"><!-- In template --></div>
```

```css
/* Tailwind generates */
.flex { display: flex; }
.gap-2 { gap: 0.5rem; }

/* Angular outputs as-is (no transformation) */
.flex { display: flex; }
.gap-2 { gap: 0.5rem; }

/* HTML also unchanged */
<div class="flex gap-2">

/* ✅ Perfect match, styles apply! */
```

**When to use:**

- ✅ Component libraries with Tailwind
- ✅ Using utility classes in templates
- ✅ Need global styles
- ✅ Using unique class names (`.toggle-base`, `.calendar-container`)

**How to prevent conflicts:**

**Use unique, descriptive class names:**

```css
/* ❌ Too generic */
.button { ... }
.container { ... }
.header { ... }

/* ✅ Unique, namespaced */
.toggle-base { ... }
.toggle-knob { ... }
.calendar-container { ... }
.calendar-popup { ... }
```

**Use BEM methodology:**

```css
.toggle__base { ... }
.toggle__knob { ... }
.toggle__knob--active { ... }
```

**Add library prefix:**

```css
.lib-toggle-base { ... }
.lib-toggle-knob { ... }
```

### C. ViewEncapsulation.ShadowDom

```typescript
@Component({
  selector: 'lib-toggle',
  templateUrl: './toggle.html',
  styleUrls: ['./toggle.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
```

**What it does:**

Uses browser's native Shadow DOM:

```html
<lib-toggle>
  #shadow-root (open)
  <div class="toggle-base">
    <span class="toggle-knob"></span>
  </div>
</lib-toggle>
```

**Result:**

- ✅ True style isolation (browser-level)
- ✅ No style leakage
- ✅ Future-proof
- ❌ Can't style from outside (even with ::ng-deep)
- ❌ Global styles don't affect component
- ❌ Tailwind utilities don't work
- ❌ More complex to debug
- ❌ Not widely used in Angular libraries

**When to use:**

- ✅ Web components
- ✅ Maximum isolation needed
- ❌ NOT for Tailwind-based libraries
- ❌ NOT for most Angular libraries

### Comparison Table

| Feature                | Emulated | None        | ShadowDom   |
| ---------------------- | -------- | ----------- | ----------- |
| Style isolation        | ✅ Good  | ❌ No       | ✅ Perfect  |
| Tailwind utilities     | ❌ No    | ✅ Yes      | ❌ No       |
| Global styles work     | ✅ Yes   | ✅ Yes      | ❌ No       |
| Can style from outside | Limited  | ✅ Yes      | ❌ No       |
| Performance            | ✅ Good  | ✅ Best     | ⚠️ Overhead |
| Debugging              | ✅ Easy  | ✅ Easy     | ⚠️ Complex  |
| Library usage          | Common   | Very Common | Rare        |

### Why Your Library Uses None

**Your components:**

```typescript
@Component({
  selector: 'brickclay-toggle',
  templateUrl: './toggle.html',
  styleUrls: ['./toggle.css'],
  encapsulation: ViewEncapsulation.None  // ✅ Correct choice
})
```

**Reasons:**

1. **Templates use Tailwind utilities:**

```html
<div class="inline-flex items-center gap-2"></div>
```

These MUST be global to work.

2. **CSS uses `@apply`:**

```css
.toggle-base {
  @apply relative inline-flex items-center;
}
```

Needs to be processed globally.

3. **Component styles are unique:**

```css
.toggle-base { ... }
.toggle-knob { ... }
```

No risk of conflicts.

4. **Standard practice:**

- Tailwind UI components use `None`
- Flowbite uses `None`
- DaisyUI uses `None`
- Headless UI uses `None`

### Migration Example

**If you change from None to Emulated:**

**Before (None):**

```html
<div class="flex gap-2"><!-- ✅ Works --></div>
```

**After (Emulated):**

```html
<div class="flex gap-2"><!-- ❌ Broken --></div>
```

**Fix:** Convert to CSS classes

```html
<div class="toggle-wrapper">/* CSS */ .toggle-wrapper { display: flex; gap: 0.5rem; }</div>
```

But this defeats the purpose of Tailwind!

[↑ Back to Table of Contents](#-table-of-contents)

---

## 9. Best Practices for Library Maintenance

### A. Versioning Strategy

Follow **Semantic Versioning (Semver)** strictly.

#### **Patch Version (0.1.7 → 0.1.8)**

**When:**

- Bug fixes
- Performance improvements
- Documentation updates
- Internal refactoring

**Examples:**

```bash
# Fix toggle not updating on value change
npm version patch

# Improve calendar rendering performance
npm version patch

# Fix TypeScript type definitions
npm version patch
```

**What users expect:**

- ✅ Safe to update immediately
- ✅ No code changes required
- ✅ No breaking changes

#### **Minor Version (0.1.8 → 0.2.0)**

**When:**

- New features
- New components
- New inputs/outputs (backward compatible)
- Deprecations (with warnings)

**Examples:**

```bash
# Add new DateRangePicker component
npm version minor

# Add @Output() onChange to Toggle
npm version minor

# Add new size variant to Checkbox
npm version minor
```

**What users expect:**

- ✅ Safe to update
- ✅ No breaking changes
- ✅ Optional new features
- ⚠️ May need to update for new features

#### **Major Version (0.2.0 → 1.0.0)**

**When:**

- Breaking changes
- Remove deprecated features
- Change public API
- Require different peer dependencies
- Rename components/inputs/outputs

**Examples:**

```bash
# Remove deprecated API
npm version major

# Rename @Input() value → checked
npm version major

# Upgrade Angular 17 → 18 requirement
npm version major

# Change component selector names
npm version major
```

**What users expect:**

- ⚠️ May break existing code
- ⚠️ Migration guide needed
- ⚠️ Code changes required

#### **Breaking Changes Examples**

**✅ NOT breaking (Minor/Patch):**

```typescript
// Adding optional input
@Input() size?: string;

// Adding new output
@Output() changed = new EventEmitter();

// Adding new method
public focus() { ... }

// Adding new component
export class DatePickerComponent { }
```

**❌ BREAKING (Major):**

```typescript
// Removing input
@Input() value;  // Removed!

// Renaming input
@Input() checked;  // Was: value

// Changing input type
@Input() size: 'sm' | 'md';  // Was: string

// Removing method
public getValue() { }  // Removed!

// Renaming component
// Was: ToggleComponent
// Now: SwitchComponent
```

### B. Documentation

#### **Essential README Sections**

````markdown
# Library Name

Brief description

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

```bash
npm install minahil moment
```
````

## Requirements

- Angular 17+
- Tailwind CSS v3 or v4
- Moment.js

## Setup

### Tailwind v3 Setup

(detailed instructions)

### Tailwind v4 Setup

(detailed instructions)

## Usage

### Toggle Component

(code examples)

### Checkbox Component

(code examples)

### Calendar Component

(code examples)

## API Reference

### Toggle Component

(inputs, outputs, methods)

## Styling

How to customize

## Browser Support

Supported browsers

## Contributing

How to contribute

## Changelog

Link to CHANGELOG.md

## License

MIT

````

#### **CHANGELOG.md**

**Format:** Keep-a-Changelog format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-01-26

### Added
- New DateRangePicker component
- Toggle component now supports custom colors
- Added TypeScript strict mode

### Changed
- Improved calendar performance by 40%
- Updated Tailwind peer dependency to support v4

### Deprecated
- `getValue()` method (use `value` property instead)

### Fixed
- Toggle animation not working in Safari
- Calendar not respecting timezone

## [0.1.8] - 2026-01-20

### Fixed
- Checkbox not emitting change event
- Type definitions for Calendar component

## [0.1.7] - 2026-01-15

### Added
- Initial release
- Toggle, Checkbox, Radio, Calendar components
````

### C. Testing Strategy

#### **1. Unit Tests**

```typescript
describe('ToggleComponent', () => {
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle on click', () => {
    component.toggle();
    expect(component.isChecked).toBe(true);
  });

  it('should emit change event', () => {
    let emitted = false;
    component.change.subscribe(() => (emitted = true));
    component.toggle();
    expect(emitted).toBe(true);
  });
});
```

#### **2. Integration Tests**

Test in real projects:

**Test Matrix:**

| Angular | Tailwind | Node | Status |
| ------- | -------- | ---- | ------ |
| 17      | v3       | 18   | ✅     |
| 18      | v3       | 18   | ✅     |
| 19      | v3       | 20   | ✅     |
| 20      | v4       | 20   | ✅     |

#### **3. Visual Regression Testing**

Take screenshots of components in different states:

- Default
- Hovered
- Focused
- Disabled
- Error

Compare against baseline images.

#### **4. Accessibility Testing**

```typescript
it('should have proper ARIA attributes', () => {
  const toggle = fixture.nativeElement.querySelector('button');
  expect(toggle.getAttribute('role')).toBe('switch');
  expect(toggle.getAttribute('aria-checked')).toBe('false');
});

it('should be keyboard accessible', () => {
  const toggle = fixture.nativeElement.querySelector('button');
  toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  expect(component.isChecked).toBe(true);
});
```

### D. Build & Publish Workflow

#### **Complete Workflow**

```bash
# 1. Make changes
git checkout -b feature/new-component

# 2. Test locally
npm test
npm run lint

# 3. Build library
npm run build:lib

# 4. Test locally with pack
cd dist/brickclay-lib
npm pack
# Creates minahil-0.1.7.tgz

# 5. Test in another project
cd /path/to/test-project
npm install /path/to/minahil-0.1.7.tgz
# Test thoroughly

# 6. Update version
npm version patch  # or minor, or major

# 7. Update CHANGELOG.md
# Document all changes

# 8. Commit changes
git add .
git commit -m "chore: release v0.1.8"

# 9. Create git tag
git tag v0.1.8
git push origin main --tags

# 10. Build final version
npm run build:lib

# 11. Publish to npm
cd dist/brickclay-lib
npm publish

# 12. Verify on npm
npm info minahil
```

#### **Automated Release Script**

**Create:** `scripts/release.sh`

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Get version type (patch, minor, major)
VERSION_TYPE=$1

if [ -z "$VERSION_TYPE" ]; then
  echo "${RED}Error: Version type required (patch, minor, major)${NC}"
  exit 1
fi

echo "${GREEN}Starting release process...${NC}"

# Run tests
echo "Running tests..."
npm test || exit 1

# Build library
echo "Building library..."
npm run build:lib || exit 1

# Update version
echo "Updating version..."
npm version $VERSION_TYPE || exit 1

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")

# Commit and tag
git add .
git commit -m "chore: release v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin main --tags

# Publish
echo "Publishing to npm..."
cd dist/brickclay-lib
npm publish || exit 1

echo "${GREEN}✅ Successfully published v$NEW_VERSION${NC}"
```

**Usage:**

```bash
chmod +x scripts/release.sh
./scripts/release.sh patch   # For patch release
./scripts/release.sh minor   # For minor release
./scripts/release.sh major   # For major release
```

### E. What to Include Where

#### **Summary Table**

| Package Type         | Include            | Example                |
| -------------------- | ------------------ | ---------------------- |
| **peerDependencies** | Framework packages | Angular, React         |
|                      | Large libraries    | Tailwind, Moment       |
|                      | CSS processors     | PostCSS, Autoprefixer  |
|                      | Singletons         | RxJS (for Angular)     |
| **dependencies**     | Small utilities    | tslib, nanoid          |
|                      | Internal only      | Custom helpers         |
| **devDependencies**  | Build tools        | ng-packagr, TypeScript |
|                      | Testing            | Jasmine, Karma         |
|                      | Linting            | ESLint, Prettier       |

#### **Decision Flow Chart**

```
Is it used at runtime?
├─ No → devDependencies
└─ Yes
   └─ Is it a framework or large library?
      ├─ Yes → peerDependencies
      └─ No
         └─ Is it small (<50KB) and rarely installed elsewhere?
            ├─ Yes → dependencies
            └─ No → peerDependencies
```

### F. Continuous Integration

#### **GitHub Actions Example**

**Create:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18, 20]
        angular-version: [17, 18, 19, 20]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build library
        run: npm run build:lib

      - name: Check bundle size
        run: npm run size-check
```

### G. Security Best Practices

#### **1. Keep Dependencies Updated**

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

#### **2. Use .npmignore**

**Create:** `.npmignore` in library root

```
# Source files
src/
*.spec.ts
*.spec.js

# Development files
tsconfig.spec.json
karma.conf.js
.editorconfig
.gitignore

# CI files
.github/
.travis.yml

# Documentation
docs/
examples/
```

Only publish what's needed!

#### **3. Verify Package Contents**

```bash
# Before publishing
cd dist/brickclay-lib
npm pack --dry-run

# Shows what will be included
# Verify no sensitive files are included
```

[↑ Back to Table of Contents](#-table-of-contents)

---

## 10. Common Pitfalls to Avoid

### ❌ Don't Do These

#### **1. Bundle Angular in Dependencies**

```json
// ❌ WRONG
{
  "dependencies": {
    "@angular/core": "^20.0.0"
  }
}

// ✅ CORRECT
{
  "peerDependencies": {
    "@angular/core": ">=17.0.0 <21.0.0"
  }
}
```

**Why:** Causes duplicate Angular installations, version conflicts, broken apps.

#### **2. Use Hardcoded Paths in Documentation**

```css
/* ❌ WRONG */
@import '../node_modules/minahil/styles.css';
```

```css
/* ✅ CORRECT */
@import 'minahil/styles.css';
```

**Why:** Breaks if folder structure changes, not portable.

#### **3. Forget to Update Exports**

```json
// ❌ Missing exports
{
  "name": "minahil"
}

// ✅ Has exports
{
  "name": "minahil",
  "exports": {
    ".": "./fesm2022/minahil.mjs",
    "./styles.css": "./styles.css"
  }
}
```

**Why:** Users can't import stylesheets.

#### **4. Breaking Changes Without Major Version**

```typescript
// Version 0.1.7
@Input() value: boolean;

// Version 0.1.8 ❌ WRONG - This is breaking!
@Input() checked: boolean;  // Renamed!

// Version 1.0.0 ✅ CORRECT - Major version for breaking change
@Input() checked: boolean;
```

**Why:** Breaks user code without warning.

#### **5. Not Testing in Consuming Apps**

```bash
# ❌ WRONG - Only test in library workspace
npm test

# ✅ CORRECT - Also test in real app
npm pack
cd /test-app
npm install ../library/dist/minahil-0.1.7.tgz
# Test thoroughly
```

**Why:** Build succeeds but doesn't work when installed.

#### **6. Overly Restrictive Peer Dependencies**

```json
// ❌ TOO RESTRICTIVE
{
  "peerDependencies": {
    "@angular/core": "^20.0.0"  // Only Angular 20.x
  }
}

// ✅ FLEXIBLE
{
  "peerDependencies": {
    "@angular/core": ">=17.0.0 <21.0.0"  // Angular 17-20
  }
}
```

**Why:** Forces users to be on exact version, limits adoption.

#### **7. Forgetting Assets in ng-package.json**

```json
// ❌ MISSING ASSETS
{
  "lib": {
    "entryFile": "src/public-api.ts"
  }
}

// ✅ INCLUDES ASSETS
{
  "lib": {
    "entryFile": "src/public-api.ts"
  },
  "assets": [
    "src/assets/**/*",
    "src/styles.css"
  ]
}
```

**Why:** CSS, icons missing after build.

#### **8. No CHANGELOG**

**Why:** Users don't know what changed, hesitant to upgrade.

#### **9. Ignoring Bundle Size**

```bash
# Check bundle size
npm run build:lib
ls -lh dist/brickclay-lib/fesm2022/

# If > 500KB, investigate
# Remove unused dependencies
# Use tree-shaking
```

**Why:** Large bundles slow down user apps.

#### **10. Not Documenting Breaking Changes**

**In CHANGELOG.md:**

````markdown
## [1.0.0] - 2026-01-26

### BREAKING CHANGES

- Renamed `@Input() value` to `@Input() checked`

  **Migration:**

  ```html
  <!-- Before -->
  <brickclay-toggle [value]="true">
    <!-- After -->
    <brickclay-toggle [checked]="true"></brickclay-toggle
  ></brickclay-toggle>
  ```
````

- Removed `getValue()` method

  **Migration:**

  ```typescript
  // Before
  const value = toggle.getValue();

  // After
  const value = toggle.checked;
  ```

````

### ✅ Do These Instead

1. ✅ Use semantic versioning
2. ✅ Document peer dependencies clearly
3. ✅ Provide setup examples for different scenarios
4. ✅ Test in multiple Angular/Tailwind versions
5. ✅ Maintain CHANGELOG.md
6. ✅ Use reasonable version ranges
7. ✅ Include migration guides for breaking changes
8. ✅ Check bundle size regularly
9. ✅ Use automated testing
10. ✅ Keep dependencies updated

[↑ Back to Table of Contents](#-table-of-contents)

---

## 11. Library Checklist

### Before Each Release

**Code Quality:**
- [ ] All tests passing
- [ ] No ESLint errors
- [ ] Code formatted (Prettier)
- [ ] TypeScript strict mode enabled
- [ ] No console.logs left in code

**Build:**
- [ ] Library builds successfully: `npm run build:lib`
- [ ] Check dist folder contents
- [ ] Verify all assets copied
- [ ] Bundle size reasonable (< 500KB)

**Package.json:**
- [ ] Version number updated
- [ ] Peer dependencies correct
- [ ] Exports field added (if using post-build script)
- [ ] All required fields present (name, version, author, license)

**Documentation:**
- [ ] README.md updated
- [ ] CHANGELOG.md updated with changes
- [ ] API documentation complete
- [ ] Examples updated
- [ ] Migration guide (if breaking changes)

**Testing:**
- [ ] Unit tests pass
- [ ] Pack and test locally: `npm pack`
- [ ] Test in Angular 17 project
- [ ] Test in Angular 18+ project
- [ ] Test with Tailwind v3
- [ ] Test with Tailwind v4
- [ ] Test SSR (if applicable)
- [ ] Accessibility testing done

**Git:**
- [ ] All changes committed
- [ ] Commit message follows convention
- [ ] Create git tag: `git tag v0.1.8`
- [ ] Push with tags: `git push --tags`

**Publish:**
- [ ] Logged into npm: `npm login`
- [ ] Publish: `npm publish`
- [ ] Verify on npm: `npm info minahil`
- [ ] Test installation: `npm install minahil`

**Post-Release:**
- [ ] Create GitHub release
- [ ] Announce on social media (optional)
- [ ] Update documentation site (if any)
- [ ] Monitor npm downloads
- [ ] Watch for issues

### Quick Reference Commands

```bash
# Development
npm start                    # Start dev server
npm test                     # Run tests
npm run lint                 # Lint code

# Build
npm run build:lib           # Build library
cd dist/brickclay-lib && npm pack  # Create tarball

# Version
npm version patch           # Bug fixes
npm version minor           # New features
npm version major           # Breaking changes

# Test locally
npm install /path/to/minahil-0.1.7.tgz

# Publish
cd dist/brickclay-lib
npm publish

# Verify
npm info minahil
npm install minahil

# Git
git tag v0.1.8
git push origin main --tags
````

[↑ Back to Table of Contents](#-table-of-contents)

---

## Summary

Building and maintaining an Angular library with Tailwind requires:

### Core Requirements

1. **Assets Configuration**
   - ng-package.json: Export CSS/assets
   - User's angular.json: Copy library assets to build

2. **Dependencies**
   - peerDependencies: Angular, Tailwind, PostCSS, Autoprefixer, Moment
   - dependencies: Only tslib
   - devDependencies: Build/test tools

3. **Exports Field**
   - Enable clean imports: `minahil/styles.css`
   - Manual or automated via post-build script

4. **Tailwind Integration**
   - Users scan library in Tailwind config
   - Users import library CSS
   - Users' Tailwind processes `@apply` directives

5. **ViewEncapsulation.None**
   - Required for Tailwind utilities
   - Use unique class names to prevent conflicts

6. **Semantic Versioning**
   - patch: Bug fixes
   - minor: New features
   - major: Breaking changes

7. **Documentation**
   - Clear setup instructions
   - Tailwind v3 and v4 examples
   - API reference
   - Changelog

8. **Testing**
   - Multiple Angular versions
   - Multiple Tailwind versions
   - Real-world projects
   - Accessibility

### This is Standard Practice

Libraries like Flowbite, DaisyUI, Headless UI all follow similar patterns. The key is clear documentation and thorough testing.

[↑ Back to Table of Contents](#-table-of-contents)

---

## Additional Resources

- [Angular Library Guide](https://angular.io/guide/libraries)
- [ng-packagr Documentation](https://github.com/ng-packagr/ng-packagr)
- [Semantic Versioning](https://semver.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [npm Package.json Guide](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
- [Keep a Changelog](https://keepachangelog.com/)

---

**License:** MIT

**Author:** Brickclay Team

**Repository:** https://github.com/yourusername/brickclay-lib
