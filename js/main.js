//
var stripes_eastside;
var map;
var latlng;

var loaded = [];

var circlecolors = {
    puce: '#C77F99',
    blue: '#75b7e3',
    green: '#a1c58a'
}

// Layer Styling
function styleFeatures(feature) {
    return {
        color: '#878d8e',
        fillPattern: stripes_eastside,
        fillOpacity: 0.8,
        weight: 1,
        smoothFactor: 1,
    }
}

function pointToLayer(feature, latlng) {
    var style = []
    for (const [key, value] of Object.entries(circlecolors)) {
        style[key] = {
            radius: 16,
            fillColor: value,
            color: '#878d8e',
            fillOpacity: 0.5,
            opacity: 1,
            weight: 1,
        }
        if (feature.color == key) {
            return L.circleMarker(latlng, style[key]);
        }
    }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function onEachFeature(feature, layer) {
    var point = feature.geometry.coordinates;
    var coords = L.latLng(point.reverse());
    var bounds = coords.toBounds(150);
    var locateControl = map._container.children[1].children[3].children[0]

    setInterval(function(){
        if (bounds.contains(latlng) && loaded[0] == itemName && $(locateControl).hasClass('active') == true) {
            map.setView(point, 16);
            var itemName = feature.properties.scene;

            var loop_before = loop.slice(0, loop.indexOf(itemName))
            var loop_after = loop.slice(loop.indexOf(itemName), loop.length)

            loop = loop_after.concat(loop_before)

            gotoScene = itemName
            getSection(sections);

            loaded.push(itemName)
        }
    }, 5000);


    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
        layer.on({
            mouseover: hoverInItem,
            // mouseout: hoverOutItem,
            click: onItemClick,
        });
    };
}

function onEnter(feature) {
    map.setView(point, 16);
    var itemName = feature.properties.scene;

    var loop_before = loop.slice(0, loop.indexOf(itemName))
    var loop_after = loop.slice(loop.indexOf(itemName), loop.length)

    loop = loop_after.concat(loop_before)

    gotoScene = itemName
    getSection(sections);
}

function hoverInItem(item) {
    this.openPopup();
}

function hoverOutItem(item) {
    this.closePopup();
}

function onItemClick(item) {
    map.setView(item.latlng, 16)
    var itemName = item.target.feature.properties.scene

    var loop_before = loop.slice(0, loop.indexOf(itemName))
    var loop_after = loop.slice(loop.indexOf(itemName), loop.length)

    loop = loop_after.concat(loop_before)

    gotoScene = itemName
    getSection(sections);
}

const data_route_style = {
    color: '#706d93', // $rhythm
    weight: 3,
    opacity: 0.7,
    lineCap: 'round',
    dashArray: "0.7 6"
};

// Setup leaflet layers
var layers = {
    carto_positron: {
        layer: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        })
    },
    stamen_toner_bg: {
        layer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-background/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        })
    },
    stamen_terrain: {
        layer: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        })
    },
    esri_world: {
        layer: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
    },
    data_route: {
        layer: L.geoJson.ajax('./data/route.geojson', {
            style: data_route_style
        }),
    },
    data_points: {
        layer: L.geoJson.ajax('./data/points.geojson', {
            onEachFeature: onEachFeature,
            pointToLayer: pointToLayer
        }),
    },
    weserkorrektion: {
        layer: L.tileLayer('./data/05_port_construction/Weserkorrektion_tiles/{z}/{x}/{y}.png', {
            tms: true,
            opacity: 0.1,
            changeOpacity: true,
            attribution: ""
        })
    },
    ueberseehafenbecken: {
        layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ueberseehafenbecken.geojson', {
            style: styleFeatures
        }),
    },
    data_ports_1882: {
        layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1882+4326.geojson', {
            style: styleFeatures
        }),
    },
    data_ports_1884: {
        layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1884+4326.geojson', {
            style: styleFeatures
        }),
    },
    data_ports_1914: {
        layer: L.geoJson.ajax('./data/04_ueberseehafenbecken/ports_1914+4326.geojson', {
            style: styleFeatures
        }),
    },
};

