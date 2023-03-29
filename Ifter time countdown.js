const bnNum=['০','১','২','৩','৪','৫','৬','৭','৮','৯'];const countdownWrapper=document.querySelectorAll(".countdown-area .countdown div");function enToBn(n){const numbers=n.toString().split('');return numbers.map(i=>bnNum[i]).join('');}
function renderCountdown(end){const tl=end.getTime()-Date.now();if(tl<0)return tl;const h=Math.floor((tl%(1000*60*60*24))/(1000*60*60));const m=Math.floor((tl%(1000*60*60))/(1000*60));const s=Math.floor((tl%(1000*60))/1000);const times=[h,m,s];countdownWrapper.forEach((el,i)=>{el.querySelector('p').textContent=enToBn(times[i]);});return tl;}
function showCountdown(end){renderCountdown(end);const countdown=setInterval(function(){const tl=renderCountdown(end);if(tl<0){clearInterval(countdown);}},1000);return countdown;}



