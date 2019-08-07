import { getSection } from './getSection.js'
import { orderLoop } from './theLoop.js'
import { mapsPlaceholder } from './createMap.js'
import { locateControlWrapper } from './addLocateControl.js'
import { sectionsWrapper } from './sectionWrapper.js'

export function enterBounds (bounds, feature, point, visited) {
  const map = mapsPlaceholder[0]
  const sections = sectionsWrapper[0]
  const locateControl = locateControlWrapper[0]
  if (locateControl._active) {
    const latlng = locateControl._event.latlng
    const sceneName = feature.properties.scene
    if (latlng !== undefined && bounds.contains(latlng) && !visited.includes(sceneName)) {
      map.setView(point, 16)

      orderLoop(sceneName)

      const targetScene = sceneName
      getSection(sections, targetScene)
      // Prohibit Scene to be visited again
      visited.push(sceneName)
    }
  }
}
