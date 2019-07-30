# TODO: storymap-rewrite

- [X] Build Sidebar Content dynamically
- [X] Leaflet.pattern integration
- [X] Transparency Slider (on Rasterlayers)
- [X] Fix Collapse Icon on Navbar
- [X] Geolocation Bounds
- [X] Add Custom Attribution Field

- [ ] Audio Playback
- [ ] Remove IconToggle on empty Sections
- [ ] Fix Sidebar Scene Selection
- [ ] ProgressLine on Map (VectorPath)
- [ ] Gallery
- [ ] Fix URLs
- [ ] Fix Icon Issue on Transparency Slider
- [ ] long Titles on small Screens


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
#### Fabrikenufer

```javascript
data:application/json,{"location": {"lat": 53.09797808356111, "lng": 8.774028718471527}, "accuracy": 270.0}
```
