# User Guide

## Component

### Attributes

Available to all components regardless its theme selection

#### Smart icon: ```... icon="leftIcon" icon-end="rightIcon" ...```

- Any components having either ```icon``` or ```icon-end``` or both attribute(s) will get its inner html with icon tag prepended/appended
- Attribute value is the name of icon and will be rendered to the current iconset's key mapping accordingly
- Unknown name silently yields an empty string
- Example:
  ```html
  <c:btn icon="arrowStart" icon-end="house" variant="primary">Go back home</c:btn>
  ```

  Result (with theme: 'pure', iconset: 'phosphor'):
  ```html
  <button class="pure-button pure-button-primary">
    <i class="ph ph-arrow-left"></i> Go back home <i class="ph ph-house"></i>
  </button>
  ```

### Common Components

Available to all components regardless its theme selection

#### ```<c:icon name="iconName" [oname="originalName"] />```

- This will generate tag for displaying icon. The name of the icon will be rendered to the current iconset's key mapping accordingly
- Unknown name silently yields an empty string
- If ```oname``` is given (stand for 'original-name'), you could put the exact icon class name without going through iconset's key mapping. This is sometime necessary, e.g. if you want to display an icon with name not in key mapping. **Warning** You will get unexpected result if you decide to change current iconset though!
- ```oname``` has precedence over ```name```, meaning ```name``` will be ignored if you provide both attributes
- Example:
  ```html
  <c:icon name="house" /><br />
  <c:icon name="unknownName" /><br />
  <c:icon oname="mdi mdi-shuffle" />
  ```

  Result (with iconset: 'phosphor'):
  ```html
  <i class="ph ph-house"></i><br />
  <br /> <!-- can't resolve non existent name, thus empty string -->
  <i class="mdi mdi-shuffle"></i> <!-- will generate this regardless selected iconset -->
  ```

#### ```<c:include template="tplName" prepend="text" append="text" ... />```

- Tag will be substituted with rendered content from ```tplName```
- Any other attributes provided BUT ```template``` serve as locals to the ```tplName```
- Template will be rendered just like a normal page template
- If ```prepend``` and/or ```append``` attribute are provided, its value will be prepended/appended after rendering. Value will be inserted as-is
- Template can also have any number of components, including ```c:include```
- But it is advisable to NOT have nested ```c:include``` for performance reason and danger of infinite loop
- Example:
  ```html
  <c:include template="bajoDemo:/showcase/include/header.html" />
  ```

#### ```<c:link href="url" ... />```

- Url starts with ```/``` or ```http```: passed through
- Url with format ```ns:path``` or ```ns.{static,virtual}:path``` will go to static or virtual asset of its namespace respectively
- Example:
  ```html
  <c:link href="waibuMpa.virtual:/purecss/pure.min.css" type="text/css" rel="stylesheet" />
  ```

  Result:
  ```html
  <link href="/asset/~/wbmpa/purecss/pure.min.css" type="text/css" rel="stylesheet" />
  ```

#### ```<c:page-start title="Page Title">...</c:page-start>```

- Use this component to conveniently wrap page with HTML header tags (```<html>```, ```<head>```, ```</head>```, down to opening body ```<body>```)
- Keep in mind that you should also close page with ```<c:page-end>``` component
- Page title can be provided as attribute ```title```
- Example:
  ```html
  <c:page-start t:title="My Page">
    <link src="https://mycdn.com/myscript.css" rel="stylesheet" />
  </c:page-start>
  ```

  Result (with lang: 'id'):
  ```html
  <!doctype html>
  <html lang="id">
    <head>
      <link src="https://mycdn.com/myscript.css" rel="stylesheet" />
      <title>Halamanku</title>
    </head>
    <body>
  ```

#### ```<c:page-end>...</c:page-end>```

- Should only be used when you use ```<c:page-start>``` as above
- It provides you page's closing tags (```</body>```, ```</html>```)
- Example:
  ```html
  <c:page-end>
    <p><c:t value="<%= (new Date()).getFullYear() %>">Copyright &copy; %d by My Company</c:t></p>
  </c:page-end>
  ```

  Result:
  ```html
      <p>Copyright &#xa9; 2024 by My Company</p>
    </body>
  </html>
  ```


#### ```<c:script src="url" ...></script>```

- Url starts with ```/``` or ```http```: passed through
- Url with format ```ns:path``` or ```ns.{static,virtual}:path``` will go to static or virtual asset of its namespace respectively
- Example:
  ```html
  <c:script src="waibuExtra.virtual:/jquery/jquery.min.js"></script>
  ```

  Result:
  ```html
  <script src="/asset/~/wbxtra/jquery/jquery.min.js"></script>
  ```

#### ```<c:script ...>urls</script>```

- Url format: ```url[;attr:value[;attr:value[...]]]```
- Multiple urls: provide as many url as you want, line-by-line
- Each url will be parsed according to rules on previous section
- By default, each url will generate one ```<script>``` tag with the same attributes specified
- To override default attributes, just put attributes in dot-comma separated key-value format
- Example:
  ```html
  <c:script>
  waibuMpa.virtual:/purecss/pure.min.css
  http://https://code.jquery.com/jquery-3.7.1.min.js;defer
  </c:script>
  ```

  Result:
  ```html
  <script src="/asset/~/wbmpa/purecss/pure.main.css"></script>
  <script src="http://https://code.jquery.com/jquery-3.7.1.min.js" defer></script>
  ```

### ```<c:style>...</c:style>```

