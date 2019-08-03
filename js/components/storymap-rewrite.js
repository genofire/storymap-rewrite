import jQuery from 'jquery'
import L from 'leaflet'
import { layers } from '../layers.js'
import { scenes } from '../scenes.js'
import './getSection.js'

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

    var sceneKeys = Object.keys(scenes)
    var sceneNames = {}

    for (var [key, scene] of Object.entries(scenes)) {
      if (scene.navigateTo && key !== 'ueberseetor') {
        loop.push('navigation')
      }
      loop.push(key)
    }

    for (let i = 0; i < sceneKeys.length; i++) {
      var sceneKey = sceneKeys[i]
      var sceneName = scenes[sceneKeys[i]].name
      sceneNames[sceneKey] = sceneName
    }

    const makeStoryMap = function (element, scenes) {
      $(element).addClass('storymap')

      const searchfor = settings.selector
      const sections = $(element).find(searchfor)
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
        var LocateControl = L.control.locate({
          position: 'bottomright',
          keepCurrentZoomLevel: true,
          returnToPrevBounds: false,
          drawCircle: true,
          showPopup: false
        }).addTo(map)
        map.removeControl(LocateControl)
        map.addControl(LocateControl)
      }

      if (settings.loader) {
        $('.storymap').append("<div class='icon ion-md-refresh storymap-loader'></div>")
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

        var scene = scenes[key]

        for (var i = 0; i < scene.layers.length; i++) {
          $('.storymap-loader').fadeTo(0, 1)
          currentLayerGroup.addLayer(scene.layers[i].layer)
        }
        $('.storymap-loader').fadeTo(1, 0)

        /* PER SCENE SETTINGS */

        if (scene.slider) {
          map.removeControl(LocateControl)
          map.addControl(OpacityControl)
          map.removeControl(ZoomControl)

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

        function buildSections (element, searchfor) {
          function loadContent (sections) {
            $.each(sections, function (key, element) {
              const section = $(element)
              const sectionContent = $(section).find('.section-content')
              const sceneName = section[0].dataset.scene

              if (sectionContent.length !== 0) {
                fetch('./data/content/dist/' + sceneName + '.html')
                  .then(response => response.text())
                  .then(content => {
                    $(sectionContent[0]).html(content)
                  })
              };
            })
          }
          loadContent(sections)
          getSection(sections, 'navigation')
        }

        buildSections(element, searchfor)

        getMapCredits(scene, layers, settings)

        function getMapCredits (scene, layers, settings) {
          // Add Custom Attribution to bottomright
          $($('div.leaflet-bottom.leaflet-right')[0])
            .append($('<div>', {
              class: 'leaflet-control-attribution leaflet-control'
            }))

          const attribution = $('.leaflet-control-attribution')

          if (settings.credits) {
            $(attribution[0]).html(settings.credits + ' | ' + layers.carto_positron.layer.options.attribution)
          } else {
            $(attribution[0]).html(layers.carto_positron.layer.options.attribution)
          }

          for (layer = 0; layer < scene.layers.length; layer++) {
            if (scene.layers[layer].layer.options.attribution) {
              $(attribution[0]).append(' | ' + scene.layers[layer].layer.options.attribution)
            }
          }
        }

        map.invalidateSize()
      }

      /**************************/
      /*     Event Handlers     */
      /**************************/

      sections.on('viewing', function () {
        key = $(this).data('scene')
        updateSidebar(key, sceneKeys)
        const scene = scenes[key]
        $('a[class^="title section-heading"]').children().html(scene.name)

        $(this)
          .removeClass('hide')
          .addClass('visible')
          .addClass('viewing')
          .addClass('show')

        // Pushes Scene Name to History API
        window.history.pushState({},
          key,
          window.location.origin + '/#' + key
        )

        // History API
        $(window).on('hashchange', function (e) {
          backInHistory()
        })

        function backInHistory () {
          const key = window.location.hash.substr(1)

          const scenesBefore = loop.slice(0, loop.indexOf(key))
          const scenesAfter = loop.slice(loop.indexOf(key), loop.length)

          loop = scenesAfter.concat(scenesBefore)

          const targetScene = key
          getSection(sections, targetScene)
        }

        showMap(key)
      })

      sections.on('notviewing', function () {
        $(this)
          .removeClass('viewing')
          .removeClass('show')
          .removeClass('visible')
          .addClass('hide')
      })

      // Switch Scenes on Left and Right Arrow click
      $('#nextArrow').click(function () {
        function showNext (key) {
          function nextItem (key) {
            loop.push(key)
            loop.shift()
            return loop[0]
          }

          const targetScene = nextItem(key)

          getSection(sections, targetScene)
        }
        showNext(key)
      })

      $('#prevArrow').click(function () {
        function showPrevious () {
          function prevItem () {
            loop.unshift(loop[loop.length - 1])
            loop.pop()
            return loop[0]
          }
          const targetScene = prevItem()
          getSection(sections, targetScene)
        }
        showPrevious()
      })

      function buildSidebar (key, sceneNames, sceneKeys) {
        const current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length]
        generateList(key, sceneNames, sceneKeys, current)
        const list = document.getElementById('sidebarItems').getElementsByTagName('a')
        activateList(list, key)
      }

      function generateList (key, sceneNames, sceneKeys, current) {
        const ul = $('#sidebarItems')
        const length = Object.keys(sceneNames).length
        let count = 0
        $.each(sceneNames, function (key, value) {
          const li = $('<li></li>')
          ul.append(li)
          if (count === 0) {
            li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-home'></i><span class='spacer'></span>" + value + '</a>')
          } else if (count === length - 1) {
            li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-flag-checkered'></i><span class='spacer'></span>" + value + '</a>')
          } else {
            if (scenes[key].navigateTo === false) {
              li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-return-right'></i></i><span class='spacer'></span>" + value + '</a>')
              li.wrap('<ul class="sidebarSub"></ul>')
            } else {
              li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-circle'><i class='icon-number'>" + count + "</i></i><span class='spacer'></span>" + value + '</a>')
            }
          }

          if (key === current) {
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
      }

      function activateList (list, key) {
        $.each(list, function (key, value) {
          const sceneName = value.dataset.target

          $(value).click(function () {
            const scenesBefore = loop.slice(0, loop.indexOf(sceneName))
            const scenesAfter = loop.slice(loop.indexOf(sceneName), loop.length)

            loop = scenesAfter.concat(scenesBefore)

            const targetScene = sceneName
            getSection(sections, targetScene)

            $('#sidebar').toggleClass('active')
            $('#sidebar').toggleClass('shadow')
            $('.overlay').removeClass('active')
          })
        })
      }

      function updateSidebar (key, sceneKeys) {
        const current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length]
        const list = document.getElementById('sidebarItems').getElementsByTagName('a')

        $.each(list, function (key, value) {
          if (current === value.dataset.target) {
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

      buildSidebar(key, sceneNames, sceneKeys)
    }

    makeStoryMap(this, scenes)

    return this
  }(jQuery))
}

// (function ($) {
//   $.fn.storymap = function (options) {
//
//   }
// }(jQuery))
