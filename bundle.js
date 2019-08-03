'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var $$1 = _interopDefault(require('jquery'));
var L = _interopDefault(require('leaflet'));
require('leaflet.locatecontrol');
require('leaflet.ajax');
require('leaflet.pattern');
require('bootstrap');

L.Control.Range = L.Control.extend({
  options: {
    position: 'topright',
    min: 0,
    max: 100,
    value: 0,
    step: 1,
    orient: 'vertical',
    iconClass: 'leaflet-range-icon',
    icon: true
  },

  onAdd: function (map) {
    var slider = $(this);
    for (var [key, value] of Object.entries(map._layers)) {
      if (value.options.changeOpacity == true && value.options.opacity != undefined) {
        slider[0].options.value = (value.options.opacity * 100);
      }
    }

    var container = L.DomUtil.create('div', 'leaflet-range-control leaflet-bar ' + this.options.orient);
    if (this.options.icon) {
      var span = L.DomUtil.create('span', this.options.iconClass, container);
      // $(span).html("<i class='icon ion-md-eye'>");
    }    var slider = L.DomUtil.create('input', '', container);
    slider.type = 'range';
    slider.setAttribute('orient', this.options.orient);
    slider.min = this.options.min;
    slider.max = this.options.max;
    slider.step = this.options.step;
    slider.value = this.options.value;

    L.DomEvent.on(slider, 'mousedown mouseup click touchstart', L.DomEvent.stopPropagation);

    /* IE11 seems to process events in the wrong order, so the only way to prevent map movement while dragging the
         * slider is to disable map dragging when the cursor enters the slider (by the time the mousedown event fires
         * it's too late becuase the event seems to go to the map first, which results in any subsequent motion
         * resulting in map movement even after map.dragging.disable() is called.
         */
    L.DomEvent.on(slider, 'mouseenter', function (e) {
      map.dragging.disable();
    });
    L.DomEvent.on(slider, 'mouseleave', function (e) {
      map.dragging.enable();
    });

    L.DomEvent.on(slider, 'change', function (e) {
      this.fire('change', { value: e.target.value });
    }.bind(this));

    L.DomEvent.on(slider, 'input', function (e) {
      this.fire('input', { value: e.target.value });
    }.bind(this));

    this._slider = slider;
    this._container = container;

    return this._container
  },

  setValue: function (value) {
    this.options.value = value;
    this._slider.value = value;
  }

});

L.Control.Range.include(L.Evented.prototype);

L.control.range = function (options) {
  return new L.Control.Range(options)
};