- Any component tag found inside will be substituted with its correct selector
- Example:
  ```html
  <c:style>
  formCheckbox { background-color: #EEE };
  btn { border-color: #000 };
  ...
  </c:style>
  ```

  Result (with theme: 'pure'):
  ```html
  <style>
  input[type="checkbox"] { background-color: #EEE };
  .pure-button { border-color: #000 };
  ...
  </style>
  ```

### ```<c:t value="value" ...>string</c:t>```

- Translate ```string``` interpolated with ```value``` attribute
- ```value``` attribute is an array delimited by ```|``` (pipe) character
- Return a clean, interpolated string without surrounding tag
- Example:
  ```html
  <c:t value="Jakarta|Amsterdam">Departure: %s, Arrival: %s</c:t>
  ```

  Result (with lang: 'id'):
  ```html
  Keberangkatan: Jakarta, Kedatangan: Amsterdam
  ```

## Theme Specific Components

Listed below are components available in 'pure' (builtin theme). Click here for [Bootstrap](https://github.com/ardhi/waibu-bootstrap/blob/main/docs/component.md)'s one.

### ```<c:btn variant="..." size="..." ...>content</c:btn>```

- Available variants: ```primary```, ```secondary```, ```success```, ```warning``` and ```danger```
- Available sizes: ```sm```, ```md```, ```lg```
- By default, it uses ```<button>``` tag. To change to ```<a>```, add ```tag="a"``` attribute
- Giving ```href="..."``` attribute will also change tag to ```<a>``` automatically
- Add ```disabled``` attribute to set button state as disabled
- Example:
  ```html
  <c:btn type="submit" variant="primary" size="lg" disabled>
    <c:t>Button</c:t>
  </c:btn>
  ```

  Result (with theme: 'pure', lang: 'id'):
  ```html
  <button type="submit" class="pure-button pure-button-primary pure-button-lg" disabled>
    Tombol
  </button>
  ```

### ```<c:btn-group ...>...</c:btn-group>```

  - It serves as container for buttons
  - Example:
    ```html
    <c:btn-group>
      <c:btn variant="success">Button 1</btn>
      <c:btn variant="warning">Button 2</btn>
      <c:btn variant="danger">Button 3</btn>
    </c:btn-group>
    ```

    Result (with theme: 'pure'):
    ```html
    <div class="pure-button-group">
      <button class="pure-button pure-button-success">Button 1</button>
      <button class="pure-button pure-button-warning">Button 2</button>
      <button class="pure-button pure-button-danger">Button 3</button>
    </div>
    ```

# Page Building

## Components

Component is a html tag that starts with ```<c:name``` and ends with ```/c:name>```. It can also be a self closing tag.

## Apply Includes

## Mutation

### Attribute translator: ```... t:attribute="value" ...```

- Any attributes prefixed with ```t:``` are subjects to be translated
- ```value``` is an array delimited by ```|``` (pipe) character
- First array position is the text to be translated, while the rest are here for interpolations
- Example:
  ```html
  <div t:aria-label="Morning, %s|sunshine">...</div>
  ```

  Result (with lang: 'id'):
  ```html
  <div aria-label="Selamat pagi, sayang">...</div>
  ```

### Route path for ```href``` and ```src```

- Url inside ```href``` and ```src``` is a route path object
- All route path formats are supported. If it can't be detected, it falls back as is
- Example:
  ```html
  <link href="waibuBootstrap.virtual:/bootstrap/css/bootstrap.min.css" type="text/css" rel="stylesheet" />
  <img src="main:/images/logo.png" />
  <a href="sumba:/login">Login</a>
  ```

  Result:
  ```html
  <link href="/assets/~/wbbs/bootstrap/css/bootstrap.min.css" type="text/css" rel="stylesheet" />
  <img src="/assets/images/logo.png" />
  <a href="/sumba/login">Login</a>
  ```

### Teleport attribute ```... teleport="<id>"```

- A tag with such attribute will be teleported (moved) to tag with id ```<id>```
- If tag with such id is not found, nothing will change
- Example:
  ```html
  <div class="left-drawer">
    <div id="placeholder">Placeholder for menu</div>
  </div>
  <div class="main-content">
    <div>Cillum do minim incididunt Lorem nostrud officia occaecat elit</div>
    <div class="menu" teleport="placeholder">
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  </div>
  ```

  Result:
  ```html
  <div class="left-drawer">
    <div class="menu">
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
    </div>
  </div>
  <div class="main-content">
    <div>Cillum do minim incididunt Lorem nostrud officia occaecat elit</div>
  </div>
  ```

## Inject Meta, CSS & Scripts

## Route

All route files must be placed in ```<plugin-dir>/waibuMpa/route``` folder. This is the ```root``` folder of your route relative to its plugin prefix.

### Type of route files:

#### ```.js``` file

This is your normal route file. It should export an object with these properties:

- ```method```: Array of http verbs, defaults to ```['GET', 'HEAD']```
- ```url```: Set this value to overwrite url. Defaults to auto generated url from file's path
- ```handler```: Route handler

Example:
```javascript
const myRoute = {
  method: ['GET', 'POST'],
  handler: async function (req, reply) {
    // ... put your logic here
    return await reply.view('main.template:/my-route.html')
  }
}

export default myRoute
```

#### ```.json```
#### ```.html``` and ```.md```

Use this to put static content quick and easy. Content will then be considered as a bajoTemplate's template
so you can take advantage of everything what bajoTemplate has to offer.


