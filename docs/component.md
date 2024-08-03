# Component

## Common

### Attribute translator: ```t:attribute="value"```

- Any attributes prefixed with ```t:``` are subject to be translated
- ```value``` is an array delimited by ```|``` (pipe) character
- First array position is the text to be translated, while the rest are here for interpolation
- Example:
  ```html
  <div t:aria-label="Morning, %s|sunshine">content</div>
  ```

### \<c:include attr1="value1" attr2="value2" ...\>tplName\</c:include\>

- Tag will be substitued with content from ```tplName```
- All attributes provided serve as locals to the ```tplName```
- Template will be rendered using its view engine just like a normal template
- Template can also have any number of components, including ```c:include```
- But it is advisable to NOT have nested ```c:include``` for performance reason and danger of infinite loop
- Example:
  ```html
  <c:include>bajoDemo:/showcase/include/header.html</c:include>
  ```

### \<c:link href="url" ... /\>

- Url starts with ```/``` or ```http```: passed through
- Url with format ```ns:path``` or ```ns.{static,virtual}:path``` will go to static or virtual asset of its namespace respectively
- Example:
  ```html
  <c:link href="waibuMpa.virtual:/purecss/pure.min.css" type="text/css" rel="stylesheet" />
  ```

### \<c:script src="url" ...\>\</script\>

- Url starts with ```/``` or ```http```: passed through
- Url with format ```ns:path``` or ```ns.{static,virtual}:path``` will go to static or virtual asset of its namespace respectively
- Example:
  ```html
  <c:script src="waibuExtra.virtual:/jquery/jquery.min.js"></script>
  ```

### \<c:script ...\>urls\</script\>

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

### <c:style>...</c:style>

- Any component tag found inside will be substitued with its correct selector

### \<c:t value="..."\>string\</c:t\>

- Translate ```string``` interpolated with ```value``` attribute
- ```value``` attribute is an array delimited by ```|``` (pipe) character
- Return a clean, interpolated string without surrounding tag
- Example:
  ```html
  <c:t value="Jakarta|Amsterdam">Departure: %s, Arrival: %s</c:t>
  ```

## Theme specific

