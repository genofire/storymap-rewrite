import { layers } from './layers.js'

export const scenesObject = {
  navigation: {
    lat: 53.09460389460539,
    lng: 8.771724700927736,
    zoom: 15,
    layers: [layers.data_route, layers.data_points],
    flyto: true,
    navigation: true,
    name: 'Navigation',
    audio: './data/audio/navigation.ogg'
  },
  ueberseetor: {
    lat: 53.09476,
    lng: 8.77068,
    zoom: 17,
    slider: false, // also chane changeOpacity: true in Layer
    layers: [layers.ueberseehafenbecken, layers.data_route, layers.data_points],
    flyto: true,
    navigateTo: true,
    name: 'Überseetor',
    audio: './data/audio/ueberseetor.ogg'
  },
  europahafen: {
    lat: 53.09412391687471,
    lng: 8.765995502471922,
    zoom: 17,
    slider: false,
    flyto: true,
    navigateTo: true,
    layers: [layers.data_route, layers.data_points],
    name: 'Europahafen',
    audio: './data/audio/europahafen.ogg'
  },
  weserkorrektion: {
    lat: 53.1127,
    lng: 8.7238,
    zoom: 14,
    slider: true,
    flyto: true,
    navigateTo: false,
    layers: [layers.esri_world, layers.weserkorrektion],
    name: 'Weserkorrektion'
  },
  bremerhaven: {
    lat: 53.5399,
    lng: 8.5017,
    zoom: 12,
    slider: true,
    flyto: true,
    navigateTo: false,
    layers: [layers.esri_world, layers.weserkorrektion],
    name: 'Bremerhaven'
  },
  speicher11: {
    lat: 53.096343366348854,
    lng: 8.7715744972229,
    zoom: 17,
    flyto: true,
    slider: false,
    navigateTo: true,
    layers: [layers.data_route, layers.data_points],
    name: 'Speicher XI',
    audio: './data/audio/speicher11.ogg'
  },
  fabrikenufer: {
    lat: 53.09818262016042,
    lng: 8.773621022701263,
    zoom: 17,
    flyto: true,
    navigateTo: true,
    layers: [layers.data_route, layers.data_points],
    name: 'Fabrikenufer',
    audio: './data/audio/fabrikenufer.ogg'
  },
  waller_wied: {
    lat: 53.09397573474871,
    lng: 8.774774372577667,
    zoom: 17,
    flyto: true,
    navigateTo: true,
    layers: [layers.data_route, layers.data_points],
    name: 'Waller Wied',
    audio: './data/audio/wallerwied.ogg'
  },
  industriehaefen: {
    lat: 53.1252,
    lng: 8.7305,
    zoom: 14,
    flyto: true,
    navigateTo: false,
    layers: [layers.data_route, layers.data_streets],
    name: 'Industriehäfen'
  },
  konsul_smidt_str: {
    lat: 53.09161441592877,
    lng: 8.772218227386475,
    zoom: 17,
    flyto: true,
    navigateTo: true,
    layers: [layers.data_route, layers.data_points],
    name: 'Konsul-Smidt-Straße',
    audio: './data/audio/konsulsmidtstr.ogg'
  }
}
