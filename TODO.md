# TODO: storymap-rewrite

- [X] Build Sidebar Content dynamically
- [X] Leaflet.pattern integration
- [X] Transparency Slider (on Rasterlayers)
- [X] Fix Collapse Icon on Navbar
- [X] Geolocation Bounds
- [X] Add Custom Attribution Field
- [x] Fix Sidebar Scene Selection
- [x] Browser History
- [x] Stations should start w/ Text collapsed

- [ ] Audio Playback
- [ ] Remove IconToggle on empty Sections
- [ ] ProgressLine on Map (VectorPath)
- [ ] Gallery
- [ ] Fix Icon Issue on Transparency Slider (??)
- [ ] long Titles on small Screens
- [ ] move to native/cross-platform framework
- [ ] redesign left/right arrows
- [ ] decide what should happen on first and last scene (how to navigate)
- [ ] do not scroll section when scrolling sidebar
- [ ] show images on map layer


### Geolocation Testing

- open `about:config`
- change value of `geo.wifi.uri`

#### Firefox Default

``` javascript
https://location.services.mozilla.com/v1/geolocate?key=%MOZILLA_API_KEY%
```

#### Überseetor (out of bounds)

```javascript
data:application/json,{"location": {"lat": 53.095061318063934, "lng": 8.772915601730347}, "accuracy": 270.0}
```

#### Überseetor (in bounds)

```javascript
data:application/json,{"location": {"lat": 53.09422055711675, "lng": 8.771351873874664}, "accuracy": 270.0}
```

#### Fabrikenufer

```javascript
data:application/json,{"location": {"lat": 53.09797808356111, "lng": 8.774028718471527}, "accuracy": 270.0}
```
