var stripes_eastside;
var map;
var loaded = [];

var loop = [];
var sections;

var first = true;
var prelast;

var targetScene = 'navigation';

let LocateControl;

const markdown = window.markdownit();

const circlecolors = {
    puce: '#C77F99',
    red: '#C77F99',
    blue: '#75b7e3',
    green: '#a1c58a'
};

const data_route_style = {
    color: '#706d93', // $rhythm
    weight: 3,
    opacity: 0.7,
    lineCap: 'round',
    dashArray: "0.7 6"
};

// Setup leaflet layers
const layers = {
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
            style: data_route_style
        }),
    },
    data_points: {
        layer: L.geoJson.ajax('./data/points.geojson', {
            onEachFeature: onEachPoint,
            pointToLayer: pointToLayer
        }),
    },
    data_streets: {
        layer: L.geoJson.ajax('./data/streets.geojson', {
            onEachFeature: onEachStreet,
            pointToLayer: pointToLayer
        }),
    },
    weserkorrektion: {
        layer: L.tileLayer('./data/05_port_construction/Weserkorrektion_tiles/{z}/{x}/{y}.png', {
            attribution: "",
            tms: true,
            opacity: 0.1,
            changeOpacity: true,
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
const scenes = {
    navigation: {
        lat: 53.09460389460539,
        lng: 8.771724700927736,
        zoom: 15,
        layers: [layers.data_route, layers.data_points],
        flyto: true,
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
        navigateTo: true,
        name: "Überseetor",
    },
    europahafen: {
        lat: 53.09412391687471,
        lng: 8.765995502471922,
        zoom: 17,
        slider: false,
        flyto: true,
        navigateTo: true,
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
    bremerhaven: {
        lat: 53.5399,
        lng: 8.5017,
        zoom: 12,
        slider: true,
        flyto: true,
        navigateTo: false,
        layers: [layers.esri_world, layers.weserkorrektion],
        name: "Bremerhaven",
    },
    speicher11: {
        lat: 53.096343366348854,
        lng: 8.7715744972229,
        zoom: 17,
        flyto: true,
        slider: false,
        navigateTo: true,
        layers: [layers.data_route, layers.data_points],
        name: "Speicher XI",
    },
    fabrikenufer: {
        lat: 53.09818262016042,
        lng: 8.773621022701263,
        zoom: 17,
        flyto: true,
        navigateTo: true,
        layers: [layers.data_route, layers.data_points],
        name: "Fabrikenufer",
    },
    waller_wied: {
        lat: 53.09397573474871,
        lng: 8.774774372577667,
        zoom: 17,
        flyto: true,
        navigateTo: true,
        layers: [layers.data_route, layers.data_points],
        name: "Waller Wied",
    },
    industriehaefen: {
        lat: 53.1252,
        lng: 8.7305,
        zoom: 14,
        flyto: true,
        navigateTo: false,
        layers: [layers.data_route, layers.data_streets],
        name: "Industriehäfen",
    },
    konsul_smidt_str: {
        lat: 53.09161441592877,
        lng: 8.772218227386475,
        zoom: 17,
        flyto: true,
        navigateTo: true,
        layers: [layers.data_route, layers.data_points],
        name: "Konsul-Smidt-Straße",
    }
};
$(window).on('hashchange', function(e) {
  backInHistory()
});

$('#storymap').storymap({
    scenes: scenes,
    baselayer: layers.carto_positron,
    loader: false,
    flyto: true,
    slider: false,
    dragging: true,
    credits: "<a href='https://github.com/janebuoy/storymap-rewrite'><i class='icon ion-md-build' style='font-size: 10px;'></i> by Jane Buoy | </a><a href='https://github.com/jakobzhao/storymap'>based on <img src='http://jakobzhao.github.io/storymap/img/logo.png' width='18px' target='_blank' > storymap.js </a>",
    scalebar: false,
    scrolldown: false,
    zoomControl: true,
    createMap: createMap
});

// Sidemenu Toggle
$('#dismiss, .overlay').click(function() {
    // hide sidebar
    $('#sidebar').removeClass('shadow');
    $('#sidebar').removeClass('active');
    $('.overlay').removeClass('active');
});

$('#sidebarCollapse').click(function() {
    $('#sidebar').toggleClass('shadow');
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
