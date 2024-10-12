// based on: https://github.com/kyleparisi/pagination-layout/blob/master/pagination-layout-be.js

function paginationLayout (totalItems, itemsPerPage, currentPage) {
  const { isPlainObject } = this.app.bajo.lib._
  if (isPlainObject(totalItems)) {
    currentPage = totalItems.page
    itemsPerPage = totalItems.limit
    totalItems = totalItems.count
  }
  function last (array) {
    const length = array == null ? 0 : array.length
    return length ? array[length - 1] : undefined
  }

  const pages = Math.ceil(totalItems / itemsPerPage)

  if (!totalItems) return []

  // default pages when we only have <= 4 pages
  if ([1, 2, 3, 4, 5, 6, 7].indexOf(pages) !== -1) {
    const defaultView = []
    for (let i = 1; i <= pages; i++) {
      defaultView.push(i)
    }
    return defaultView
  }

  currentPage = currentPage || 1

  const boundary = 2
  let boundaryMiddle = false

  // if current page is sufficiently in the middle, boundary is +1 and -1
  if (
    currentPage > 3 &&
    (pages - currentPage >= 3 ||
    pages - currentPage === 1)
  ) {
    boundaryMiddle = true
  }

  if (currentPage > pages) {
    currentPage = pages
  }

  if (currentPage < 1) {
    currentPage = 1
  }

  const output = []

  if (!boundaryMiddle) {
    // count up to boundary amount from current page
    for (let i = currentPage; i <= pages; i++) {
      if (output.length === boundary) {
        break
      }
      output.push(i)
    }

    // if we do not fill the boundary count, count down from current page
    if (output.length < boundary) {
      for (let i = currentPage - 1; i > pages - boundary; i--) {
        output.unshift(i)
      }
    }
  } else {
    // count up 1 and down 1 from current page
    output.push(currentPage - 1)
    output.push(currentPage)
    output.push(currentPage + 1)
  }

  // attach last page to nav when only 1 away
  if (pages - last(output) === 1) {
    output.push(pages)
  }

  // attach first page to when only 1 away
  if (output[0] === 2) {
    output.unshift(1)
  }

  // attach first page to when only 2 away
  if (currentPage === 3) {
    output.unshift(2)
    output.unshift(1)
  }

  // put lowest page and ... when we exceed the boundary
  if (
    currentPage > 3 &&
    pages > boundary &&
    pages > 7
  ) {
    output.unshift(1, '...')
  }

  if (output.length < 7) {
    let need = 7 - output.length
    // should count down
    if (pages === last(output)) {
      for (let i = 1; i <= need; i++) {
        output.splice(2, 0, output[2] - 1)
      }
    } else if (!boundaryMiddle) { // should count up
      // remove "...", [last page]
      need = need - 2
      for (let i = 1; i <= need; i++) {
        output.push(last(output) + 1)
      }
    }
  }

  // done if the final page is in view
  if (!(pages - last(output) > 1)) {
    return output
  }

  // attach final page to view
  output.push('...')
  output.push(pages)
  return output
}

export default paginationLayout
