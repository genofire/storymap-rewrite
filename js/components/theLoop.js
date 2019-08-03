var loop = [];

function orderLoop (sceneName) {
  let scenesBefore = loop.slice(0, loop.indexOf(sceneName));
  let scenesAfter = loop.slice(loop.indexOf(sceneName), loop.length);

  loop = scenesAfter.concat(scenesBefore);
  console.log(loop);
}

function nextItem (sceneName) {
  loop.push(sceneName);
  loop.shift()
  return loop[0]
}

function prevItem() {
  loop.unshift(loop[loop.length - 1]);
  loop.pop()
  return loop[0]
}
