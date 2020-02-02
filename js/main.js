import $ from 'jquery'
import L from 'leaflet'
import 'leaflet-range'
import 'leaflet.locatecontrol'
// import 'leaflet-labeled-circle' // still needs to be added to libs
import 'leaflet.ajax'
import 'leaflet.pattern'
import 'bootstrap'
import storymap from './components/storymap.js'
import { layers } from './layers.js'
import { scenesObject } from './scenes.js'
import { createMap } from './components/createMap.js'

// jQuery Binding
window.$ = $

// Storymap Binding
$.fn.storymap = storymap

// Execute storymap(options) on specified ID
$('#storymap').storymap({
  scenes: scenesObject,
  baselayer: layers.carto_positron,
  loader: false,
  flyto: true,
  slider: false,
  dragging: true,
  credits: "<a href='https://github.com/janebuoy/storymap-rewrite'><i class='icon ion-md-build' style='font-size: 10px;'></i> by Jane Buoy | </a><a href='https://github.com/jakobzhao/storymap'>based on <img src='https://jakobzhao.github.io/storymap/img/logo.png' width='18px' target='_blank' > storymap.js </a>",
  scalebar: false,
  scrolldown: false,
  zoomControl: true,
  createMap: createMap
})

// Sidemenu Toggle
$('#dismiss, .overlay').click(function () {
  // hide sidebar
  $('#sidebar').removeClass('shadow')
  $('#sidebar').removeClass('active')
  $('.overlay').removeClass('active')
})

$('#sidebarCollapse').click(function () {
  $('#sidebar').toggleClass('shadow')
  $('#sidebar').toggleClass('active')
  $('.overlay').addClass('active')
})
