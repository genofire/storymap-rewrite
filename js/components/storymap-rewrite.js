// Modified by Bo Zhao, zhao2@oregonstate.edu
// Originally obtained from http://atlefren.github.io/storymap/
// Updated on 05/04/2018 | version 2.4.0 | MIT License


// [X] TODO: Build Sidebar Content dynamically
// [X] TODO: Leaflet.pattern integration
// [X] TODO: Transparency Slider (on Rasterlayers)
// [X] TODO: Fix Collapse Icon on Navbar

// [0] TODO: Fix Sidebar Scene Selection
// [0] TODO:
// [0] TODO: Geolocation Bounds
// [0] TODO: ProgressLine on Map (VectorPath)
// [0] TODO: Gallery
// [0] TODO: Fix URLs
// [0] TODO: Fix Icon Issue on Transparency Slider
// [0] TODO: long Titles on small Screens

// Firefox Geolocation: https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%
//                      data:application/json,{"location": {"lat": 53.095061318063934, "lng": 8.772915601730347}, "accuracy": 270.0}
// Fabrikenufer:        data:application/json,{"location": {"lat": 53.09797808356111, "lng": 8.774028718471527}, "accuracy": 270.0}

var loop = [];
var sections;
var first = true;
var current;
var prelast;

var gotoScene = 'navigation';

var latlng;
var geolocate = false;

(function($) {

    $.fn.storymap = function(options) {

        var defaults = {
            selector: '[data-scene]',
            triggerpos: '30%',
            navwidget: false,
            legend: true,
            locate: true,
            loader: true,
            flyto: false,
            slider: false,
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

        // var theSections = [] // Kept for sec check against sceneNames
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

        var makeStoryMap = function(element, scenes) {

            $(element).addClass("storymap");

            var scenes = settings.scenes;
            var searchfor = settings.selector;
            sections = $(element).find(searchfor);
            var map = settings.createMap();
            var currentLayerGroup = L.layerGroup().addTo(map);

            var slider = L.control.range({
                orient: 'vertical',
                position: 'bottomright',
                value: 100,
                icon: false
            });

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
            

            if (settings.locate) {
                L.control.locate({
                    position: 'bottomright',
                    keepCurrentZoomLevel: true,
                    returnToPrevBounds: true,
                    drawCircle: true,
                    showPopup: false
                }).addTo(map);
            }

            if (settings.slider) {
                slider.addTo(map);
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

                if (scene.slider) {
                    map.addControl(slider);
                    slider.on('input change', function(e) {
                        for (var [key, value] of Object.entries(currentLayerGroup._layers)) {
                            if (value.options.changeOpacity == true) {
                                value.setOpacity(e.value / 100)
                            }
                        }
                    });
                }
                else {
                    map.removeControl(slider);
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
                        duration: 2 // in seconds
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

                $.each(sections, function(key, element) {

                    var section = $(element);
                    if (section[0].dataset.scene !== gotoScene) {
                        section.trigger('notviewing');
                    } else {
                        section.trigger('viewing');
                        toggleArrow(current);
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

            function sortScenes(key, obj) {

                current = sceneKeys[sceneKeys.indexOf(key) % sceneKeys.length]
                prelast = sceneKeys[loop.length - 2]
            }

            // Show Previous Section
            function showPrevious() {

                function prevItem() {
                    loop.unshift(loop[loop.length - 1]);
                    loop.pop()
                    return loop[0]
                }

                gotoScene = prevItem()
                getSection(sections);

            }

            // Populate Sidebar with Scenes
            function buildSidebar(key, sceneNames) {
                var ul = $('#sidebarItems')

                $.each( sceneNames, function( key, value ) {
                    var li = $('<li></li>')
                    ul.append(li)
                    li.html("<a href='#" + key + "' data-target='" + key + "'>" + value + "</a>")
                });

            }

            ////////////////////
            /* EVENT HANDLERS */
            ///////////////////

            sections.on('viewing', function() {

                key = $(this).data('scene');
                sortScenes(key, sceneNames);
                changeTitle(key);

                $(this)
                .removeClass('hide')
                .addClass('visible')
                .addClass('viewing')
                .addClass('show');

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
            buildSidebar(key, sceneNames);

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
                showNext(current);
            })

            $('#prevSceneLeft').click(function () {
                showPrevious();
            });

        };

        makeStoryMap(this, scenes);

        return this;
    }

}(jQuery));
