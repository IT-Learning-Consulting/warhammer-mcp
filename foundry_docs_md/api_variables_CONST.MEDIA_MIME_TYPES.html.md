# MEDIA_MIME_TYPES | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
const MEDIA_MIME_TYPES: (
    | "image/apng"
    | "image/avif"
    | "image/bmp"
    | "image/gif"
    | "image/jpeg"
    | "image/png"
    | "image/svg+xml"
    | "image/tiff"
    | "image/webp"
    | "video/mp4"
    | "video/ogg"
    | "video/webm"
    | "audio/aac"
    | "audio/flac"
    | "audio/mp4"
    | "audio/midi"
    | "audio/mpeg"
    | "audio/ogg"
    | "audio/opus"
    | "audio/wav"
    | "audio/webm"
    | "text/csv"
    | "application/json"
    | "text/markdown"
    | "application/pdf"
    | "text/tab-separated-values"
    | "text/plain"
    | "application/xml"
    | "application/yaml"
    | "font/otf"
    | "font/ttf"
    | "font/woff"
    | "font/woff2"
    | "application/octet-stream"
    | "model/gltf-binary"
    | "model/gltf+json"
    | "model/mtl"
    | "model/obj"
    | "model/stl"
    | "model/vnd.usdz+zip"
)[]
```

A list of MIME types which are treated as uploaded "media", which are allowed to overwrite existing files. Any non-media MIME type is not allowed to replace an existing file.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)