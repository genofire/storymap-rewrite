import L from 'leaflet'
import { routeStyle, styleFeatures, pointToLayer, onEachPoint, onEachStreet } from './components/layerStyling.js'

export const layers = {
  carto_positron: {
    layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    })
  },
  esri_world: {
    layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })
  },
  data_route: {
    layer: L.geoJson.ajax('./data/route.geojson', {
      style: routeStyle
    })
  },
  data_points: {
    layer: L.geoJson.ajax('./data/points.geojson', {
      onEachFeature: onEachPoint,
      pointToLayer: pointToLayer
    })
  },
  data_streets: {
    layer: L.geoJson.ajax('./data/streets.geojson', {
      onEachFeature: onEachStreet,
      pointToLayer: pointToLayer
    })
  },
  weserkorrektion: {
    layer: L.tileLayer('./data/05_port_construction/Weserkorrektion_tiles/{z}/{x}/{y}.png', {
      attribution: '',
      tms: true,
      opacity: 0.1,
      changeOpacity: true
    })
  },
  ueberseehafenbecken: {
    layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ueberseehafenbecken.geojson', {
      style: styleFeatures
    })
  },
  data_ports_1882: {
    layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1882+4326.geojson', {
      style: styleFeatures
    })
  },
  data_ports_1884: {
    layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1884+4326.geojson', {
      style: styleFeatures
    })
  },
  data_ports_1914: {
    layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1914+4326.geojson', {
      style: styleFeatures
    })
  }
}
