function base64JsonDecode (data = 'e30=') {
  return JSON.parse(Buffer.from(data, 'base64'))
}

export default base64JsonDecode
