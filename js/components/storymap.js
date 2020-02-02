import jQuery from 'jquery'
import L from 'leaflet'
import 'bootstrap'
import { layers } from '../layers.js'
import { scenesObject } from '../scenes.js'
import { getSection } from './getSection.js'
import { fillLoop, orderLoop, nextScene } from './theLoop.js'
import { addLocateControl, locateControlWrapper } from './addLocateControl.js'
import { pushToSectionWrapper } from './sectionWrapper.js'
import { playBing } from './playAudio.js'

export default function (options) {
  (function ($) {
    const defaults = {
      selector: '[data-scene]',
      triggerpos: '30%',
      locate: true,
      loader: true,
      flyto: false,
      slider: false,
      scalebar: false,
      dragging: true,
      mapinteraction: true,
      zoomControl: false
    }
    // Pass defaults and options into settings
    const settings = $.extend(defaults, options)

    if (typeof (L) === 'undefined') {
      throw new Error('Storymap requires Leaflet.')
    }

    const sceneKeys = Object.keys(scenesObject)
    const startSceneKey = sceneKeys[0]
    const sceneKeysAndNames = {}

    fillLoop(scenesObject)

    // Create simplified Object of Scene Keys and Scene Names
    $.each(scenesObject, function (key, value) {
      sceneKeysAndNames[key] = value.name
    })

    const makeStoryMap = function (element, scenesObject) {
      $(element).addClass('storymap')
      const searchfor = settings.selector
      const sections = $(element).find(searchfor)

      pushToSectionWrapper(sections)

      const map = settings.createMap()
      const currentLayerGroup = L.layerGroup().addTo(map)

      const OpacityControl = L.control.range({
        orient: 'horizontal',
        position: 'bottomright',
        value: 100,
        icon: true
      })

      if (settings.baselayer) {
        // add a base map, which can be either OSM, mapbox, tilelayer, wmslayer or those designed by yourself.
        settings.baselayer.layer.addTo(map)
      }

      if (settings.slider) {
        OpacityControl.addTo(map)
      }

      if (settings.scalebar) {
        L.control.scale({
          position: 'bottomright',
          metric: true,
          imperial: false
        }).addTo(map)
      }

      if (settings.zoomControl) {
        var ZoomControl = L.control.zoom({
          position: 'bottomright'
        }).addTo(map)
      }

      if (settings.locate) {
        addLocateControl()
      }

      if (settings.loader) {
        $('.storymap').append(
          "<div class='icon ion-md-refresh storymap-loader'></div>")
      }

      $('.storymap-map .leaflet-control-attribution')
        .addClass('storymap-attribution')

      if (settings.credits) {
        $('.storymap-attribution').html(settings.credits)
      }

      if (settings.dragging) {
        map.dragging.enable()
        if (map.tap) map.tap.enable()
        $('storymap-map').css('cursor', 'grab')
      } else {
        map.dragging.disable()
        if (map.tap) map.tap.disable()
        $('storymap-map').css('cursor', 'pointer')
      }

      if (settings.mapinteraction) {
        map.touchZoom.enable()
        map.doubleClickZoom.enable()
        map.scrollWheelZoom.enable()
        map.boxZoom.enable()
        map.keyboard.enable()
        if (map.tap) map.tap.enable()

        $('storymap-map').css('cursor', 'grab')
      } else {
        map.touchZoom.disable()
        map.doubleClickZoom.disable()
        map.scrollWheelZoom.disable()
        map.boxZoom.disable()
        map.keyboard.disable()
        if (map.tap) map.tap.disable()

        $('storymap-map').css('cursor', 'pointer')
      }

      $.each(layers, function (key, layer) {
        layer.layer.on('s')
        layer.layer.on('load', function () {
          $('.storymap-loader').fadeTo(1000, 0)
        })
      })

      function showMap (key) {
        currentLayerGroup.clearLayers()
        const scene = scenesObject[key]

        for (var i = 0; i < scene.layers.length; i++) {
          $('.storymap-loader').fadeTo(0, 1)
          currentLayerGroup.addLayer(scene.layers[i].layer)
        }
        $('.storymap-loader').fadeTo(1, 0)

        /* PER SCENE SETTINGS */

        if (scene.slider) {
          const LocateControl = locateControlWrapper[0]

          // Set Slider Value to 65%
          OpacityControl.options.value = 65

          // Add Opcaity Control underneath
          map.removeControl(LocateControl)
          map.removeControl(ZoomControl)
          map.addControl(OpacityControl)

          // Set Layer Opacity to 65%
          for (var value of Object.values(currentLayerGroup._layers)) {
            if (value.options.changeOpacity === true) {
              value.setOpacity(0.65)
            }
          }

          // Change Layer Opacity on Input
          OpacityControl.on('input change', function (e) {
            for (var value of Object.values(currentLayerGroup._layers)) {
              if (value.options.changeOpacity === true) {
                value.setOpacity(e.value / 100)
              }
            }
          })

          map.addControl(ZoomControl)
          map.addControl(LocateControl)
        } else {
          map.removeControl(OpacityControl)
        }

        if (scene.flyto === false) {
          map.setView([scene.lat, scene.lng], scene.zoom, {
            animate: false,
            easeLinearity: 0.2,
            duration: 4 // in seconds
          })
        } else if (settings.flyto) {
          map.flyTo([scene.lat, scene.lng], scene.zoom, {
            animate: true,
            easeLinearity: 0.2,
            duration: 2 // in seconds
          })
        } else {
          map.setView([scene.lat, scene.lng], scene.zoom, {
            animate: false,
            easeLinearity: 0.2,
            duration: 4 // in seconds
          })
        }

        getMapCredits(scene, layers, settings)

        function getMapCredits (scene, layers, settings) {
          // Add Custom Attribution to bottomright
          $($('div.leaflet-bottom.leaflet-right')[0])
            .append($('<div>', {
              class: 'leaflet-control-attribution leaflet-control'
            }))

          const attribution = $('.leaflet-control-attribution')

          if (settings.credits) {
            $(attribution[0]).html(settings.credits + ' | ' + layers.carto_positron
              .layer.options.attribution)
          } else {
            $(attribution[0]).html(layers.carto_positron.layer.options.attribution)
          }

          for (let layer = 0; layer < scene.layers.length; layer++) {
            if (scene.layers[layer].layer.options.attribution) {
              $(attribution[0]).append(' | ' + scene.layers[layer].layer.options
                .attribution)
            }
          }
        }

        map.invalidateSize()
      }

      /**************************/
      /*     Event Handlers     */
      /**************************/

      sections.on('viewing', function () {
        const sceneKey = $(this).data('scene')
        updateSidebar(sceneKey)
        const sceneObject = scenesObject[sceneKey]
        $('a[class^="title section-heading"]').children().html(
          sceneObject.name)
        playBing(sceneObject)

        $(this)
          .removeClass('hide')
          .addClass('visible')
          .addClass('viewing')
          .addClass('show')

        // Pushes sceneKey to History API
        window.history.replaceState(
          {},
          null,
          window.location.origin + '/#' + sceneKey
        )

        showMap(sceneKey)
      })
      sections.on('notviewing', function () {
        $(this)
          .removeClass('viewing')
          .removeClass('show')
          .removeClass('visible')
          .addClass('hide')
      })

      // History API
      $(window).on('hashchange', function (e) {
        const sceneKey = window.location.hash.substr(1)
        backInHistory(sceneKey)
      })

      $('#nextArrow').click(function () {
        const currentSceneKey = window.location.hash.substr(1)
        // console.log(currentSceneKey)
        const targetSceneKey = nextScene(currentSceneKey)
        getSection(sections, targetSceneKey)
      })

      function backInHistory (sceneKey) {
        orderLoop(sceneKey)
        const targetScene = sceneKey
        getSection(sections, targetScene)
      }

      $.each(sections, function (key, section) {
        const sectionContent = $(section).find('.section-content')
        const sceneKey = section.dataset.scene

        if (sectionContent.length !== 0) {
          fetch('./data/content/dist/' + sceneKey + '.html')
            .then(response => response.text())
            .then(content => {
              $(sectionContent[0]).html(content)
            })
        };
      })

      function buildSidebar (startSceneKey, sceneKeysAndNames) {
        // Generate List
        const ul = $('#sidebarItems')
        const length = Object.keys(sceneKeysAndNames).length
        let count = 0
        $.each(sceneKeysAndNames, function (key, value) {
          const li = $('<li></li>')
          ul.append(li)
          if (count === 0) {
            li.html("<a href='#" + key + "' data-target='" + key +
              "'><i class='ion-sidebar-icon icon ion-md-home'></i><span class='spacer'></span>" +
              value + '</a>')
          } else if (count === length - 1) {
            li.html("<a href='#" + key + "' data-target='" + key +
              "'><i class='fa-sidebar-icon fas fa-flag-checkered'></i><span class='spacer'></span>" +
              value + '</a>')
          } else {
            if (scenesObject[key].navigateTo === false) {
              li.html("<a href='#" + key + "' data-target='" + key +
                "'><i class='ion-sidebar-icon icon ion-md-return-right'></i></i><span class='spacer'></span>" +
                value + '</a>')
              li.wrap('<ul class="sidebarSub"></ul>')
            } else {
              li.html("<a href='#" + key + "' data-target='" + key +
                "'><i class='fa-sidebar-icon fas fa-circle'><i class='icon-number'>" +
                count + "</i></i><span class='spacer'></span>" +
                value + '</a>')
            }
          }

          if (key === startSceneKey) {
            $(li).find('i').addClass('active-icon')
            $(li).find('a').addClass('active')
            $(li).find('i').removeClass('inactive-icon')
          } else {
            $(li).find('i').removeClass('active-icon')
            $(li).find('a').removeClass('active')
            $(li).find('i').addClass('inactive-icon')
          }
          count = count + 1
        })

        // Activate Links
        const sidebarItems = document.getElementById('sidebarItems').getElementsByTagName(
          'a')
        $.each(sidebarItems, function (key, value) {
          const targetSceneKey = value.dataset.target

          $(value).click(function () {
            orderLoop(targetSceneKey)
            getSection(sections, targetSceneKey)

            $('#sidebar').toggleClass('active')
            $('#sidebar').toggleClass('shadow')
            $('.overlay').removeClass('active')
          })
        })
      }

      function updateSidebar (sceneKey) {
        const list = document.getElementById('sidebarItems').getElementsByTagName(
          'a')

        $.each(list, function (key, value) {
          if (sceneKey === value.dataset.target) {
            $(value).find('i').addClass('active-icon')
            $(value).addClass('active')
            $(value).find('i').removeClass('inactive-icon')
          } else {
            $(value).find('i').removeClass('active-icon')
            $(value).removeClass('active')
            $(value).find('i').addClass('inactive-icon')
          }
        })
      }

      buildSidebar(startSceneKey, sceneKeysAndNames)
      getSection(sections, startSceneKey)
    }

    makeStoryMap('#storymap', scenesObject)

    return this
  }(jQuery))
}
