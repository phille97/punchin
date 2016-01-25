




function start_et() {
   var counter = document.getElementById('time-counter');
   var currentTime = new Date(parseInt(counter.dataset.current));
   var startTime = new Date(parseInt(counter.dataset.date));


   setInterval(function() {
       currentTime.setSeconds(currentTime.getSeconds() + 1);
   }, 1000);


   setInterval(function() {
       var msec = currentTime - startTime;
       var hh = Math.floor(msec / 1000 / 60 / 60);
       msec -= hh * 1000 * 60 * 60;
       var mm = Math.floor(msec / 1000 / 60);
       msec -= mm * 1000 * 60;
       var ss = Math.floor(msec / 1000);
       msec -= ss * 1000;

       counter.innerHTML = `Elapsed time: ${hh} Hours ${mm} Minutes ${ss} Seconds`;
   }, 1000);
}


(function(that) {
		if(/opera/i.test(navigator.userAgent ))
			window.addEventListener("DOMContentLoaded", function(e){ start_et(); }, null );
		else
			window.addEventListener("load", function(e){ start_et(); } );
})(window);
