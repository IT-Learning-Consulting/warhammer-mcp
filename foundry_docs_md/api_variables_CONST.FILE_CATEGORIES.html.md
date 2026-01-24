# FILE_CATEGORIES

An enumeration of file type categories which can be selected.

```typescript
const FILE_CATEGORIES: {
  AUDIO: Readonly<{
    aac: "audio/aac";
    flac: "audio/flac";
    m4a: "audio/mp4";
    mid: "audio/midi";
    mp3: "audio/mpeg";
    ogg: "audio/ogg";
    opus: "audio/opus";
    wav: "audio/wav";
    webm: "audio/webm";
  }>;
  FONT: Readonly<{
    otf: "font/otf";
    ttf: "font/ttf";
    woff: "font/woff";
    woff2: "font/woff2";
  }>;
  GRAPHICS: Readonly<{
    fbx: "application/octet-stream";
    glb: "model/gltf-binary";
    gltf: "model/gltf+json";
    mtl: "model/mtl";
    obj: "model/obj";
    stl: "model/stl";
    usdz: "model/vnd.usdz+zip";
  }>;
  HTML: Readonly<{
    handlebars: "text/x-handlebars-template";
    hbs: "text/x-handlebars-template";
    html: "text/html";
  }>;
  IMAGE: Readonly<{
    apng: "image/apng";
    avif: "image/avif";
    bmp: "image/bmp";
    gif: "image/gif";
    jpeg: "image/jpeg";
    jpg: "image/jpeg";
    png: "image/png";
    svg: "image/svg+xml";
    tiff: "image/tiff";
    webp: "image/webp";
  }>;
  TEXT: Readonly<{
    csv: "text/csv";
    json: "application/json";
    md: "text/markdown";
    pdf: "application/pdf";
    tsv: "text/tab-separated-values";
    txt: "text/plain";
    xml: "application/xml";
    yaml: "application/yaml";
    yml: "application/yaml";
  }>;
  VIDEO: Readonly<{
    m4v: "video/mp4";
    mp4: "video/mp4";
    ogv: "video/ogg";
    webm: "video/webm";
  }>;
} = ...
```

## Category Details

- **AUDIO**: Audio file types
  - `aac`: `"audio/aac"`
  - `flac`: `"audio/flac"`
  - `m4a`: `"audio/mp4"`
  - `mid`: `"audio/midi"`
  - `mp3`: `"audio/mpeg"`
  - `ogg`: `"audio/ogg"`
  - `opus`: `"audio/opus"`
  - `wav`: `"audio/wav"`
  - `webm`: `"audio/webm"`

- **FONT**: Font file types
  - `otf`: `"font/otf"`
  - `ttf`: `"font/ttf"`
  - `woff`: `"font/woff"`
  - `woff2`: `"font/woff2"`

- **GRAPHICS**: 3D model and graphics file types
  - `fbx`: `"application/octet-stream"`
  - `glb`: `"model/gltf-binary"`
  - `gltf`: `"model/gltf+json"`
  - `mtl`: `"model/mtl"`
  - `obj`: `"model/obj"`
  - `stl`: `"model/stl"`
  - `usdz`: `"model/vnd.usdz+zip"`

- **HTML**: HTML and template file types
  - `handlebars`: `"text/x-handlebars-template"`
  - `hbs`: `"text/x-handlebars-template"`
  - `html`: `"text/html"`

- **IMAGE**: Image file types
  - `apng`: `"image/apng"`
  - `avif`: `"image/avif"`
  - `bmp`: `"image/bmp"`
  - `gif`: `"image/gif"`
  - `jpeg`: `"image/jpeg"`
  - `jpg`: `"image/jpeg"`
  - `png`: `"image/png"`
  - `svg`: `"image/svg+xml"`
  - `tiff`: `"image/tiff"`
  - `webp`: `"image/webp"`

- **TEXT**: Text and document file types
  - `csv`: `"text/csv"`
  - `json`: `"application/json"`
  - `md`: `"text/markdown"`
  - `pdf`: `"application/pdf"`
  - `tsv`: `"text/tab-separated-values"`
  - `txt`: `"text/plain"`
  - `xml`: `"application/xml"`
  - `yaml`: `"application/yaml"`
  - `yml`: `"application/yaml"`

- **VIDEO**: Video file types
  - `m4v`: `"video/mp4"`
  - `mp4`: `"video/mp4"`
  - `ogv`: `"video/ogg"`
  - `webm`: `"video/webm"`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Modules Documentation](https://foundryvtt.com/api/modules.html) > [CONST](https://foundryvtt.com/api/modules/CONST.html) > [FILE_CATEGORIES](https://foundryvtt.com/api/variables/CONST.FILE_CATEGORIES.html)