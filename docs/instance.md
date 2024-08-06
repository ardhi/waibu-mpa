# Class Instance

## Properties

  - ```name```: waibuMpa
  - ```alias```: wbmpa
  - ```config```: Configuration object. [Click here](configuration.md) to get more info
  - ```app```: App object
  - ```themes```: Array of all themes installed
  - ```iconsets```: Array of all iconset installed
  - ```viewEngines```: Array of all view engines installed

## Methods

### ```arrayToAttr(array = [], delimiter = ' ')```

  - Simply join ```array``` with ```delimiter```
  - Return ```string```

### ```attrToArray(text = '', delimiter = ' ')```

  - ```text``` will be splitted and each parts then trimmed against white spaces
  - Return ```array```