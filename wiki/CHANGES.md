# Changes

## 2026-03-08

- [2.8.3] Bug fix in ```getAppTitle()```
- [2.8.3] Bug fix in ```getPluginTitle()```

## 2026-03-07

- [2.8.0] Add favicon route
- [2.8.0] Update logo route to search in ```site``` attachment with fallback to ```main``` location
- [2.8.1] Update favicon behaviour: if no file in ```main``` then use the default one
- [2.8.2] Cleanup debugging message

## 2026-03-05

- [2.7.0] New params structure for component functions in ```wmpa.js```

## 2026-03-03

- [2.6.4] Bug fix in ```wmpa.addComponent()```

## 2026-03-02

- [2.6.3] Bug fix in ```applyFormat()```. In ```dev``` environment, prettier & minifier should be disabled

## 2026-02-22

- [2.6.2] Bug fix in frontend's timezone

## 2026-02-21

- [2.6.1] Bug fix in ```errorHandler```
- [2.6.1] Bug fix in ```notFoundHandler```
- [2.6.1] Add fallback template for both handlers above

## 2026-02-18

- [2.6.0] Add auto trashing old session
- [2.6.0] Remove unecessary ```expires``` field in ```WmpaSession```
- [2.6.0] Change component's ```buildOptions()``` to async method to accomodate ```prop.values``` as a handler
- [2.6.0] Bug fix in theme and iconset resolver

## 2026-02-18

- [2.5.0] Move ```attrTo*()``` and ```base64Json*()``` to ```waibu``` because they are sometimes needed outside the ```waibu-mpa```
- [2.5.0] Bug fix in ```component.buildOptions()```
- [2.5.1] Bug fix in ```component.buildOptions()```

## 2026-02-17

- [2.4.3] Bug fix in ```req.theme``` and ```req.iconset``` resolver

## 2026-02-10

- [2.4.2] Put ```bajo-config``` as dependency

## 2026-02-09

- [2.3.0] Add ```config.page.scriptsAtEndOfBody``` to put scripts at the end of body or not. Defaults to ```true```
- [2.3.0] Add not found & error handlers
- [2.3.0] Bug fix in old context
- [2.3.0] Bug fix in ```loadResource()```
- [2.3.0] Bug fix in ```<link />``` injection
- [2.3.0] Bug fix in order of metas, links & scripts
- [2.4.0] Add ```anchor``` and ```navigation``` icons
- [2.4.0] Add dark mode auto detect right at inject elements
- [2.4.1] Bug fix in ```parseAttribs()```
- [2.4.1] Attribute mutations (href, src, action) now accept url with parameter


## 2026-02-05

- [2.1.11] Bug fix in rendering ```preconnect```

## 2026-01-21

- [2.1.8] Add ```getPluginTitle()```
- [2.1.8] Bug fix in ```getAppTitle()```
- [2.1.8] Rework on all title handlers
- [2.1.9] Favicon handling

## 2026-01-19

- [2.1.6] Bug fix in ```getAppTitle()```
- [2.1.7] Change default cookie ```maxAge``` to 7 days

## 2026-01-18

- [2.1.5] Dark mode should only be handle by a hook

## 2026-01-17

- [2.1.3] Bug fix in ```getAppTitle()```
- [2.1.4] Add capability to set custom theme & iconset through headers

## 2026-01-13

- [2.1.1] Bug fix in waibuMpa's widgeting system

## 2026-01-08

- [2.1.0] Upgrade to ```node-emoji@2.2.0```
- [2.1.0] Upgrade to ```prettier@2.7.4```
- [2.1.0] Upgrade to ```tring-strip-html@13.5.0```

## 2025-12-30

- [2.1.0] Ported to match ```bajo@2.2.x``` specs
