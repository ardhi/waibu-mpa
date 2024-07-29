async function iconset (ctx) {
  return {
    name: 'default',
    css: 'waibuMpa.virtual:/phicons/regular/style.css',
    mapping: {
      _notFound: 'ph ph-image-broken',
      home: 'ph ph-house'
    }
  }
}

export default iconset
