# Hook

## Collector

### ```weibuMpa.<viewEngineName>:beforeCollectViewEngine(opts)```

  - ```opts```: Raw view engine options object

### ```weibuMpa.<viewEngineName>:afterCollectViewEngine(viewEngine)```

  - ```viewEngine```: View engine theme

### ```weibuMpa.<themeName>:beforeCollectTheme(opts[, frameworkOptions])```

  - ```opts```: Raw theme options object
  - ```frameworkOpts```: Raw theme's framework options object (if any)

### ```weibuMpa.<themeName>:afterCollectTheme(theme)```

  - ```theme```: Theme instance

### ```weibuMpa.<iconsetName>:beforeCollectIconset(opts)```

  - ```opts```: Raw iconset options object

### ```weibuMpa.<iconsetName>:afterCollectIconset(opts)```

  - ```opts```: Iconset instance

## Page Rendering

### ```waibuMpa:beforeRender ({ tpl, locals, reply, opts })```

  - ```tpl```: Template name in ```<ns>:<path>.<ext>``` format
  - ```locals```: Object that will be merged within the template
  - ```reply```: Fastify's reply object
  - ```opts```: Options that might be passed by caller

### ```waibuMpa:afterRender ({ tpl, locals, reply, opts, ext, result })```

  - ```tpl```: Template name in ```<ns>:<path>.<ext>``` format
  - ```locals```: Object that's got merged within the template
  - ```reply```: Fastify's reply object
  - ```opts```: Options that might be passed by caller
  - ```result```: Rendered template

## Page Building

### ```waibuMpa:beforeBuildPage ({ $, theme, iconset, reply, locals })```

  - ```$```: Cheerio page object
  - ```theme```: Current theme instance
  - ```iconset```: Current iconset instance, if any
  - ```reply```: Fastify's reply object
  - ```locals```: Object that will be merged within the template

### ```waibuMpa:afterBuildPage ({ $, theme, iconset, reply, locals })```

  - ```$```: Cheerio page object
  - ```theme```: Current theme instance
  - ```iconset```: Current iconset instance, if any
  - ```reply```: Fastify's reply object
  - ```locals```: Object that will be merged within the template

### ```waibuMpa.<themeName>:beforeBuildPage ({ $, iconset, reply, locals })```

  - ```$```: Cheerio page object
  - ```iconset```: Current iconset instance, if any
  - ```reply```: Fastify's reply object
  - ```locals```: Object that will be merged within the template

### ```waibuMpa.<themeName>:afterBuildPage ({ $, iconset, reply, locals })```

  - ```$```: Cheerio page object
  - ```iconset```: Current iconset instance, if any
  - ```reply```: Fastify's reply object
  - ```locals```: Object that will be merged within the template

### ```waibuMpa.<iconsetName>:beforeBuildPage ({ $, theme, reply, locals })```

  - ```$```: Cheerio page object
  - ```theme```: Current theme instance
  - ```reply```: Fastify's reply object
  - ```locals```: Object that will be merged within the template

### ```waibuMpa.<iconsetName>:afterBuildPage ({ $, theme, reply, locals })```

  - ```$```: Cheerio page object
  - ```theme```: Current theme instance
  - ```reply```: Fastify's reply object
  - ```locals```: Object that will be merged within the template
