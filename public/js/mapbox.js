// var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js')

const locations = JSON.parse(document.getElementById('map').dataset.locations) // dataset -> because it's from data-locations (locations become a part of dataset)
console.log(locations)


  mapboxgl.accessToken = 'pk.eyJ1IjoiZGlkaWVyMjI1IiwiYSI6ImNsbXkzb3Z5YjB3MTkyc3BoeTF1NHplYmQifQ.fVdPrN0d7T5K4vCQPkCkRQ'
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11'
  });
