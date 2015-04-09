$(document).ready(function() {

	$(".t1").click(function() {
		$(".P5").sendValue();
	});
	$(".t2").click(function() {
		$(".P5").pinSwap("P6");
	});
	$(".t2").dblclick(function() {
		$(".P5").pinSwap("P5");
	});
	$(".t3").click(function() {
		$(".P5").updateValue(50);
	});
	$(".t4").click(function() {
		$(this).pinDefine("P6").sendValue(50);
	});
	$(".t5").click(function() {
		$(this).pinDefine("P5").updateValue(3).sendValue().pinSwap("P6").updateValue(8).sendValue();
	});

});