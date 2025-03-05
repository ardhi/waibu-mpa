// Based on: https://github.com/siddharth-sunchu/native-methods/blob/master/JSONStringfy.js

function jsonStringify (obj, replacer, space) {
  const {
    isNumber, isString, isBoolean, isUndefined, isFunction, isSymbol,
    isNull, isDate, isArray, isPlainObject
  } = this.app.bajo.lib._

  if (replacer !== true) return JSON.stringify(obj, replacer, space)

  const isNotNumber = (value) => {
    return isNumber(value) && isNaN(value)
  }

  const isInfinity = (value) => {
    return isNumber(value) && !isFinite(value)
  }

  const restOfDataTypes = (value) => {
    return isNumber(value) || isString(value) || isBoolean(value)
  }

  const ignoreDataTypes = (value) => {
    return isUndefined(value) || isFunction(value) || isSymbol(value)
  }

  const nullDataTypes = (value) => {
    return isNotNumber(value) || isInfinity(value) || isNull(value)
  }

  const arrayValuesNullTypes = (value) => {
    return isNotNumber(value) || isInfinity(value) || isNull(value) || ignoreDataTypes(value)
  }

  const removeComma = (str) => {
    const tempArr = str.split('')
    tempArr.pop()
    return tempArr.join('')
  }

  if (ignoreDataTypes(obj)) {
    return undefined
  }

  if (isDate(obj)) {
    return `"${obj.toISOString()}"`
  }

  if (nullDataTypes(obj)) {
    return `${null}`
  }

  if (isSymbol(obj)) {
    return undefined
  }

  if (restOfDataTypes(obj)) {
    const passQuotes = isString(obj) ? "'" : ''
    return `${passQuotes}${obj}${passQuotes}`
  }

  if (isArray(obj)) {
    let arrStr = ''
    obj.forEach((eachValue) => {
      arrStr += arrayValuesNullTypes(eachValue) ? jsonStringify.call(this, null, replacer, space) : jsonStringify.call(this, eachValue, replacer, space)
      arrStr += ','
    })

    return '[' + removeComma(arrStr) + ']'
  }

  if (isPlainObject(obj)) {
    let objStr = ''

    const objKeys = Object.keys(obj)

    objKeys.forEach((eachKey) => {
      const eachValue = obj[eachKey]
      if (eachKey.includes('-')) eachKey = `'${eachKey}'`
      objStr += (!ignoreDataTypes(eachValue)) ? `${eachKey}:${jsonStringify.call(this, eachValue, replacer, space)},` : ''
    })
    return '{' + removeComma(objStr) + '}'
  }
}

export default jsonStringify
