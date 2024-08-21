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