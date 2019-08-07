let loop = []

export function fillLoop (scenesObject) {
  for (var [key, scene] of Object.entries(scenesObject)) {
    if (scene.navigateTo && key !== 'ueberseetor') {
      loop.push('navigation')
    }
    loop.push(key)
  }
}

export function orderLoop (sceneKey) {
  const scenesBefore = loop.slice(0, loop.indexOf(sceneKey))
  const scenesAfter = loop.slice(loop.indexOf(sceneKey), loop.length)

  loop = scenesAfter.concat(scenesBefore)
}

export function nextScene (currentSceneKey) {
  loop.push(currentSceneKey)
  loop.shift()
  return loop[0]
}

export function prevItem () {
  loop.unshift(loop[loop.length - 1])
  loop.pop()
  return loop[0]
}
