# Component

## Common

### \<c:script src="url" ...\>\</script\>

- Url starts with ```/``` or ```http```: passed through
- Url with format ```ns:path``` or ```ns.{static,virtual}:path``` will go to static or virtual asset of its namespace respectively
- Example:
  ```html
  <c:script src="waibuMpa.virtual:/purecss/pure.min.css"></script>
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

## Theme specific