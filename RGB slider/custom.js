$(document).ready(function() {
	digitalPins[3] = 0;
	digitalPins[5] = 0;
	digitalPins[6] = 0;
	$(".rangeslider>.range").change(function() {
		var background = digitalPins[3]+","+digitalPins[5]+","+digitalPins[6];
		$(".rgb-square").css('background', "rgb("+background+")");
	});
	
});