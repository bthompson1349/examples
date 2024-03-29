/*
    INVOLT
    ------------------------------
    INVOLT CORE FILE
    Ernest Warzocha 2014
    involt.github.io
*/

//--------------------------------

//LOADER SETTINGS:
/*Set loaderOnLaunch to false if you dont want to run loader on every launch
(direct connction is useful when creating your app but not recommended for finished project).*/
var loaderOnLaunch = true;
//If you want to work without launcher you must define your connected arduino port:
var defaultSerialPort = "COM7";

//--------------------------------

//ADVANCED SETTINGS:
//Connection bitrate (slow bitrate will send errors)
var arduinoBitrate = 115200;
//Set update rate of analog pins in miliseconds (lower value increases CPU usage).
var updateRate = 50;
//Debug mode logs into console object data on send (buttons send on click).
var debugMode = true;

//PORT DETECTION + LOADER PORT LIST
var loaderCtaPort = defaultSerialPort;
// ID of the connection, defined once.
var involtID;

var onGetDevices = function(ports) {
  //create list of ports and print it to console 
  console.log("Available port list:");

  for (var j=0; j<ports.length; j++) {
    console.log(ports[j].path);
    //create port buttons for loader
    if (loaderOnLaunch){
      $(".loader-ports").append('<p>'+ports[j].path+'</p>');

      //change selected port when clicked
      $(".loader-ports > p").click(function() {
        $(".loader-ports > p").removeClass("active-port");
        $(this).addClass("active-port");
          loaderCtaPort = $(this).html();
      });

    }
  }
}

//Function when connecting to Arduino
var onConnect = function(connectionInfo) {
  //Error message
  if (!connectionInfo) {
    console.error('Could not open, check if Arduino is connected or try other serial port', "ヽ༼ຈل͜ຈ༽ﾉ RIOT ヽ༼ຈل͜ຈ༽ﾉ");
    return;
  }
  //Remove loader if connection is successful + hack for knob and slider
  else {
    $("#loader-bg").remove();
    $(".knob, .knob-send, .rangeslider").show();
  }

  console.log("Device connected:", loaderCtaPort);

  this.connectionId = connectionInfo.connectionId;

  console.log("Involt connection ID:", connectionInfo.connectionId);

  involtID = connectionInfo.connectionId;

}

//get the port list for loader
chrome.serial.getDevices(onGetDevices);

//LOADER
if(loaderOnLaunch){
  $(document).ready(function() {
    //hack for UI elements that somehow shows on loader background
    $(".knob, .knob-send, .rangeslider").hide();
    //create loader elements
    $("body").prepend('<div id="loader-bg"><div id="loader"></div></div>');
      $("#loader").append('<div id="loader-logo"><img src="img/logo.png" alt="" /></div><div>Please select your device:</div><div class="loader-ports"></div><div id="loader-button">Connect</div>');
    //connect button
    $("#loader-button").click(function() {
      chrome.serial.connect(loaderCtaPort, {bitrate: arduinoBitrate}, onConnect);
    });
  });

}
else{
  chrome.serial.connect(defaultSerialPort, {bitrate: arduinoBitrate}, onConnect);
}

//IDENTIFY INVOLT OBJECTS AND DEFINE THEIR PARAMETERS

