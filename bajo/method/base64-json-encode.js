function base64JsonEncode (data) {
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

export default base64JsonEncode
