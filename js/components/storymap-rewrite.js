// Modified by Janne Jensen, janebuoy@posteo.de
// Originally obtained from https://github.com/jakobzhao/storymap
// Updated on 29/07/2019 | version 0.7.0 | MIT License

(function($) {

  $.fn.storymap = function(options) {

    var defaults = {
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

    var settings = $.extend(defaults, options);

    if (typeof(L) === 'undefined') {
      throw new Error('Storymap requires Leaflet.');
    }

    var sceneKeys = Object.keys(scenes);
    var sceneNames = {}

    for (var [key, scene] of Object.entries(scenes)) {
      if (scene.navigateTo && key != 'ueberseetor') {
        loop.push('navigation')
      }
      loop.push(key)
    }

    for (i = 0; i < sceneKeys.length; i++) {
      var sceneKey = sceneKeys[i];
      var sceneName = scenes[sceneKeys[i]].name;
      sceneNames[sceneKey] = sceneName;
    }

    let makeStoryMap = function(element, scenes) {

      $(element).addClass("storymap");

      let searchfor = settings.selector;
      sections = $(element).find(searchfor);
      let map = settings.createMap();
      let currentLayerGroup = L.layerGroup().addTo(map);

      let OpacityControl = L.control.range({
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
        var Scale = L.control.scale({
          position: "bottomright",
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
        $(".storymap").append("<div class='icon ion-md-refresh storymap-loader'></div>")

      }

      $(".storymap-map .leaflet-control-attribution")
      .addClass("storymap-attribution")

      if (settings.credits) {
        $(".storymap-attribution").html(settings.credits)
      }

      if (settings.dragging) {

        map.dragging.enable();
        if (map.tap) map.tap.enable();
        $("storymap-map").css("cursor", "grab");

      }
      else {
        map.dragging.disable();
        if (map.tap) map.tap.disable();
        $("storymap-map").css("cursor", "pointer");
      }

      if (settings.mapinteraction) {

        map.touchZoom.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (map.tap) map.tap.enable();

        $("storymap-map").css("cursor", "grab");

      }
      else {
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (map.tap) map.tap.disable();

        $("storymap-map").css("cursor", "pointer");

      }

      if (!String.prototype.includes) {
        String.prototype.includes = function() {
          'use strict';
          return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
      }

      $.each(layers, function(key, layer) {

        layer.layer.on('s');
        layer.layer.on('load', function() {
          $(".storymap-loader").fadeTo(1000, 0);
        })

      });

      function showMap(key) {

        currentLayerGroup.clearLayers();

        var scene = scenes[key];

        for (var i = 0; i < scene.layers.length; i++) {
          $(".storymap-loader").fadeTo(0, 1);
          currentLayerGroup.addLayer(scene.layers[i].layer);
        }
        $(".storymap-loader").fadeTo(1, 0);

        /* PER SCENE SETTINGS */

        if (scene.slider) {
          map.removeControl(LocateControl);
          map.addControl(OpacityControl);
          map.removeControl(ZoomControl);

          OpacityControl.on('input change', function(e) {
            for (var [key, value] of Object.entries(currentLayerGroup._layers)) {
              if (value.options.changeOpacity == true) {
                value.setOpacity(e.value / 100)
              }
            }
          });

          map.addControl(ZoomControl);
          map.addControl(LocateControl);
        }
        else {
          map.removeControl(OpacityControl);
        }

        if (scene.flyto == false) {
          map.setView([scene.lat, scene.lng], scene.zoom, {
            animate: false,
            easeLinearity: 0.2,
            duration: 4 // in seconds
          })
        }
        else if (settings.flyto) {
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

        getMapCredits(scene, layers, settings);

        map.invalidateSize();

      }

      /**************************/
      /*     Event Handlers     */
      /**************************/

      sections.on('viewing', function() {

        key = $(this).data('scene');
        updateSidebar(key, sceneKeys);
        changeTitle(key);

        $(this)
        .removeClass('hide')
        .addClass('visible')
        .addClass('viewing')
        .addClass('show');

        // Pushes Scene Name to History API
        window.history.pushState(
          {},
          key,
          window.location.origin + "#" + key
        );

        showMap(key);
      });

      sections.on('notviewing', function() {
        $(this)
        .removeClass('viewing')
        .removeClass('show')
        .removeClass('visible')
        .addClass('hide');
      });

      // Switch Scenes on Left and Right Arrow click
      $('#nextArrow').click(function() {
        showNext(key);
      })

      $('#prevArrow').click(function () {
        showPrevious();
      });


      buildSections(element, searchfor);
      buildSidebar(key, sceneNames, sceneKeys);

    };

    makeStoryMap(this, scenes);

    return this;
  }

}(jQuery));