//analog pins values (real time update)
var analogPins = [];
//digital pins values (digital and PWM)
var digitalPins = [];
//identify involt elements
$(document).ready(function() {

  $(".ard").not(".custom-write").each(function(index, el) {

    var $t = $(this);

    //read the classes of element and add them to object data
    var splitCss = $t.attr('class').split(' ');
    //index of the .ard class which defines Involt object
    var ardIndex = splitCss.indexOf("ard");

    //define arduino pin
    var pin       = splitCss[ardIndex+2];
    var pinNumber = parseInt(pin.substring(1,pin.length));
    $t.data("pin", pin).data("pinNumber", pinNumber);

    var value = splitCss[ardIndex+3];
    //define value parameter
    if (typeof value !== 'undefined') {
      //split if there are two values
      var valueSplit = value.split("-");
      //check if they are numbers and convert
      for (var i = 0; i < valueSplit.length; i++){
        var valueCheck = isNaN(valueSplit[i]);
        if (valueCheck == false) {
          valueSplit[i] = parseInt(valueSplit[i]);
        };
      };

      $t.data("value", valueSplit[0]);

      if (valueSplit.length > 1){
        $t.data("value2", valueSplit[1]);
      };
    };

    //add values to array
    if (pin.indexOf("A")<0){
      //define default value for digital pins
      digitalPins[pinNumber] = $t.data("value");
    }
    else if (pin.indexOf("A") == 0){
      //define analog pins variables
      analogPins[pinNumber] = pinNumber;
    };

    //find the range and step parameters and add them to data
    for (var i = 0; i < splitCss.length; i++) {

      if (splitCss[i].indexOf("range-") == 0) {
        var range = splitCss[i].split('-');
          $t.data('min', parseInt(range[1])).data('max', parseInt(range[2]));
      }

      else if (splitCss[i].indexOf("step-") == 0) {
        var step = splitCss[i].split('-');
          $t.data('step', parseInt(step[1]));
      };

    };

    //log the data on debug
    if(debugMode) console.log($t.data());

  });

  //HTML GENERATED ELEMENTS OF FRAMEWORK
  //html/css operations that create framework objects in html file 
  //bar
  $(".bar").append('<div class="bar-value"><div>Loading...</div></div>');
  $(".bar-value").each(function() {
    $(this).css('max-width', parseInt($(this).css('width')));
  });
 
  //knob
  $(".knob").append(function() {
    var knobMax  = $(this).data('max');
    var knobMin  = $(this).data('min');
    $(this).append('<input type="text" data-width="180" data-height="180" data-fgColor="#0099e7" data-inputColor="#282828;" data-max="'+knobMax+'" data-min="'+knobMin+'" data-readOnly="true" value="0" class="knob-read">'); 
    $(this).children('.knob-read').data($(this).data());
  });

  //knob-send
  $(".knob-send").append('<input type="text" data-width="180" data-height="180" data-fgColor="#0099e7" data-inputColor="#282828;" data-displayPrevious="true" data-angleOffset="-140" data-angleArc="280" class="knob-write">'); 

  //rangeslider
  $(".rangeslider").append('<div class="rangeval"></div><input type="text" class="range"/><div class="tooltip">slide</div>');

  $(function() {
    $(".knob-read").knob();
  });

  //increase/decrease + and - when empty text
  $(".increase").each(function() {
    if($(this).html() == '') $(this).html("+").css('font-size', '30px');
  });
  $(".decrease").each(function() {
    if($(this).html() == '') $(this).html("-").css('font-size', '30px');
  });

  //toggle ON/OFF when empty
  $(".toggle").each(function() {
    var $t = $(this);
    if ($t.data("value") == 0){
      if($t.html() == '') $t.html("OFF").addClass('inactive');
    }
    else if ($t.data("value") == 1){
      if($t.html() == '') $t.html("ON");
    };
  });
  
});

//INVOLT JQUERY METHODS

(function($) {

  $.fn.sendValue = function(value){

    return this.each(function() {
      var $t = $(this);
      if (typeof value === 'undefined') {
        arduinoSend($t.data("pin"), digitalPins[$t.data("pinNumber")]);
      }
      else{
        arduinoSend($t.data("pin"), value);
      };
    });

  };

  $.fn.updateValue = function(newValue){

    return this.each(function() {
      var $t = $(this);
      if (typeof newValue === 'undefined') {
        digitalPins[$t.data("pinNumber")] = $t.data("value");
      }
      else{
        var valueCheck = isNaN(newValue);
        if(valueCheck == false) parseInt(newValue);
          digitalPins[$t.data("pinNumber")] = newValue;
          $t.data("value", newValue);
      };
    });

  };
  
  $.fn.sendString = function(string){

    var directSend = string+"\n";
      chrome.serial.send(involtID, sendConvertString(directSend), onSend);
        return this;

  }

  $.fn.pinDefine = function(pin){

    return this.each(function() {

      $(this).data("pin", pin).data("pinNumber", parseInt(pin.substring(1,pin.length)));

    });

  };

  $.fn.pinSwap = function(newPin){

    return this.each(function() {

      var $t = $(this);
      var previousPin = $t.data("pinNumber");

      $t.data("pin", newPin);
      $t.data("pinNumber", parseInt(newPin.substring(1,newPin.length)));

      //check if the new pin value is defined - if not - put the previous value
      if (typeof digitalPins[$t.data("pinNumber")] == 'undefined') {
        digitalPins[$t.data("pinNumber")] = digitalPins[previousPin];
      }

    });

  };

}(jQuery));

