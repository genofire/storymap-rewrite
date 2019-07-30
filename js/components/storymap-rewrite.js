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
                LocateControl = L.control.locate({
                    position: 'bottomright',
                    keepCurrentZoomLevel: true,
                    returnToPrevBounds: false,
                    drawCircle: true,
                    showPopup: false
                }).addTo(map);
            }

            if (settings.slider) {
                slider.addTo(map);
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

                getMapCredits(scene, layers, settings);


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
                    if (key == 'navigation') {
                        li.html("<a href='#" + key + "' data-target='" + key + "'><i class='ion-sidebar-icon icon ion-md-home'></i><span class='spacer'></span>" + value + "</a>")
                    }
                    else {
                        li.html("<a href='#" + key + "' data-target='" + key + "'><i class='fa-sidebar-icon fas fa-circle'></i><span class='spacer'></span>" + value + "</a>")
                    }
                    if (key == current) {
                        $(li).find('i').addClass('active-icon')
                        $(li).find('i').removeClass('inactive-icon')
                    }
                    else {
                        $(li).find('i').removeClass('active-icon')
                        $(li).find('i').addClass('inactive-icon')
                    }

                });

            }
            function updateSidebar(key, sceneNames) {
                var ul = $('#sidebarItems')
                var li = $('ion-sidebar-icon')

                $.each( sceneNames, function( key, value ) {
                    console.log(li[0]);
                    // if (key == current) {
                    //     $(li).find('i').addClass('active-icon')
                    //     $(li).find('i').removeClass('inactive-icon')
                    // }
                    // else {
                    //     $(li).find('i').removeClass('active-icon')
                    //     $(li).find('i').addClass('inactive-icon')
                    // }

                });

            }

            ////////////////////
            /* EVENT HANDLERS */
            ///////////////////

            sections.on('viewing', function() {

                key = $(this).data('scene');
                sortScenes(key, sceneNames);
                updateSidebar(key, sceneNames);
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
                    $('#sidebar').toggleClass('shadow');
                    $('.overlay').removeClass('active');
                });

            });

            // Switch Scenes on Left and Right Arrow click
            $('#nextArrow').click(function() {
                showNext(current);
            })

            $('#prevArrow').click(function () {
                showPrevious();
            });

        };

        makeStoryMap(this, scenes);

        return this;
    }

}(jQuery));