function storymap (options) {
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
    };
    // Pass defaults and options into settings
    const settings = $.extend(defaults, options);

    if (typeof (L) === 'undefined') {
      throw new Error('Storymap requires Leaflet.')
    }

    var sceneKeys = Object.keys(scenes);
    var sceneNames = {};

    for (var [key, scene] of Object.entries(scenes)) {
      if (scene.navigateTo && key !== 'ueberseetor') {
        loop.push('navigation');
      }
      loop.push(key);
    }

    for (let i = 0; i < sceneKeys.length; i++) {
      var sceneKey = sceneKeys[i];
      var sceneName = scenes[sceneKeys[i]].name;
      sceneNames[sceneKey] = sceneName;
    }

    const makeStoryMap = function (element, scenes) {
      $(element).addClass('storymap');

      const searchfor = settings.selector;
      sections = $(element).find(searchfor);
      const map = settings.createMap();
      const currentLayerGroup = L.layerGroup().addTo(map);

      const OpacityControl = L.control.range({
        orient: 'horizontal',
        position: 'bottomright',
        value: 100,
        icon: true
      });

      if (settings.baselayer) {
        // add a base map, which can be either OSM, mapbox, tilelayer, wmslayer or those designed by yourself.
        settings.baselayer.layer.addTo(map);
      }

      if (settings.slider) {
        OpacityControl.addTo(map);
      }

      if (settings.scalebar) {
        const Scale = L.control.scale({
          position: 'bottomright',
          metric: true,
          imperial: false
        }).addTo(map);
      }

      if (settings.zoomControl) {
        var ZoomControl = L.control.zoom({
          position: 'bottomright'
        }).addTo(map);
      }

      if (settings.locate) {
        LocateControl = L.control.locate({
          position: 'bottomright',
          keepCurrentZoomLevel: true,
          returnToPrevBounds: false,
          drawCircle: true,
          showPopup: false
        }).addTo(map);
        map.removeControl(LocateControl);
        map.addControl(LocateControl);
      }

      if (settings.loader) {
        $('.storymap').append("<div class='icon ion-md-refresh storymap-loader'></div>");
      }

      $('.storymap-map .leaflet-control-attribution')
        .addClass('storymap-attribution');

      if (settings.credits) {
        $('.storymap-attribution').html(settings.credits);
      }

      if (settings.dragging) {
        map.dragging.enable();
        if (map.tap) map.tap.enable();
        $('storymap-map').css('cursor', 'grab');

      } else {
        map.dragging.disable();
        if (map.tap) map.tap.disable();
        $('storymap-map').css('cursor', 'pointer');
      }

      if (settings.mapinteraction) {
        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (map.tap) map.tap.enable();

        $('storymap-map').css('cursor', 'grab');
      } else {
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (map.tap) map.tap.disable();

        $('storymap-map').css('cursor', 'pointer');
      }

      // if (!String.prototype.includes) {
      //   String.prototype.includes = function() {
      //     'use strict';
      //     return String.prototype.indexOf.apply(this, arguments) !== -1;
      //   };
      // }

      $.each(layers, function (key, layer) {
        layer.layer.on('s');
        layer.layer.on('load', function () {
          $('.storymap-loader').fadeTo(1000, 0);
        });
      });

      function showMap (key) {
        currentLayerGroup.clearLayers();

        var scene = scenes[key];

        for (var i = 0; i < scene.layers.length; i++) {
          $('.storymap-loader').fadeTo(0, 1);
          currentLayerGroup.addLayer(scene.layers[i].layer);
        }
        $('.storymap-loader').fadeTo(1, 0);

        /* PER SCENE SETTINGS */

        if (scene.slider) {
          map.removeControl(LocateControl);
          map.addControl(OpacityControl);
          map.removeControl(ZoomControl);

          OpacityControl.on('input change', function (e) {
            for (var value of Object.values(currentLayerGroup._layers)) {
              if (value.options.changeOpacity === true) {
                value.setOpacity(e.value / 100);
              }
            }
          });

          map.addControl(ZoomControl);
          map.addControl(LocateControl);
        } else {
          map.removeControl(OpacityControl);
        }

        if (scene.flyto === false) {
          map.setView([scene.lat, scene.lng], scene.zoom, {
            animate: false,
            easeLinearity: 0.2,
            duration: 4 // in seconds
          });
        } else if (settings.flyto) {
          map.flyTo([scene.lat, scene.lng], scene.zoom, {
            animate: true,
            easeLinearity: 0.2,
            duration: 2 // in seconds
          });
        } else {
          map.setView([scene.lat, scene.lng], scene.zoom, {
            animate: false,
            easeLinearity: 0.2,
            duration: 4 // in seconds
          });
        }

        getMapCredits(scene, layers, settings);

        function getMapCredits(scene, layers, settings) {
          // Add Custom Attribution to bottomright
          $($('div.leaflet-bottom.leaflet-right')[0])
            .append($('<div>', {
              class: 'leaflet-control-attribution leaflet-control'
            }));

          const attribution = $('.leaflet-control-attribution');

          if (settings.credits) {
            $(attribution[0]).html(settings.credits + ' | ' + layers.carto_positron.layer.options.attribution);
          } else {
            $(attribution[0]).html(layers.carto_positron.layer.options.attribution);
          }

          for (layer = 0; layer < scene.layers.length; layer++) {
            if (scene.layers[layer].layer.options.attribution) {
              $(attribution[0]).append(' | ' + scene.layers[layer].layer.options.attribution);
            }
          }
        }

        map.invalidateSize();
      }

      /**************************/
      /*     Event Handlers     */
      /**************************/

      sections.on('viewing', function () {
        key = $(this).data('scene');
        updateSidebar(key, sceneKeys);
        const scene = scenes[key];
        $('a[class^="title section-heading"]').children().html(scene.name);

        $(this)
          .removeClass('hide')
          .addClass('visible')
          .addClass('viewing')
          .addClass('show');

        // Pushes Scene Name to History API
        window.history.pushState({},
          key,
          window.location.origin + '/#' + key
        );

        showMap(key);
      });

      sections.on('notviewing', function () {
        $(this)
          .removeClass('viewing')
          .removeClass('show')
          .removeClass('visible')
          .addClass('hide');
      });


      // Switch Scenes on Left and Right Arrow click
      $('#nextArrow').click(function () {
        function showNext (key) {
          function nextItem (key) {
            loop.push(key);
            loop.shift();
            return loop[0]
          }

          targetScene = nextItem(key);

          getSection(sections);
          toggleArrow(key);
        }
        showNext(key);
      });

      $('#prevArrow').click(function () {
        function showPrevious () {
          function prevItem () {
            loop.unshift(loop[loop.length - 1]);
            loop.pop();
            return loop[0]
          }
          targetScene = prevItem();
          getSection(sections);
        }
        showPrevious();
      });

      function buildSections(element, searchfor) {
        function loadContent (sections) {
          $.each(sections, function (key, element) {
            const section = $(element);
            const sectionContent = $(section).find('.section-content');
            const sceneName = section[0].dataset.scene;

            if (sectionContent.length !== 0) {
              fetch('./data/content/dist/' + sceneName + '.html')
                .then(response => response.text())
                .then(content => {
                  $(sectionContent[0]).html(content);
                });
            }          });
        }
        loadContent(sections);
        sections = $(element).find(searchfor);
        getSection(sections);
      }

      function getSection (sections) {
        $.each(sections, function (key, element) {
          const section = $(element);
          // Keep for Development
          // const sectionContent = $(element).children('.section-content')
          if (section[0].dataset.scene !== targetScene) {
            section.trigger('notviewing');
          } else {
            section.trigger('viewing');
            // Hide prevArrow
            toggleArrow(key);
          }        });
      }

      // Can be removed after Development, just there for backwards navigation testing
      // function toggleArrow (key) {
      //   if (first) {
      //     $('#prevArrow').prop('disabled', true)
      //     first = false
      //   } else {
      //     $('#prevArrow').prop('disabled', false)
      //   }
      // }

      buildSections(element, searchfor);

      function buildSidebar (key, sceneNames, sceneKeys) {
        const current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length];
        generateList(key, sceneNames, sceneKeys, current);
        const list = document.getElementById('sidebarItems').getElementsByTagName('a');
        activateList(list);
      }

      function generateList (key, sceneNames, sceneKeys, current) {
        const ul = $('#sidebarItems');
        const length = Object.keys(sceneNames).length;
        let count = 0;
        $.each(sceneNames, function (key, value) {
          const li = $('<li></li>');
          ul.append(li);
          if (count === 0) {
            li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-home'></i><span class='spacer'></span>" + value + '</a>');
          } else if (count === length - 1) {
            li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-flag-checkered'></i><span class='spacer'></span>" + value + '</a>');
          } else {
            if (scenes[key].navigateTo === false) {
              li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-return-right'></i></i><span class='spacer'></span>" + value + '</a>');
              li.wrap('<ul class="sidebarSub"></ul>');
            } else {
              li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-circle'><i class='icon-number'>" + count + "</i></i><span class='spacer'></span>" + value + '</a>');
            }
          }

          if (key === current) {
            $(li).find('i').addClass('active-icon');
            $(li).find('a').addClass('active');
            $(li).find('i').removeClass('inactive-icon');
          } else {
            $(li).find('i').removeClass('active-icon');
            $(li).find('a').removeClass('active');
            $(li).find('i').addClass('inactive-icon');
          }
          count = count + 1;
        });
      }

      function activateList (list, key) {
        $.each(list, function (key, value) {
          const sceneName = value.dataset.target;

          $(value).click(function () {
            const scenesBefore = loop.slice(0, loop.indexOf(sceneName));
            const scenesAfter = loop.slice(loop.indexOf(sceneName), loop.length);

            loop = scenesAfter.concat(scenesBefore);

            targetScene = sceneName;
            getSection(sections);

            $('#sidebar').toggleClass('active');
            $('#sidebar').toggleClass('shadow');
            $('.overlay').removeClass('active');
          });
        });
      }

      function updateSidebar (key, sceneKeys) {
        const current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length];
        const list = document.getElementById('sidebarItems').getElementsByTagName('a');

        $.each(list, function (key, value) {
          if (current === value.dataset.target) {
            $(value).find('i').addClass('active-icon');
            $(value).addClass('active');
            $(value).find('i').removeClass('inactive-icon');
          } else {
            $(value).find('i').removeClass('active-icon');
            $(value).removeClass('active');
            $(value).find('i').addClass('inactive-icon');
          }
        });
      }

      buildSidebar(key, sceneNames, sceneKeys);
    };

    makeStoryMap(this, scenes);

    return this
  }($$1));
}

