var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

const APP_TOKEN = 'EAAZAuDrzFrLABAG5NW18dmkhis8C4MtHO0xNumZBx4Nr7XO8lW4PhlGeIHjGVvtBVJZCPS61PIDZB5ZC1uBZAZBQ4QF8W5DyepmZAW8tlQpDpUNffNCJvIT7InNZCFjcZCnBnvWZCZCbBfFAb1E7zo2I0ELB2BTJAe0sx6ESlbIIrOJK4AZDZD';

var app = express();
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/webhook', function(req, res){
	if(req.query['hub.verify_token'] === 'test_token_say_hello'){
		res.send(req.query['hub.challenge']);
	}else{
		res.send('Tu no tienes que entrar aqui');
	}
});

app.post('/webhook', function(req, res){

	var data = req.body;
	if(data.object == 'page'){

		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){

				if(messagingEvent.message){
					receiveMessage(messagingEvent);
				}

			});
		});
		res.sendStatus(200);
	}
});


function receiveMessage(event){
	var senderID = event.sender.id;
	var messageText = event.message.text;


	evaluateMessage(senderID, messageText);
}


function evaluateMessage(recipientId, message) {
    var finalMessage = '';

    if (isContain(message, 'ayuda')) {
        finalMessage = 'Hola como estas, en que te puedo ayudar';

    } else if (isContain(message, 'Ayuda')) {

        finalMessage = 'Hola como estas, en que te puedo ayudar';

    }
    else if (isContain(message, 'Luis Yaguapaz')) {

        finalMessage = 'Hola como estas, soy uruguayo y me gusta la chevecha';

    } else if (isContain(message, 'gato')) {

        sendMessageImage(recipientId);

    } else if (isContain(message, 'clima')) {

        getWeather(function(temperature) {

            message = getMessageWeather(temperature);
            sendMessageText(recipientId, message);

        });

    } else if (isContain(message, 'info')) {

        sendMessageTemplate(recipientId);

    } else {
        finalMessage = 'solo se repetir las cosas : ' + message;
    }
    sendMessageText(recipientId, finalMessage);
}

function sendMessageText(recipientId, message){
	var messageData = {
		recipient : {
			id : recipientId
		},
		message: {
			text: message
		}
	};
	callSendAPI(messageData);
}

function sendMessageImage(recipientId){
	var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "http://i.imgur.com/SOFXhd6.jpg"
        }
      }
    }
  };
	callSendAPI(messageData);
}


function sendMessageTemplate(recipientId){
	var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [ elemenTemplate() ]
        }
      }
    }
  };
	callSendAPI(messageData);
}

function elemenTemplate(){
	return {
	  title: "Carlos Aguirre",
	  subtitle: "Desarrollado de Software en Omnes Web",
	  item_url: "https://www.facebook.com/omnesweb",
	  image_url: "",
	  buttons: [ buttonTemplate() ],
  }
}

function buttonTemplate(){
	return{
		type: "web_url",
		url : "https://www.facebook.com/omnesweb",
		title : "Omnes Web"
	}
}

function callSendAPI(messageData){
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs : { access_token :  APP_TOKEN },
		method: 'POST',
		json: messageData
	}, function(error, response, data){

		if(error){
			console.log('No es posible enviar el mensaje');
		}else{
			console.log("El mensaje fue enviado");
		}

	});
}

function getMessageWeather(temperature){
	if (temperature > 30)
		return "Nos encontramos a "+ temperature +" Hay demaciado calor, te recomiendo que no salgas";
	return "Nos encontramos a "+ temperature +" es un bonito día para salir";
}

function getWeather(  callback ){
	request('http://api.geonames.org/findNearByWeatherJSON?lat=16.750000&lng=-93.116669&username=demo',
		function(error, response, data){
			if(!error){
				var response = JSON.parse(data);
				var temperature = response.weatherObservation.temperature;
				callback(temperature);
			}
		});
}

function isContain(sentence, word){
	return sentence.indexOf(word) > -1;
}
