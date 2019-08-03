import storymap from './storymap-rewrite.js'
import './getSection.js'

export function enterBounds (bounds, feature, point) {
  if (LocateControl._active) {
    const visited = []
    const latlng = LocateControl._event.latlng
    const sceneName = feature.properties.scene
    if (latlng !== undefined && bounds.contains(latlng) && !visited.includes(sceneName)) {
      map.setView(point, 16)

      const scenesBefore = loop.slice(0, loop.indexOf(sceneName))
      const scenesAfter = loop.slice(loop.indexOf(sceneName), loop.length)

      loop = scenesAfter.concat(scenesBefore)

      const targetScene = sceneName
      getSection(sections, targetScene)
      // Prohibit Scene to be visited again
      visited.push(sceneName)
    }
  }
}
