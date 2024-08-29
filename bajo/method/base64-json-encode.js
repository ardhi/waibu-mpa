function base64JsonEncode (data) {
  return JSON.parse(Buffer.from(data, 'base64'))
}

export default base64JsonEncode
