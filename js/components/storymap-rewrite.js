// Modified by Bo Zhao, zhao2@oregonstate.edu
// Originally obtained from http://atlefren.github.io/storymap/
// Updated on 05/04/2018 | version 2.4.0 | MIT License

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

    // Define Scene 1 as Opening Scene
    var currentScene = "scene1";

    function getFirstSection(sections) {

      var thesections = $.map(sections, function(element) {
        return {
          el: $(element)
        };
      });

      $.each(sections, function(key, element) {

        var section = $(element);
        if (section[0].dataset.scene !== currentScene) {
          section.trigger('notviewing');
        } else {
          section.trigger('viewing');
        };
      });
    }

    // watchHighlight rewrite
    function showSection(element, searchfor) {
      var sections = element.find(searchfor);
      getFirstSection(sections);
    }

    //support video for IE 8 and 9.
    document.createElement('video');

    var makeStoryMap = function(element, scenes) {

      $(element).addClass("storymap");

      var searchfor = settings.selector;
      var sections = $(element).find(searchfor);
      // console.log(sections);
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
          position:'bottomright'
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

      } else {

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

      } else {

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

        if (settings.flyto) {
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

      function executeScript(key) {
        var scene = scenes[key];
        var section = $('section[data-scene="' + key + '"]')
        // console.log(section);
        scene.script(key, map, section);
      }

      /*
      EVENT HANDLERS
      */

      sections.on('viewing', function() {

        $(this)
          //.removeClass('invisible')
          .removeClass('hide')
          .addClass('visible')
          .addClass('viewing')
          .addClass('show');

        if (typeof $(this).data("background") !== 'undefined') {
          $(this)
            .addClass('section-opacity');
        }

        // Show corresponding Data Scene
        showMap($(this).data('scene'));

        // change Title
        var title = $(this).attr('title')
        var sectionheading = $('a[class^="title section-heading"]').children();
        sectionheading.html(title);

        if (typeof(scenes[$(this).data('scene')].script) !== 'undefined') {
          executeScript($(this).data('scene'));
        }
      });

      sections.on('notviewing', function() {

        $(this)
          .removeClass('viewing')
          .removeClass('show')
          .removeClass('visible')
          // .addClass('invisible')
          .addClass('hide');
      });

      showSection(element, searchfor);

      // Sidemenu Scene Switch
      var links = $('a[href^="#scene"]');
      links.each(function(index) {

        $(this).on("click", function() {

          if (currentScene !== this.dataset.target) {
            currentScene = this.dataset.target;
            showSection(element, searchfor);
          };

          $('#sidebar').toggleClass('active');
          $('.overlay').removeClass('active');
        });

      });

      // create a progress line
      $(window).scroll(function() {
        var wintop = $(window).scrollTop(),
          docheight = $(document).height(),
          winheight = $(window).height();
        var scrolled = (wintop / (docheight - winheight)) * 100;

        $('.storymap-progressline').css('width', (scrolled + '%'));
      });

    };

    makeStoryMap(this, settings.scenes);
    return this;
  }

}(jQuery));
