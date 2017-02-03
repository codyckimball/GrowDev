var express    = require('express');
var app        = express();
var swapi      = require('swapi-node');
//var EJS        = require('ejs');

var character = {'luke': 1, 'han': 14, 'leia': 5, 'rey': 85}
var port = process.env.PORT || 8080;

var router = express.Router();

router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to my api!' });
});

router.route('/characters')

    .get(function(req, res) {
        var listOfCharacters = [];

        var totalPagesWanted = 5
        getCharacters(1)

        function getCharacters(pageNumber){
            swapi.get('http://swapi.co/api/people/?page=' + pageNumber.toString()).then(function(res){

                for(var character in res.results){
                    listOfCharacters.push(res.results[character])
                }

                if(pageNumber < totalPagesWanted){
                    pageNumber++
                    getCharacters(pageNumber)
                } else {
                      var sortValue = req.query.sort;
                      switch(sortValue){
                          case "name":
                               listOfCharacters.sort(function(a, b) {
                                  return (a.name > b.name) - (a.name < b.name);
                               });

                              break;
                          case "mass":
                               listOfCharacters.sort(function(a, b) {
                                  return a.mass - b.mass;
                               });
                              break;
                          case "height":
                               listOfCharacters.sort(function(a, b) {
                                   return parseFloat(a.height) - parseFloat(b.height);
                               });
                              break;
                          default:
                              console.log('No Sort')
                      }
                      console.log(listOfCharacters)
                }
            })
        }



    });

router.route('/planetresidents')

    .get(function(req, res) {
        var jsonData = {}
        var planetsDone = []

        swapi.get('http://swapi.co/api/people/').then(function (people){
            var totalPeople = people.count;

            getPlanetsFromPerson(1)
            function getPlanetsFromPerson(peopleID) {
                swapi.getPerson(peopleID).then(function (result) {

                    var planet = parseFloat(result.homeworld.replace('http://swapi.co/api/planets/','').replace('/',''));
                    if(!planetsDone.includes(planet)){

                        planetsDone.push(planet)
//                        console.log(planetsDone);
                        result.getHomeworld().then(function (res){
                            var name = res.name;
                            res.getResidents().then(function (residents){
                                var peepole = []
                                for(resident in residents){
                                    peepole.push(residents[resident].name)
                                }
                                jsonData[name] = peepole;
//                                console.log(jsonData);
                            })
                        })
                    }

                    if(peopleID < totalPeople ){
                        peopleID++;
                        getPlanetsFromPerson(peopleID);
                    } else {
                        console.log(jsonData);
                    }
                }).catch(function (error) {
                     console.log(error);
                     getPlanetsFromPerson(peopleID + 1)
                })
            }


        });

    });

router.route('/character/:name')

    .get(function(req, res) {

        let myGuy = swapi.getPerson(character[req.params.name])

        myGuy.then(function(result){
//            var html = new EJS({url: 'characterView.ejs'}).render(result);
            var html = "<h1>"+result.name+"</h1>"
            html += "<ul>"
            for(var key in result) {
                if(typeof result[key] != "function"){
                    html += "<li>"+result[key]+"</li>"
                }
            }
            html += "</ul>"

            res.send(html);
        })
    });

app.use('/api', router);

app.listen(port);
console.log('The Force was unleashed on port ' + port);

