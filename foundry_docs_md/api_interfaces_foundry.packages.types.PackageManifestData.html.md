# PackageManifestData

The data structure of a package manifest. This data structure is extended by `BasePackage` subclasses to add additional type-specific fields.

```typescript
interface PackageManifestData {
    authors?: PackageAuthorData[];
    bugs?: string;
    changelog?: string;
    compatibility?: PackageCompatibilityData;
    description?: string;
    download?: string;
    esmodules?: string[];
    id: string;
    languages?: PackageLanguageData[];
    license?: string;
    manifest?: string;
    packs?: PackageCompendiumData[];
    protected?: boolean;
    readme?: string;
    relationships?: PackageRelationshipsData;
    scripts?: string[];
    socket?: boolean;
    styles?: string[];
    title: string;
    url?: string;
    version: string;
}
```

## Properties

### Optional

- **authors?**: `PackageAuthorData[]`  
  An array of author objects who are co-authors of this package. Preferred to the singular author field.

- **bugs?**: `string`  
  A web URL where bug reports may be submitted and tracked.

- **changelog?**: `string`  
  A web URL where notes detailing package updates are available.

- **compatibility?**: [`PackageCompatibilityData`](https://foundryvtt.com/api/interfaces/foundry.packages.types.PackageCompatibilityData.html)  
  The compatibility of this version with the core Foundry software.

- **description?**: `string`  
  An optional package description, may contain HTML.

- **download?**: `string`  
  A publicly accessible web URL where the source files for this package may be downloaded. Required in order to support module installation.

- **esmodules?**: `string[]`  
  An array of URLs or relative file paths for ESModule files which should be included.

- **languages?**: [`PackageLanguageData`](https://foundryvtt.com/api/interfaces/foundry.packages.types.PackageLanguageData.html)[]  
  An array of language data objects which are included by this package.

- **license?**: `string`  
  A web URL or relative file path where license details may be found.

- **manifest?**: `string`  
  A publicly accessible web URL which provides the latest available package manifest file. Required in order to support module updates.

- **packs?**: [`PackageCompendiumData`](https://foundryvtt.com/api/interfaces/foundry.packages.types.PackageCompendiumData.html)[]  
  An array of compendium packs which are included by this package.

- **protected?**: `boolean`  
  Whether this package uses the protected content access system.

- **readme?**: `string`  
  A web URL or relative file path where readme instructions may be found.

- **relationships?**: [`PackageRelationshipsData`](https://foundryvtt.com/api/interfaces/foundry.packages.types.PackageRelationshipsData.html)  
  An organized object of relationships to other Packages.

- **scripts?**: `string[]`  
  An array of URLs or relative file paths for JavaScript files which should be included.

- **socket?**: `boolean`  
  Whether to require a package-specific socket namespace for this package.

- **styles?**: `string[]`  
  An array of URLs or relative file paths for CSS stylesheet files which should be included.

- **url?**: `string`  
  A web URL where more details about the package may be found.

### Required

- **id**: `string`  
  The machine-readable unique package id, should be lower-case with no spaces or special characters.

- **title**: `string`  
  The human-readable package title, containing spaces and special characters.

- **version**: `string`  
  The current package version.