// (function ($) {
//   $.fn.storymap = function (options) {
//
//   }
// }(jQuery))

// jQuery Binding
window.$ = $$1;

// Storymap Binding
$$1.fn.storymap = storymap;

// Leaflet
let LocateControl$1;
let map;

// Audio Playback
const audio = $$1('#audioFile')[0];
let timer;
let percent = 0;

// Used for Navigation
let loop$1 = [];
let sections$1;

// Layer Styling
const circleColors = {
  puce: '#C77F99',
  red: '#C77F99',
  blue: '#75b7e3',
  green: '#a1c58a'
};
const routeStyle = {
  color: '#706d93', // $rhythm
  weight: 3,
  opacity: 0.7,
  lineCap: 'round',
  dashArray: '0.7 6'
};

// Setup leaflet layers
const layers$1 = {
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
};

const scenes = {
  navigation: {
    lat: 53.09460389460539,
    lng: 8.771724700927736,
    zoom: 15,
    layers: [layers$1.data_route, layers$1.data_points],
    flyto: true,
    navigation: true,
    name: 'Navigation'
  },
  ueberseetor: {
    lat: 53.09476,
    lng: 8.77068,
    zoom: 17,
    slider: false, // also chane changeOpacity: true in Layer
    layers: [layers$1.ueberseehafenbecken, layers$1.data_route, layers$1.data_points],
    flyto: true,
    navigateTo: true,
    name: 'Überseetor'
  },
  europahafen: {
    lat: 53.09412391687471,
    lng: 8.765995502471922,
    zoom: 17,
    slider: false,
    flyto: true,
    navigateTo: true,
    layers: [layers$1.data_route, layers$1.data_points],
    name: 'Europahafen'
  },
  weserkorrektion: {
    lat: 53.1127,
    lng: 8.7238,
    zoom: 14,
    slider: true,
    flyto: true,
    navigateTo: false,
    layers: [layers$1.esri_world, layers$1.weserkorrektion],
    name: 'Weserkorrektion'
  },
  bremerhaven: {
    lat: 53.5399,
    lng: 8.5017,
    zoom: 12,
    slider: true,
    flyto: true,
    navigateTo: false,
    layers: [layers$1.esri_world, layers$1.weserkorrektion],
    name: 'Bremerhaven'
  },
  speicher11: {
    lat: 53.096343366348854,
    lng: 8.7715744972229,
    zoom: 17,
    flyto: true,
    slider: false,
    navigateTo: true,
    layers: [layers$1.data_route, layers$1.data_points],
    name: 'Speicher XI'
  },
  fabrikenufer: {
    lat: 53.09818262016042,
    lng: 8.773621022701263,
    zoom: 17,
    flyto: true,
    navigateTo: true,
    layers: [layers$1.data_route, layers$1.data_points],
    name: 'Fabrikenufer'
  },
  waller_wied: {
    lat: 53.09397573474871,
    lng: 8.774774372577667,
    zoom: 17,
    flyto: true,
    navigateTo: true,
    layers: [layers$1.data_route, layers$1.data_points],
    name: 'Waller Wied'
  },
  industriehaefen: {
    lat: 53.1252,
    lng: 8.7305,
    zoom: 14,
    flyto: true,
    navigateTo: false,
    layers: [layers$1.data_route, layers$1.data_streets],
    name: 'Industriehäfen'
  },
  konsul_smidt_str: {
    lat: 53.09161441592877,
    lng: 8.772218227386475,
    zoom: 17,
    flyto: true,
    navigateTo: true,
    layers: [layers$1.data_route, layers$1.data_points],
    name: 'Konsul-Smidt-Straße'
  }
};

