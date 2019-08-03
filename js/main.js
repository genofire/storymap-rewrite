import $ from 'jquery'
import L from 'leaflet'
import 'leaflet-range'
import 'leaflet.locatecontrol'
import 'leaflet.ajax'
import 'leaflet.pattern'
import 'bootstrap'
import storymap from './components/storymap-rewrite.js'
import { layers } from './layers.js'
import { scenes } from './scenes.js'

// jQuery Binding
window.$ = $

// Storymap Binding
$.fn.storymap = storymap

// Audio Playback
const audio = $('#audioFile')[0]
let timer
let percent = 0

// Execute storymap(options) on specified ID
$('#storymap').storymap({
  scenes: scenes,
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

function createMap () {
  const map = L.map($('.storymap-map')[0], {
    zoomControl: false,
    attributionControl: false
  }).setView([53.09460389460539, 8.771724700927736], 15)

  return map
}

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

// Audio control
$('#playAudio').click(function (e) {
  $(this).find('.icon').toggleClass('ion-md-play ion-md-pause')

  e = e || window.event
  // const btn = e.target
  if (!audio.paused) {
    audio.pause()
    // isPlaying = false
  } else {
    audio.play()
    // isPlaying = true
  }
})

$(audio).on('playing', function (_event) {
  var duration = _event.target.duration
  advance(duration, audio)
})

$(audio).on('pause', function (_event) {
  clearTimeout(timer)
})

function advance (duration, element) {
  const progress = $('#audioProgress')[0]
  const increment = 10 / duration
  percent = Math.min(increment * element.currentTime * 10, 100)
  progress.style.width = percent + '%'
  startTimer(duration, element)
}

function startTimer (duration, element) {
  if (percent < 100) {
    timer = setTimeout(function () {
      advance(duration, element)
    }, 100)
  }
}
