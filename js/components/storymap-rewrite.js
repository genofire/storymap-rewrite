// Modified by Bo Zhao, zhao2@oregonstate.edu
// Originally obtained from http://atlefren.github.io/storymap/
// Updated on 05/04/2018 | version 2.4.0 | MIT License

// [] TODO: Fix URLs
// [] TODO: Builds Sidebar Content dynamically
// [] TODO: Geolocation Bounds
// [] TODO: ProgressLine on Map (VectorPath)

(function($) {

  $.fn.storymap = function(options) {

    var defaults = {
      selector: '[data-scene]',
      triggerpos: '30%',
      navwidget: false,
      legend: true,
      loader: true,
      flyto: false,
      scalebar: false,
      progressline: true,
      dragging: true,
      mapinteraction: false,
      zoomControl: false
    };

    var settings = $.extend(defaults, options);

    if (typeof(L) === 'undefined') {
      throw new Error('Storymap requires Leaflet.');
    }

    var current;
    var prev;
    var next;
    var first;
    var last;

    var gotoScene = "scene1";

    // var theSections = [] // Kept for sec check against sceneNames
    var sceneKeys = Object.keys(scenes);
    var sceneNames = {}

    var firstSceneTitle;
    var previousSceneTitle;
    var nextSceneTitle;

    for (i = 0; i < sceneKeys.length; i++) {
      var sceneKey = sceneKeys[i];
      var sceneName = scenes[sceneKeys[i]].name;
      sceneNames[sceneKey] = sceneName;
    }

    var makeStoryMap = function(element, scenes) {

      $(element).addClass("storymap");

      var scenes = settings.scenes;
      var searchfor = settings.selector;
      var sections = $(element).find(searchfor);
      var map = settings.createMap();
      var currentLayerGroup = L.layerGroup().addTo(map);

      if (settings.baselayer) {
        // add a base map, which can be either OSM, mapbox, tilelayer, wmslayer or those designed by yourself.
        settings.baselayer.layer.addTo(map);
      }

      if (settings.legend) {
        $(".storymap").append("<div class='storymap-legend' />")

      }

      if (settings.scalebar) {
        L.control.scale({
          position: "bottomright",
          metric: true,
          imperial: false
        }).addTo(map);
      }

      if (settings.zoomControl) {
        L.control.zoom({
          position: 'bottomright'
        }).addTo(map);
      }

      if (settings.progressline) {
        $(".storymap").append("<div class='storymap-progressline' />")

      }

      if (settings.navwidget) {
        $(".storymap").append("<div class='storymap-navwidget text-center'/>")

      }

      if (settings.loader) {
        $(".storymap").append("<div class='icon ion-md-refresh storymap-loader'></div>")

      }

      $(".storymap-map .leaflet-control-attribution")
        .addClass("storymap-attribution")
        .html("<a href='https://github.com/jakobzhao/storymap'><img src='https://jakobzhao.github.io/storymap/img/logo.png' width='18px' target='_blank' > storymap.js </a>");


      if (settings.credits) {
        $(".storymap-attribution").find("a").prepend(settings.credits + " | ");

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
        var legendContent = "";

        if (typeof $("section[data-scene='" + key + "']").data("background") !== 'undefined') {

          $(".storymap-loader").fadeTo(0, 0);

        } else if (typeof $("section[data-scene='" + key + "']").data("background") === 'undefined') {

          for (var i = 0; i < scene.layers.length; i++) {
            $(".storymap-loader").fadeTo(0, 1);
            currentLayerGroup.addLayer(scene.layers[i].layer);

            if (typeof scene.layers[i].legend !== 'undefined') {
              legendContent += scene.layers[i].legend;
            }
          }
          $(".storymap-loader").fadeTo(1, 0);

        }

        // the condition legendContent != "" will make sure the legend will only be added on when there is some contents in the legend.
        if (settings.legend && legendContent !== "") {
          $(".storymap-legend")
            .html(legendContent)
            .show();
        } else {
          $(".storymap-legend").hide();

        }

        if (scene.flyto == false) {
          map.setView([scene.lat, scene.lng], scene.zoom, {
            animate: false,
            easeLinearity: 0.2,
            duration: 4 // in seconds
          })
        } else if (settings.flyto) {
          map.flyTo([scene.lat, scene.lng], scene.zoom, {
            animate: true,
            easeLinearity: 0.2,
            duration: 4 // in seconds
          })
        } else {
          map.setView([scene.lat, scene.lng], scene.zoom, {
            animate: false,
            easeLinearity: 0.2,
            duration: 4 // in seconds
          })

        }

        map.invalidateSize();

      }

      function getSection(sections) {

        // theSections = $.map(sections, function(element) {
        //   return element.dataset.scene;
        // });

        $.each(sections, function(key, element) {

          var section = $(element);
          if (section[0].dataset.scene !== gotoScene) {
            section.trigger('notviewing');
          } else {
            section.trigger('viewing');
          };
        });
      }

      function buildSections(element, searchfor) {
        sections = $(element).find(searchfor);
        getSection(sections);
      }

      //change Title
      function changeTitle(key) {
        var scene = scenes[key];
        var section = $('section[data-scene="' + key + '"]')
        var sectionHeading = $('a[class^="title section-heading"]').children().html(scene.name);
      }

      // Find Current Scene
      function findCurrent(key, obj) {
        current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length]
      }

      // Find Previous Scene
      function findPrevious(key, obj) {
        prev = sceneKeys[(sceneKeys.indexOf(key) - 1) % sceneKeys.length]
        var previousLink = $('#prevSceneLeft').children()[0]
        $(previousLink).attr("href", '#' + sceneNames[prev]);

      }

      // Find Next Scene
      function findNext(key, obj) {
        next = sceneKeys[(sceneKeys.indexOf(key) + 1) % sceneKeys.length]
        var nextLink = $('#nextSceneRight').children()[0]
        $(nextLink).attr("href", '#' + sceneNames[next]);

      }

      // Find First Scene
      function findFirst(key, obj) {
        first = sceneKeys[(sceneKeys.indexOf(key) + 1) % sceneKeys.length]
        var nextLink = $('#nextSceneRight').children()[0]
        firstSceneTitle = sceneNames[first];
        $(nextLink).attr("href", '#' + firstSceneTitle);

      }

      // Show Previous Section
      function showPrevious(key, obj) {
        var i = sceneKeys.indexOf(key)
        if (sceneKeys[i] != 'scene1') {
          gotoScene = prev
          getSection(sections);
        }
      }

      // Show Next Section
      function showNext(key, obj) {

        var i = sceneKeys.indexOf(key)
        if (i < sceneKeys.length - 1) {
          gotoScene = next
          getSection(sections);
        }
        if (i == sceneKeys.length - 2) {
          // TODO: either remove Button or change to Home
          $('#nextSceneRight').html("<a href='#'><i class='icon ion-md-home'></i></a>");
        }
        if (i == sceneKeys.length - 1) {
          // TODO: create first Scene variable
          gotoScene = first
          getSection(sections);
          $(this).html("<a href='#nextScene'><i class='icon ion-md-arrow-forward'></i></a>");
        }
      }

      ////////////////////
      /* EVENT HANDLERS */
      ///////////////////

      sections.on('viewing', function() {

        $(this)
          .removeClass('hide')
          .addClass('visible')
          .addClass('viewing')
          .addClass('show');

        var key = $(this).data('scene')

        changeTitle(key);
        findCurrent(key, sceneNames);
        findPrevious(key, sceneNames);
        findNext(key, sceneNames);
        showMap(key);
      });

      sections.on('notviewing', function() {

        $(this)
          .removeClass('viewing')
          .removeClass('show')
          .removeClass('visible')
          .addClass('hide');
      });

      buildSections(element, searchfor);

      // Sidemenu Scene Switch
      var links = $('a[href^="#scene"]');
      links.each(function(index) {

        $(this).click(function() {

          if (gotoScene !== this.dataset.target) {
            gotoScene = this.dataset.target;
            getSection(sections);
          };

          $('#sidebar').toggleClass('active');
          $('.overlay').removeClass('active');
        });

      });

      // Switch Scenes on Left and Right Arrow click
      $('#nextSceneRight').click(function() {
        showNext(current, sceneNames);
      })

      $('#prevSceneLeft').click(function () {
        showPrevious(current, sceneNames);
      });

    };

    makeStoryMap(this, scenes);

    return this;
  }

}(jQuery));