// Setup Scenes/Chapters
var scenes = {
    navigation: {
        lat: 53.09460389460539,
        lng: 8.771724700927736,
        zoom: 15,
        layers: [layers.data_route, layers.data_points],
        flyto: false,
        navigation: true,
        name: "Navigation"
    },
    ueberseetor: {
        lat: 53.09476,
        lng: 8.77068,
        zoom: 17,
        slider: false, // also chane changeOpacity: true in Layer
        layers: [layers.ueberseehafenbecken, layers.data_route, layers.data_points],
        flyto: true,
        navigateTo: false,
        name: "Überseetor",
    },
    europahafen: {
        lat: 53.09412391687471,
        lng: 8.765995502471922,
        zoom: 17,
        slider: false,
        flyto: true,
        navigateTo: false,
        layers: [layers.data_route, layers.data_points],
        name: "Europahafen",
    },
    weserkorrektion: {
        lat: 53.1127,
        lng: 8.7238,
        zoom: 14,
        slider: true,
        flyto: true,
        navigateTo: false,
        layers: [layers.esri_world, layers.weserkorrektion],
        name: "Weserkorrektion",
    },
    speicher11: {
        lat: 53.096343366348854,
        lng: 8.7715744972229,
        zoom: 17,
        flyto: true,
        slider: false,
        navigateTo: false,
        layers: [layers.data_route, layers.data_points],
        name: "Speicher XI",
    },
    fabrikenufer: {
        lat: 53.09818262016042,
        lng: 8.773621022701263,
        zoom: 17,
        flyto: true,
        navigateTo: false,
        layers: [layers.data_route, layers.data_points],
        name: "Fabrikenufer",
    },
    waller_wied: {
        lat: 53.09397573474871,
        lng: 8.774774372577667,
        zoom: 17,
        flyto: true,
        navigateTo: false,
        layers: [layers.data_route, layers.data_points],
        name: "Waller Wied",
    },
    konsul_smidt_str: {
        lat: 53.09161441592877,
        lng: 8.772218227386475,
        zoom: 17,
        flyto: true,
        navigateTo: false,
        layers: [layers.data_route, layers.data_points],
        name: "Konsul-Smidt-Straße",
    }
};


$('#storymap').storymap({
    scenes: scenes,
    baselayer: layers.carto_positron,
    legend: true,
    navbar: false,
    loader: true,
    flyto: true,
    slider: false,
    dragging: true,
    credits: "<i class='icon ion-md-build' style='font-size: 10px;'></i> with <i class='icon ion-md-heart' style='color: red; font-size: 10px;'></i> from Bo Zhao",
    scalebar: true,
    scrolldown: false,
    progressline: true,
    zoomControl: true,
    createMap: function() {
        map = L.map($('.storymap-map')[0], {
            zoomControl: false
        }).setView([53.09460389460539, 8.771724700927736], 15);

        var eastside = '#ad7fc7';

        stripes_eastside = new L.StripePattern({
            color: eastside,
            opacity: 1,
            angle: -10
        }).addTo(map);

        return map;

    }
});

// Sidemenu Toggle
$('#dismiss, .overlay').click(function() {
    // hide sidebar
    $('#sidebar').removeClass('active');
    $('.overlay').removeClass('active');
});

$('#sidebarCollapse').click(function() {
    $('#sidebar').toggleClass('active');
    $('.overlay').addClass('active');
});

// Audio control
$("#audioControl").click(function() {
    $(this).find(".icon").toggleClass('ion-md-play ion-md-pause');

});

// Content Toggle
function toggleIcon() {
    $("#contentCollapse")
    .find(".icon")
    .toggleClass('ion-md-arrow-dropup ion-md-arrow-dropdown');
}

$('.section-content').on('hidden.bs.collapse', toggleIcon);
$('.section-content').on('show.bs.collapse', toggleIcon);

// Geolocation
navigator.geolocation.getCurrentPosition(function(location) {
    latlng = new L.LatLng(location.coords.latitude, location.coords.longitude);
});
