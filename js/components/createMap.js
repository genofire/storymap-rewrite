import $ from 'jquery'
import L from 'leaflet'

export const mapsPlaceholder = []

export function createMap () {
  // http://leafletjs.com/reference-1.1.0.html#class-constructor-hooks
  L.Map.addInitHook(function () {
    mapsPlaceholder.push(this) // Use whatever global scope variable you like.
  })

  L.map($('.storymap-map')[0], {
    zoomControl: false,
    attributionControl: false
  }).setView([53.09460389460539, 8.771724700927736], 15)

  const map = mapsPlaceholder[0]

  return map
}
