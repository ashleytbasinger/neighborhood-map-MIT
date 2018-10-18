// in case the map doesn't load
function mapError() {
    alert("Error: map could not be loaded");
}

// initialize the objects
function initialize() {
    var map;
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap'
    };

    // displays the map
    map = new google.maps.Map(document.getElementById("canvas-map"), mapOptions);
    map.setTilt(40);

    // sidebar list items
    var infoWindowContent = [
        ['<div class="info_content">'+'<h3>MIT Great Dome</h3>'+'<p>Campus Landmark</p>'+'</div>'],
        ['<div class="info_content">'+'<h3>Baby Bunnies</h3>'+'<p>Miscellaneous</p>'+'</div>'],
        ['<div class="info_content">'+'<h3>MIT Nuclear Reactor</h3>'+'<p>Campus Landmark</p>'+'</div>'],
        ['<div class="info_content">'+'<h3>Anna\'s Taqueria</h3>'+'<p>Good Eats</p>'+'</div>'],
        ['<div class="info_content">'+'<h3>Kresge Auditorium</h3>'+'<p>Campus Landmark</p>'+'</div>'],
        ['<div class="info_content">'+'<h3>Flour Bakery and Cafe</h3>'+'<p>Good Eats</p>'+'</div>']
    ];

    // clickable sidebar list
    var listContent = [
    '<li>MIT Great Dome</li>',
    '<li>Baby Bunnies</li>',
    '<li>MIT Nuclear Reactor</li>',
    '<li>Anna\'s Taqueria</li>',
    '<li>Kresge Auditorium</li>',
    '<li>Flour Bakery and Cafe</li>'
    ];

    var infoWindow = new google.maps.InfoWindow(), marker, i;
    
    // loads NYT info in the window
    function loadMarker(marker, i){
        return function() {
            var apiNyt = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + vm.locations()[i].name + '&sort=newest&api-key=d0459db6a0f045e79b924025a52bf472';
            var nytArticle = infoWindowContent[i] + '<div>See NYT Articles For ' + vm.locations()[i].name;

            $.getJSON(apiNyt, nytArticle, function(data){
                    articles = data.response.docs;
                    for (var j = 0; j < 2 ; j++) {
                        var article = articles[j];
                        nytArticle += '<li class="article">'+
                            '<a href="'+article.web_url+'">'+article.headline.main+'</a>'+
                            '<p>' + article.snippet + '</p>'+ '</li></div>';
                        infoWindow.setContent(nytArticle);
                    }
                })
                    .fail(function(e){
                        nytArticle += '<br/><br/><p style="color:red;"">Articles Could Not Be Loaded</p></div>';
                        infoWindow.setContent(nytArticle);
                });
            // marker starts bouncing when location is clicked on in the list
            infoWindow.open(map, marker);
            marker.setAnimation(google.maps.Animation.BOUNCE);
        };
    }

    // iterate through the array of locations, and place on the map
    for( i = 0; i < vm.locations().length; i++ ) {
        var position = new google.maps.LatLng(vm.locations()[i].lat, vm.locations()[i].lon);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            map: map,
            animation: google.maps.Animation.DROP,
            title: vm.locations()[i].name
        });

        vm.locations()[i].marker = marker;

        // each location has information- load when clicked
        google.maps.event.addListener(marker, 'click', loadMarker(marker, i));

        // the most frustrating part of this thing: centers the map on the group of locations
        map.fitBounds(bounds);
    }

    // allows the bounds to change once you move the map
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(10);
        google.maps.event.removeListener(boundsListener);
    });
}

function viewModel() {
    var self = this;
    // map locations
    self.locations = ko.observableArray([
        {name : 'MIT Great Dome', lat : 42.359902, lon : -71.092032, selected : ko.observable(false), type : 'Campus Landmark', value : ko.observable(true)},
        {name : 'Baby Bunnies', lat : 42.355136, lon : -71.103125, selected : ko.observable(false), type : 'Miscellaneous', value : ko.observable(true)},
        {name : 'MIT Nuclear Reactor', lat : 42.360179, lon : -71.096517, selected : ko.observable(false), type : 'Campus Landmark', value : ko.observable(true)},
        {name : 'Anna\'s Taqueria', lat : 42.359005, lon : -71.094617, selected : ko.observable(false), type : 'Good Eats', value : ko.observable(true)},
        {name : 'Kresge Auditorium', lat : 42.358292, lon : -71.095036, selected : ko.observable(false), type : 'Campus Landmark', value : ko.observable(true)},
        {name : 'Flour Bakery and Cafe', lat : 42.361058, lon : -71.096623, selected : ko.observable(false), type : 'Good Eats', value : ko.observable(true)}
]);

    self.locSize = self.locations().length;
    // click event that highlights a list item, and simultaneously shows up on the map
    self.listItemClick = function(location) {
        google.maps.event.trigger(location.marker, 'click');
        for ( i = 0; i < self.locations().length; i++){
            if (self.locations()[i].name == location.name)
                self.locations()[i].selected(true);
            else
                self.locations()[i].selected(false);
        }
    };
    // filter functionality
    self.filters = ko.observableArray([
        {type : 'Display all'},
        {type : 'Campus Landmark'},
        {type : 'Good Eats'},
        {type : 'Miscellaneous'}
        ]);

    // filters locations by type
    self.filterClick = function(filter) {
        console.log(filter.type);
        for ( i = 0; i < self.locations().length; i++){
            if (filter.type == 'Display all') {
                self.locations()[i].value(true);
                self.locations()[i].marker.setVisible(true);
            }
            else if (self.locations()[i].type == filter.type) {
                self.locations()[i].value(true);
                self.locations()[i].marker.setVisible(true);
            }
            else {
                self.locations()[i].value(false);
                self.locations()[i].marker.setVisible(false);
            }
        }
    };
}

var vm = new viewModel();
ko.applyBindings(vm);

// menu toggles open and closed- thanks Bootstrap!
$("#toggle-menu").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
});