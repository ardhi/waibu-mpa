# Config

Open/create ```<bajo-data-dir>/config/waibuMpa.json```:

| Key | Type | Default 'dev' | Default 'prod' | Description |
| --- | ---- | ------------- | -------------- | ----------- |
| ```mountMainAsRoot``` | ```boolean``` | ```true``` | ```true``` | Mount main plugin's routes as root. Set to ```false``` to have prefixed with ```/main``` |
| ```charset``` | ```string``` | ```utf-8``` | ```utf-8``` | Used to set rendered page's character set |
| ```i18n``` | ```object``` | | | I18N settings |
| &nbsp;&nbsp;```detectors``` | ```array``` | ```["qs"]``` | ```["qs"]``` | Language detector |
| ```session``` | ```object/boolean``` | ```<def>``` | ```<def>``` | [Session](https://github.com/fastify/session) settings. Set to ```false``` to disable session |
| ```emoji``` | ```boolean``` | ```true``` | ```true``` | Allow/disallow emoji rendering |
| ```viewEngine``` | ```object``` | | | Default/built-in view engine settings |
| &nbsp;&nbsp;```cacheMaxAge``` | ```number``` | ```0``` | ```300``` | Max of time a page template will be cached |
| ```theme``` | ```object/boolean``` | | | Theme settings. Set to ```false``` to NOT use theme altogether |
| &nbsp;&nbsp;```default``` | ```string``` | ```pure``` | ```pure``` | Theme to use by default |
| &nbsp;&nbsp;```autoInsert``` | ```array``` | ```<all>``` | ```<all>``` | Auto insert items from theme. Available options: ```meta```, ```css```, ```scripts``` |
| &nbsp;&nbsp;```component``` | ```object``` | | | Component settings |
| &nbsp;&nbsp;&nbsp;&nbsp;```unknowntag``` | ```string``` | ```comment``` | ```remove``` | Unknown tag handling: ```comment```, ```remove```, ```divReplace``` |
| &nbsp;&nbsp;&nbsp;&nbsp;```insertCtagAsAttr``` | ```boolean``` | ```true``` | ```false``` | Set to ```true``` to insert component tag as attribute. Useful for debugging |
| &nbsp;&nbsp;&nbsp;&nbsp;```defaultTag``` | ```string``` | ```div``` | ```div``` | Default tag to use if none is given |
| &nbsp;&nbsp;&nbsp;&nbsp;```cacheMaxAge``` | ```number``` | ```0``` | ```300``` | Max of time a component template will be cached |
| ```iconset``` | ```object/boolean``` | | | Iconset settings. Set to ```false``` to NOT use iconset at all |
| &nbsp;&nbsp;```default``` | ```string``` | ```<none>``` | ```<none>``` | Which iconset is to use by default |
| &nbsp;&nbsp;```autoInsert``` | ```array``` | ```<all>``` | ```<all>``` | Auto insert items from iconset. Available options: ```css```, ```scripts``` |
| ```prettier``` | ```object/boolean``` | ```<def>``` | ```false``` | [Prettier](https://prettier.io/docs/en/options) settings. Set to ```false``` to disable |
| ```minifier``` | ```object/boolean``` | ```false``` | ```<def>``` | [Minifier](https://github.com/terser/html-minifier-terser) settings. Set to ```false``` to disable |
| ```markdown``` | ```object/boolean``` | ```<def>``` | ```<def>```| Markdown settings. Require [Bajo Markdown](https://github.com/ardhi/bajo-markdown) to be loaded. Set to ```false``` to disable |
| ```multipart``` | ```object/boolean``` | ```<def>``` | ```<def>``` | [Multipart](https://github.com/fastify/fastify-multipart) settings. Set to ```false``` to disable |
| ```cors``` | ```object/boolean``` | ```<def>``` | ```<def>``` | [Cors](https://github.com/fastify/fastify-cors) settings. Set to ```false``` to disable |
| ```helmet``` | ```object/boolean``` | ```<def>``` | ```<def>``` | [Helmet](https://github.com/fastify/fastify-helmet) settings. Set to ```false``` to disable |
| ```compress``` | ```object/boolean``` | ```false``` | ```<def>``` | [Compress](https://github.com/fastify/fastify-compress) settings. Set to ```false``` to disable |
| ```rateLimit``` | ```object/boolean``` | ```false``` | ```<def>``` | [Rate limit](https://github.com/fastify/fastify-rate-limit) settings. Set to ```false``` to disable |
| ```disabled``` | ```array``` | ```[]``` | ```[]``` | Route to be disabled |