// Execute storymap(options) on specified ID
$$1('#storymap').storymap({
  scenes: scenes,
  baselayer: layers$1.carto_positron,
  loader: false,
  flyto: true,
  slider: false,
  dragging: true,
  credits: "<a href='https://github.com/janebuoy/storymap-rewrite'><i class='icon ion-md-build' style='font-size: 10px;'></i> by Jane Buoy | </a><a href='https://github.com/jakobzhao/storymap'>based on <img src='https://jakobzhao.github.io/storymap/img/logo.png' width='18px' target='_blank' > storymap.js </a>",
  scalebar: false,
  scrolldown: false,
  zoomControl: true,
  createMap: createMap
});

function createMap () {
  map = L.map($$1('.storymap-map')[0], {
    zoomControl: false,
    attributionControl: false
  }).setView([53.09460389460539, 8.771724700927736], 15);

  return map
}

function styleFeatures (feature) {
  const eastside = '#ad7fc7';

  const eastsideStripes = new L.StripePattern({
    color: eastside,
    opacity: 1,
    angle: -10
  }).addTo(map);

  return {
    color: '#878d8e',
    fillPattern: eastsideStripes,
    fillOpacity: 0.8,
    weight: 1,
    smoothFactor: 1
  }
}

function pointToLayer (feature, latlng) {
  const style = [];
  for (var [key, value] of Object.entries(circleColors)) {
    style[key] = {
      radius: 16,
      fillColor: value,
      color: '#878d8e',
      fillOpacity: 0.5,
      opacity: 1,
      weight: 1
    };
    if (feature.meta.color === key) {
      return L.circleMarker(latlng, style[key])
    }
  }
}

