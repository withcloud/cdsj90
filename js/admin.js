/* global $, fetch */

let loading = false
let lastCursor

$(function () {
  loadmore()
})

function showSheeps (sheeps = []) {
  sheeps.forEach(sheep => {
    $('.sheeps').append(`
      <div id="sheep-${sheep._id}">
        <img src="${sheep.img}" />
        <div>${sheep.createdAt}</div>
        <button onclick="deleteSheep('${sheep._id}')">Delete</button>
      </div>
    `)
  })
}

function loadmore (cursor) {
  if (loading) return
  loading = true
  const query = cursor
    ? '?cursor=' + cursor
    : ''
  fetch('/api/sheeps' + query)
    .then(response => response.json())
    .then(result => {
      showSheeps(result.data.sheeps)
      if (result.data.sheeps.length < 10) {
        $('.btn-loadmore').hide()
      }
      if (result.data.sheeps.length) {
        lastCursor = result.data.sheeps[result.data.sheeps.length - 1].createdAt
      }
      loading = false
    })
}

$('.btn-loadmore').click(function () {
  loadmore(lastCursor)
})

// eslint-disable-next-line
function deleteSheep (id) {
  if (!id) return
  var r = window.confirm('delete?')
  if (r === true) {
    postData('/api/sheeps/delete', {
      id
    })
      .then(result => {
        $(`#sheep-${id}`).remove()
      })
  }
}

async function postData (url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  })
  return response.json() // parses JSON response into native JavaScript objects
}
