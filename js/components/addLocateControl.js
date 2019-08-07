import L from 'leaflet'
import { mapsPlaceholder } from './createMap.js'

export const locateControlWrapper = []

export function addLocateControl () {
  const map = mapsPlaceholder[0]
  var LocateControl = L.control.locate({
    position: 'bottomright',
    keepCurrentZoomLevel: true,
    returnToPrevBounds: false,
    drawCircle: true,
    showPopup: false
  }).addTo(map)
  locateControlWrapper.push(LocateControl)
  map.removeControl(LocateControl)
  map.addControl(LocateControl)
}
