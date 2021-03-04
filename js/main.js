/* global $, fetch, _, Image, scale */

const oldSheeps = []
const newSheeps = []
const layer0 = []
const layer1 = []
const layer2 = []
const layer3 = []
const layers = [layer0, layer1, layer2, layer3]

window.oldSheeps = oldSheeps
window.newSheeps = newSheeps

window.layer0 = layer0
window.layer1 = layer1
window.layer2 = layer2
window.layer3 = layer3

window.layers = layers

$(async function () {
  // 先載入過去的總量，目前總量是 16
  await loadBefore()

  // 開始分 layers
  let i
  for (i = 0; i < 4; i++) {
    const sheep = oldSheeps.shift()
    if (sheep) {
      sheep.layer = 0
      layer0.push(sheep)
    }
  }
  for (i = 0; i < 4; i++) {
    const sheep = oldSheeps.shift()
    if (sheep) {
      sheep.layer = 1
      layer1.push(sheep)
    }
  }
  for (i = 0; i < 4; i++) {
    const sheep = oldSheeps.shift()
    if (sheep) {
      sheep.layer = 2
      layer2.push(sheep)
    }
  }
  for (i = 0; i < 4; i++) {
    const sheep = oldSheeps.shift()
    if (sheep) {
      sheep.layer = 3
      layer3.push(sheep)
    }
  }

  // debug 查看 layers
  // console.log(layers)
  console.log('after setup layers, oldSheeps', oldSheeps.length)

  // 開始接收過去
  setInterval(() => {
    loadBefore()
  }, 10000)

  // 開始接收未來
  setInterval(() => {
    loadAfter()
  }, 8000)

  // 將 layers 的羊放入場景
  // 將 layer0 的羊放入場景
  layer0.forEach(sheep => {
    createSheepSprite(sheep)
  })
  layer1.forEach(sheep => {
    createSheepSprite(sheep)
  })
  layer2.forEach(sheep => {
    createSheepSprite(sheep)
  })
  layer3.forEach(sheep => {
    createSheepSprite(sheep)
  })

  // 每十秒
  setInterval(() => {
    // 處理 new sheeps, 將羊放入場景
    if (newSheeps.length) {
      console.log('new sheep join!!!!!')
      const newSheep = newSheeps.shift()
      newSheep.layer = 0
      layer0.push(newSheep)
      createSheepSprite(newSheep)

      // 如果 layer0 現在有超多隻
      if (layer0.length > 6) {
        removeSheepFromLayer(0)
        removeSheepFromLayer(1)
        removeSheepFromLayer(2)
        removeSheepFromLayer(3)
      }
    } else {
      // 沒有 new sheep, 檢查 layer0 夠不夠羊，不夠就加 oldsheeps, 將羊放入場景
      if (layer0.length < 4) {
        if (oldSheeps.length) {
          console.log('old sheep join!!!!!')

          let oldSheep
          const choice = Math.floor(Math.random() * Math.floor(2))
          if (choice === 0) {
            console.log('choice 0')
            oldSheep = oldSheeps.shift()
          } else {
            console.log('choice 1')
            oldSheep = _.sample(oldSheeps)
            _.remove(oldSheeps, (o) => o === oldSheep)
          }

          oldSheep.layer = 0
          oldSheep.createdAt = new Date().toISOString()
          layer0.push(oldSheep)
          createSheepSprite(oldSheep)
        }
      }
    }
  }, 10 * 1000)

  // 趕走羊
  // 15秒檢查 layer0 是否需要趕走羊
  // 30秒檢查 layer1 是否需要趕走羊
  // 45秒檢查 layer2 是否需要趕走羊
  // 60秒檢查 layer3 是否需要趕走羊
  setInterval(async () => {
    await wait(5 * 1000)
    removeSheepFromLayer(0)
    await wait(5 * 1000)
    removeSheepFromLayer(1)
    await wait(5 * 1000)
    removeSheepFromLayer(2)
    await wait(5 * 1000)
    removeSheepFromLayer(3)
  }, 20 * 1000)
})

async function wait (time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), time)
  })
}

function removeSheepFromLayer (layer) {
  if (layers[layer].length < 4) return
  console.log('removeSheepFromLayer!!!!!', layer)
  const sheep = _.minBy(layers[layer], (o) => new Date(o.createdAt).getTime())
  if (sheep) {
    // 由 layer 中移除
    _.remove(layers[layer], (o) => o === sheep)
    // 升 layer 值
    sheep.layer = sheep.layer + 1
    if (sheep.layer < 4) {
      layers[sheep.layer].push(sheep)
    }
  }
}

// =================== load more =====================

let lastBeforeCursor = null
async function loadBefore () {
  const query = lastBeforeCursor
    ? '?limit=16&before=' + lastBeforeCursor
    : '?limit=16'
  console.log('load before:', '/api/sheeps' + query)
  await fetch('/api/sheeps' + query)
    .then(response => response.json())
    .then(result => {
      if (result.data.sheeps.length) {
        lastBeforeCursor = result.data.sheeps[result.data.sheeps.length - 1].createdAt
        result.data.sheeps.forEach(sheep => oldSheeps.push(sheep))
        console.log('oldSheeps', oldSheeps.length)
      }
    })
    .catch(e => console.log(e))
}