function onEachPoint (feature, layer) {
  const point = feature.geometry.coordinates;
  const bounds = L.latLng(point.reverse()).toBounds(150);

  setInterval(function () {
    // Check if L.Control.Locate is activated
    if (LocateControl$1._active) ;
  }, 10000);

  if (feature.properties && feature.properties.name) {
    layer.bindPopup(feature.properties.name);
    layer.on({
      mouseover: function () {
        this.openPopup();
      },
      // mouseout: function() {
      //     this.closePopup();
      // },
      click: onItemClick
    });
  }}

function onItemClick (item) {
  map.setView(item.latlng, 16);
  const sceneName = item.target.feature.properties.scene;

  const scenesBefore = loop$1.slice(0, loop$1.indexOf(sceneName));
  const scenesAfter = loop$1.slice(loop$1.indexOf(sceneName), loop$1.length);

  loop$1 = scenesAfter.concat(scenesBefore);
  getSection(sections$1);
}

function onEachStreet (feature, layer) {
  if (feature.properties && feature.properties.name) {
    layer.bindPopup(feature.properties.name);
    layer.on({
      mouseover: function () {
        this.openPopup();
      }
    });
  }}

// History API
$$1(window).on('hashchange', function (e) {
  backInHistory();
});

function backInHistory () {
  const key = window.location.hash.substr(1);

  const scenesBefore = loop$1.slice(0, loop$1.indexOf(key));
  const scenesAfter = loop$1.slice(loop$1.indexOf(key), loop$1.length);

  loop$1 = scenesAfter.concat(scenesBefore);
  getSection(sections$1);
}

// Sidemenu Toggle
$$1('#dismiss, .overlay').click(function () {
  // hide sidebar
  $$1('#sidebar').removeClass('shadow');
  $$1('#sidebar').removeClass('active');
  $$1('.overlay').removeClass('active');
});

$$1('#sidebarCollapse').click(function () {
  $$1('#sidebar').toggleClass('shadow');
  $$1('#sidebar').toggleClass('active');
  $$1('.overlay').addClass('active');
});

// Audio control
$$1('#playAudio').click(function (e) {
  $$1(this).find('.icon').toggleClass('ion-md-play ion-md-pause');

  e = e || window.event;
  // const btn = e.target
  if (!audio.paused) {
    audio.pause();
    // isPlaying = false
  } else {
    audio.play();
    // isPlaying = true
  }
});

$$1(audio).on('playing', function (_event) {
  var duration = _event.target.duration;
  advance(duration, audio);
});

$$1(audio).on('pause', function (_event) {
  clearTimeout(timer);
});

function advance (duration, element) {
  const progress = $$1('#audioProgress')[0];
  const increment = 10 / duration;
  percent = Math.min(increment * element.currentTime * 10, 100);
  progress.style.width = percent + '%';
  startTimer(duration, element);
}

function startTimer (duration, element) {
  if (percent < 100) {
    timer = setTimeout(function () {
      advance(duration, element);
    }, 100);
  }
}

exports.scenes = scenes;