//SERIAL DATA READ
var onReceive = function(receiveInfo) {
  //ID test
  if (receiveInfo.connectionId !== involtID) return;
  
  //create array from received arduino data
  var Int8View  = new Int8Array(receiveInfo.data);
  encodedString = String.fromCharCode.apply(null, Int8View);

  //divide encoded string data (pin/value), it also verify the data.
  var Atest = encodedString.indexOf("A");
  var Btest = encodedString.indexOf("E");
  var Ctest = encodedString.indexOf("V");
  var Dtest = encodedString.length;

  /*
    Example block of encoded data (Pin A3 value 872):
    A3V872E
  */

  //corrupted serial data parameters (Based on my observations)
  //remove corrupted serial data from array list
  if (  Atest == 0 && 
        Btest >= 2 && 
        Ctest >= 1 && 
        Dtest >= 4    ) {
    
    //pin counter
    var i = parseInt(encodedString.substring(1,Ctest));

    var stringValue = encodedString.substring(Ctest+1,Btest);
    var stringValueCheck = isNaN(stringValue);

    //count each analog pin number and create array of their values
    if (stringValueCheck == false){
      analogPins[i] = parseInt(stringValue);  
    }
    else {
      analogPins[i] = stringValue; 
    }

  }

};

//READ ONLY EVENTS 
//Updated in 50ms interval to reduce CPU usage
var analogUpdate = function(){

  //show
  $(".show").each(function() {
    $(this).html(analogPins[$(this).data("pinNumber")]);
  });

  //bar
  $(".bar").each(function() {
      var $t = $(this);
      //map the value to bar pixel width
      var bar = {

        maxValue : $t.data('value'),
        maxWidth : parseInt($t.css('width'))

      };
      //scaling the variable
      var widthMap = (bar.maxWidth-0)/(bar.maxValue-0)*(analogPins[$t.data("pinNumber")]-bar.maxValue)+bar.maxWidth;
      //change bar width
      $t.children(".bar-value").css('width', widthMap);
      //display the value
      $t.children(".bar-value").children('div').html(analogPins[$t.data("pinNumber")]);
  });

  //knob
  $(".knob").each(function() {
    $(this).children().children('.knob-read').val(analogPins[$(this).data("pinNumber")]).trigger('change');
  });

  //value
  $(".value").each(function() {
    $(this).attr('value', analogPins[$(this).data("pinNumber")]);
  });

}

setInterval(analogUpdate, updateRate);

//Error message when connection is interrupted
var onError = function (errorInfo) {
  console.error("Received error on serial connection: " + errorInfo.error);
};

chrome.serial.onReceive.addListener(onReceive);

chrome.serial.onReceiveError.addListener(onError);

//SERIAL DATA SEND
//Events triggered on action

//Empty function for testing
var onSend = function(){
  if(debugMode){
    console.log(ardSend);
    console.log(digitalPins);
  }
}

//get object pin from data
var definePin = function(pinData){

    pinIndex  = pinData["pinNumber"];
    pin       = pinData["pin"];

}

//Sends data to arduino based on event
var arduinoSend = function(pin, value){

  ardSend = pin+"V"+value+"\n";
  
  chrome.serial.send(involtID, sendConvertString(ardSend), onSend);

}

//convert "ardSend" string to arduino serial-friendly format
var sendConvertString = function(ardSend) {

  var buf      = new ArrayBuffer(ardSend.length);
  var bufView  = new Uint8Array(buf);

  for (var i   = 0; i < ardSend.length; i++) {
    bufView[i] = ardSend.charCodeAt(i);
  }
  return buf;

}