let lastAfterCursor = new Date().toISOString()
async function loadAfter () {
  const query = lastAfterCursor
    ? '?after=' + lastAfterCursor
    : ''
  console.log('load after:', '/api/sheeps' + query)
  await fetch('/api/sheeps' + query)
    .then(response => response.json())
    .then(result => {
      if (result.data.sheeps.length) {
        lastAfterCursor = result.data.sheeps[0].createdAt
        result.data.sheeps.forEach(sheep => newSheeps.push(sheep))
        console.log('newSheeps', newSheeps.length)
      }
    })
    .catch(e => console.log(e))
}

// ==================== createSheepSprite ===================

function createSheepSprite (sheep) {
  return new Sheep(sheep)
}

class Sheep {
  constructor (sheep) {
    this.sheep = sheep
    this.layer = sheep.layer
    this.id = sheep._id

    this.left = -400
    this.top = this.getTop()

    this.init()
    this.randomWalk()
      .then(() => {
        // 每隔 random 時間
        // 看看是否被刪除了, 更改 top, 停 timer, 重新加到 old sheeps
        // 看看是否被趕走去下一層, 更改 top, walk with top
        // 看看是否是原層走來走去, walk
        // 看看是否要食草, 乜都唔做
        // console.log('randomAnimate()111')
        this.randomAnimate()
      })
  }

  async randomAnimate () {
    // 呢一刻要決定下一個動作

    if (this.sheep.layer >= 4) {
      // 走到畫面外
      // console.log(this.id, 'randomAnimate', 'go away')
      await this.walkTo(2400)
      // 不會再有一下個 timer
      // 重新加到 old sheeps
      delete this.sheep.layer
      oldSheeps.push(this.sheep)
    } else if (this.layer !== this.sheep.layer) {
      this.layer = this.sheep.layer
      this.top = this.getTop()
      // console.log(this.id, 'randomAnimate', 'go other layer')
      await this.randomWalk()
      // console.log('randomAnimate()222')
      this.randomAnimate()
    } else {
      // 二選一
      // - 看看是否是原層走來走去
      // - 看看是否要食草
      const randomAction = this.getRandomInt(3)
      if (randomAction === 0) {
        // 走來走去
        // console.log(this.id, 'randomAnimate', 'randomWalk')
        await this.randomWalk()
        // console.log('randomAnimate()333')
        this.randomAnimate()
      } else {
        // 吃草
        // console.log(this.id, 'randomAnimate', 'eatGrass')
        await this.eatGrass()
        // console.log('randomAnimate()444')
        this.randomAnimate()
      }
    }
  }

  eatGrass () {
    const randomTime = 3000 + this.getRandomInt(3000)
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(), randomTime)
    })
  }

  getTop () {
    let top = 1300
    if (this.layer === 0) {
      top = 1300 + this.getRandomInt(100)
    }
    if (this.layer === 1) {
      top = 800 + this.getRandomInt(200)
    }
    if (this.layer === 2) {
      top = 400 + this.getRandomInt(200)
    }
    if (this.layer === 3) {
      top = 0 + this.getRandomInt(200)
    }
    return top
  }

  init () {
    this.$div = $(`<div id='sheep-${this.sheep._id}'></div>`)
      .css({
        position: 'absolute',
        left: this.left,
        top: this.top,
        zIndex: 2000 + this.top
      })
    this.$div.appendTo('.sheeps')

    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    var ctx = canvas.getContext('2d')
    var img = new Image()
    img.onload = () => {
      var imgMask = document.getElementById('sheep-mask')
      ctx.drawImage(imgMask, 0, 0)
      ctx.globalCompositeOperation = 'source-out'
      ctx.drawImage(img, 0, 0)
      this.$div.append(canvas)
    }
    img.src = this.sheep.img
  }

  async randomWalk () {
    const nextLeft = this.randomNextLeft()
    await this.walkTo(nextLeft)
  }

  async walkTo (nextLeft) {
    const duration = this.randomDuration(nextLeft)

    if (nextLeft > this.left) {
      this.$div.css({ transform: 'scale(-1, 1)' })
    } else {
      this.$div.css({ transform: 'scale(1, 1)' })
    }

    await this.$div.animate({
      left: nextLeft + 'px',
      top: this.top + 'px',
      zIndex: 2000 + this.top
    }, duration, 'linear').promise()
    this.left = nextLeft
  }

  randomNextLeft () {
    let left = this.getRandomInt(2000)
    while (Math.abs(this.left - left) < 500) {
      left = this.getRandomInt(2000)
    }
    return left
  }

  randomDuration (nextLeft) {
    const distance = Math.abs(this.left - nextLeft)
    const min = distance / 300 * 1000
    const max = distance / 100 * 1000 - min
    return min + this.getRandomInt(max)
  }

  getRandomInt (max) {
    return Math.floor(Math.random() * Math.floor(max))
  }
}

// =============== zoom ================

let zoom = 50
document.body.style.zoom = zoom + '%'
$(document).keypress((e) => {
  if (e.key === 'c') {
    zoom--
    console.log('zoom', zoom)
    document.body.style.zoom = zoom + '%'
  } else if (e.key === 'v') {
    zoom++
    console.log('zoom', zoom)
    document.body.style.zoom = zoom + '%'
  }
})
