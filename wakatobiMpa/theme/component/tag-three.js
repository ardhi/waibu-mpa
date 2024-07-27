async function tagThree (params) {
  params.tag = 'div'
  params.html = '--- <p><%= _meta.lang %></p> --- ' + params.html + ' ---'
}

export default tagThree