$(document).ready(function() {

  //button
  $(".button").click(function() {
    var $t = $(this);
    digitalPins[$t.data("pinNumber")] = $t.data("value");
      $t.sendValue();
  });

  //toggle
  $(".toggle").click(function() {
    var $t = $(this);
    var index = $t.data('pinNumber');
    if (digitalPins[index] == 0){
      if ($t.html() == "OFF") {
        $t.html("ON");
      }
      digitalPins[$t.data('pinNumber')] = 1;
        $t.sendValue();
    }
    else if (digitalPins[index] == 1){
      if ($t.html() == "ON") {
        $t.html("OFF");
      }
        digitalPins[$t.data('pinNumber')] = 0; 
          $t.sendValue();    
    }
    $t.toggleClass('inactive');

  });

  //toggle-pwm
  $(".toggle-pwm").each(function() {
    var $t = $(this);

    $t.click(function() {
      $t.toggleClass('state2');

      if ($t.hasClass('state2')) {
        digitalPins[$t.data("pinNumber")] = $t.data('value2');
          $t.sendValue();
      }
      else {
        digitalPins[$t.data("pinNumber")] = $t.data('value');
          $t.sendValue();        
      }
    });
  });

  //increase
  $(".increase").click(function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      digitalPins[index] = digitalPins[index]+$t.data("step");
      digitalPins[index] = Math.min(Math.max(digitalPins[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //decrease
  $(".decrease").click(function() {
    var $t = $(this);
    var index = $t.data("pinNumber");

      digitalPins[index] = digitalPins[index]-$t.data("step");
      digitalPins[index] = Math.min(Math.max(digitalPins[index], $t.data("min")), $t.data("max"));
        $t.sendValue(); 
  });

  //hover
  $(".hover").hover(function() {
    definePin($(this).data());
    digitalPins[pinIndex] = $(this).data("value");
      arduinoSend(pin, digitalPins[pinIndex]);
  }, function() {
    definePin($(this).data());
    digitalPins[pinIndex] = $(this).data("value2");
      arduinoSend(pin, digitalPins[pinIndex]);
  });

  //knob-send (plugin function)

  $(".knob-send").each(function() {
    //definePin will not work
    var $t = $(this);
      var index = $t.data("pinNumber");
      var currentValue = $t.data("value");
        $t.children('.knob-write').val(currentValue).data($t.data());
    $t.children('.knob-write').knob({
      'min':  $t.data("min"),
      'max':  $t.data("max"),
      'step': $t.data("step"),
      'change' : function (value) {
        digitalPins[index] = value;
          $t.sendValue();
      }
    });
  });

  //custom-button
  $(".custom-button").click(function() {
    var customBut = $(this).data("pin");
      chrome.serial.send(involtID, sendConvertString(customBut), onSend);
  });

  //input-write
  $(".input-write").change(function() {
    var $t = $(this);
    digitalPins[$t.data("pinNumber")] = $t.val();
      $t.sendValue();
  });

  //custom-write
  $(".custom-write").change(function() {
    var valCustom = $(this).val();
    var valCustomSend = valCustom+"\n";
      chrome.serial.send(involtID, sendConvertString(valCustomSend), onSend);
  });

  //checkbox
  $(".checkbox").change(function() {
    var $t = $(this);
    if (this.checked) {
      digitalPins[$t.data("pinNumber")] = $t.data("value");
        $t.sendValue(); 
    }
    else {
      digitalPins[$t.data("pinNumber")] = $t.data("value2");
        $t.sendValue();
    }
  });

  //radio 
  $(".radio").change(function() {
    var $t = $(this);
    if (this.checked) {
      digitalPins[$t.data("pinNumber")] = $t.data("value");
        $t.sendValue(); 
    }
  });
  
  //slider (simple-slider plugin)
  $(".rangeslider").each(function() {
    var $t = $(this);
    $t.children('.tooltip').hide();

    //define range element
    $t.children('.range').simpleSlider({
      range    :[$t.data("min"),$t.data("max")],
      step     :$t.data("step"),
      snap     :true,
      highlight:true
    });
    //do something on change
    $t.children('.range').bind("slider:changed", function (event, data) {
      var $tc = $(this);
      //display value
      $tc.siblings('.tooltip').html(data.value);
      $tc.parent().siblings('.rangeval').html(data.value);

        //position of tooltip
        var tooltipPosition = $tc.siblings('.slider').children('.dragger').css('left');
        $tc.siblings('.tooltip').css('left', tooltipPosition);

      digitalPins[$t.data("pinNumber")] = parseInt(data.value);
        $t.sendValue();
    });

    //toggle tooltip on hover
    $t.hover(function() {
      $t.children('.tooltip').fadeIn(250);
    }, function() {
      $t.children('.tooltip').fadeOut(250);
    });

  });

});