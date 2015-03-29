setInterval(function(){ 
	
	$(".square").css({
		"width": analogPins[0],
		"height": analogPins[0],
		"transform": "rotate("+analogPins[1]+"deg)"
	});

},50);