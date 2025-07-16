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
