/* global $, fetch */

$(function () {
  var video = document.querySelector('video')
  var videoSelectedValue

  getDevices().then(gotDevices).then(getStream)

  function getDevices () {
    // AFAICT in Safari this only gets default devices until gUM is called :/
    return navigator.mediaDevices.enumerateDevices()
  }

  function gotDevices (deviceInfos) {
    window.deviceInfos = deviceInfos // make available to console
    console.log('Available input and output devices:', deviceInfos)
    for (const deviceInfo of deviceInfos) {
      if (deviceInfo.kind === 'videoinput') {
        console.log('deviceInfo.label', deviceInfo.label)
        if (deviceInfo.label.indexOf('USB Camera') === 0) {
          videoSelectedValue = deviceInfo.deviceId
        }
      }
    }
  }

  function getStream () {
    if (window.stream) {
      window.stream.getTracks().forEach(track => {
        track.stop()
      })
    }
    const videoSource = videoSelectedValue
    console.log('videoSource', videoSource)
    const constraints = {
      video: {
        deviceId: videoSource ? { exact: videoSource } : undefined,
        width: { exact: 400 },
        height: { exact: 400 }
      }
    }
    return navigator.mediaDevices.getUserMedia(constraints)
      .then(gotStream).catch(handleError)
  }

  function gotStream (stream) {
    window.stream = stream // make stream available to console
    video.srcObject = stream
  }

  function handleError (error) {
    console.error('Error: ', error)
  }

  // capture

  const canvas = document.createElement('canvas')

  let keypressEnabled = true

  $(document).keypress((e) => {
    if (keypressEnabled && e.key === 'a') {
      keypressEnabled = false
      canvas.width = 400
      canvas.height = 400
      canvas.getContext('2d').drawImage(video, 0, 0)

      var imgLine = document.getElementById('sheep-line')
      canvas.getContext('2d').drawImage(imgLine, 0, 0)

      const dataURL = canvas.toDataURL('image/jpeg', 0.85)
      console.log(dataURL)

      postData('/api/sheeps/create', { img: dataURL })
        .then(data => {
          console.log(data) // JSON data parsed by `data.json()` call
          $('.generator').addClass('hide')
          $('.born').removeClass('hide')

          var myCanvas = document.getElementById('myCanvas')
          var ctx = myCanvas.getContext('2d')
          var imgMask = document.getElementById('sheep-mask')

          myCanvas.width = 400
          myCanvas.height = 400
          ctx.drawImage(imgMask, 0, 0)
          ctx.globalCompositeOperation = 'source-out'
          ctx.drawImage(canvas, 0, 0)
        })
        .catch(e => {
          console.log(e)
        })

      setTimeout(() => {
        keypressEnabled = true
        $('.generator').removeClass('hide')
        $('.born').addClass('hide')
      }, 5000)
    }
  })
})

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
