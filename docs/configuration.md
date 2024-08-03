# Config

Open/create ```<bajo-data-dir>/config/waibuMpa.json```:

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| ```mountMainAsRoot``` | ```boolean``` | ```true``` | Mount main plugin's routes as root. Set to ```false``` to prefixed with ```/main``` |
| ```charset``` | ```string``` | ```utf-8``` | Used to set rendered page's character set |
| ```i18n``` | ```object``` | | I18N settings |
| &nbsp;&nbsp;```detectors``` | ```array``` | ```["qs"]``` | Language detector |
| ```session``` | ```object/boolean``` | | Session settings ([more](https://github.com/fastify/session)). Set to ```false``` to disable session |
| ```emoji``` | ```boolean``` | ```true``` | Allow/disallow emoji rendering |
| ```viewEngine``` | ```object``` | | Default/built-in view engine settings |
| &nbsp;&nbsp;```cacheMaxAge``` | ```number``` | ```300``` | Max of time a page template will be cached |
| ```theme``` | ```object/boolean``` | | Theme settings. Set to ```false``` to NOT use theme altogether |
| &nbsp;&nbsp;```default``` | ```string``` | ```default``` | Which theme is to use by default |
| &nbsp;&nbsp;```autoInsert``` | ```array``` | ```["meta", "css", "scripts"]``` | Auto insert items from theme. Available options: ```meta```, ```css```, ```scripts``` |
| &nbsp;&nbsp;```component``` | ```object``` | | Component settings |
| &nbsp;&nbsp;&nbsp;&nbsp;```insertCtag``` | ```boolean``` | ```false``` | Set to ```true``` to insert component tag as attribute. Useful for debugging |
| &nbsp;&nbsp;&nbsp;&nbsp;```defaultTag``` | ```string``` | ```div``` | Default tag to use if none is given |
| &nbsp;&nbsp;&nbsp;&nbsp;```cacheMaxAge``` | ```number``` | ```300``` | Max of time a component template will be cached |
| ```iconset``` | ```object/boolean``` | | Iconset settings. Set to ```false``` to NOT use iconset at all |
| &nbsp;&nbsp;```default``` | ```string``` | ```default``` | Which iconset is to use by default |
| &nbsp;&nbsp;```autoInsert``` | ```array``` | ```["css", "scripts"]``` | Auto insert items from iconset. Available options: ```css```, ```scripts``` |
| ```prettier``` | ```object/boolean``` | | Prettier settings ([more](https://prettier.io/docs/en/options)). Set to ```false``` to disable |
| ```minifier``` | ```object/boolean``` | | Minifier settings ([more](https://github.com/terser/html-minifier-terser)). Set to ```false``` to disable |
| ```markdown``` | ```object/boolean``` | | Markdown settings ([more](https://github.com/terser/html-minifier-terser)). Require [Bajo Markdown](https://github.com/ardhi/bajo-markdown) to be loaded. Set to ```false``` to disable |
| ```multipart``` | ```object/boolean``` | ```{}``` | Multipart settings ([more](https://github.com/fastify/fastify-multipart)). Set to ```false``` to disable |
| ```cors``` | ```object/boolean``` | ```{}``` | Cors settings ([more](https://github.com/fastify/fastify-cors)). Set to ```false``` to disable |
| ```helmet``` | ```object/boolean``` | ```{ "contentSecurityPolicy": false }``` | Cors settings ([more](https://github.com/fastify/fastify-helmet)). Set to ```false``` to disable |
| ```compress``` | ```object/boolean``` | ```false``` | Compress settings ([more](https://github.com/fastify/fastify-compress)) |
| ```rateLimit``` | ```object/boolean``` | ```false``` | Rate limit settings ([more](https://github.com/fastify/fastify-rate-limit)) |
| ```disabled``` | ```array``` | ```[]``` | Route to be forcefully disabled |
