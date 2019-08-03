import L from 'leaflet'
import './components/enterBounds.js'
import storymap from './components/storymap-rewrite.js'
import './components/getSection.js'

export const circleColors = {
  puce: '#C77F99',
  red: '#C77F99',
  blue: '#75b7e3',
  green: '#a1c58a'
}

export const routeStyle = {
  color: '#706d93', // $rhythm
  weight: 3,
  opacity: 0.7,
  lineCap: 'round',
  dashArray: '0.7 6'
}

export function styleFeatures (feature) {
  const eastside = '#ad7fc7'

  const eastsideStripes = new L.StripePattern({
    color: eastside,
    opacity: 1,
    angle: -10
  }).addTo(map)

  return {
    color: '#878d8e',
    fillPattern: eastsideStripes,
    fillOpacity: 0.8,
    weight: 1,
    smoothFactor: 1
  }
}

export function pointToLayer (feature, latlng) {
  const style = []
  for (var [key, value] of Object.entries(circleColors)) {
    style[key] = {
      radius: 16,
      fillColor: value,
      color: '#878d8e',
      fillOpacity: 0.5,
      opacity: 1,
      weight: 1
    }
    if (feature.meta.color === key) {
      return L.circleMarker(latlng, style[key])
    }
  }
}

export function onEachPoint (feature, layer) {
  const point = feature.geometry.coordinates
  const bounds = L.latLng(point.reverse()).toBounds(150)

  setInterval(function () {
    // Check if L.Control.Locate is activated
    enterBounds(bounds, feature, point)
  }, 10000)

  if (feature.properties && feature.properties.name) {
    layer.bindPopup(feature.properties.name)
    layer.on({
      mouseover: function () {
        this.openPopup()
      },
      // mouseout: function() {
      //     this.closePopup();
      // },
      click: onItemClick
    })
  };
}

function onItemClick (item) {
  map.setView(item.latlng, 16)
  const sceneName = item.target.feature.properties.scene

  const scenesBefore = loop.slice(0, loop.indexOf(sceneName))
  const scenesAfter = loop.slice(loop.indexOf(sceneName), loop.length)

  loop = scenesAfter.concat(scenesBefore)

  const targetScene = sceneName
  getSection(sections, targetScene)
}

export function onEachStreet (feature, layer) {
  if (feature.properties && feature.properties.name) {
    layer.bindPopup(feature.properties.name)
    layer.on({
      mouseover: function () {
        this.openPopup()
      }
    })
  };
}
