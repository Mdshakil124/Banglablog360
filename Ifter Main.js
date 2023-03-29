const bnMonths = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
const bnDays = [['রবিবার', 'রবি'], ['সোমবার', 'সোম'], ['মঙ্গলবার', 'মঙ্গল'], ['বুধবার', 'বুধ'], ['বৃহস্পতিবার', 'বৃহ.'], ['শুক্রবার', 'শুক্র'], ['শনিবার', 'শনি']];

const ramadanNoField = document.querySelector('.ramadan-day span:first-child');
const endTimeWrapper = document.querySelector('.countdown-area .time');
const endTimeField = document.querySelectorAll('.countdown-area .time span');
const tooltip = document.querySelector('.tooltip');
const countdownField = document.querySelector('.countdown-area .countdown');
const timeName = document.querySelector('.district > p');

const today = new Date();
const todaysDate = getDateStr(today);
const todaysPrayerTime = getPrayerTime(todaysDate);
let todaysSehri = null;
let todaysIftar = null;
let countdownInterval = null;
let d = null;if (localStorage.getItem('campaign-district')) {
   d = getDistrictByName(localStorage.getItem('campaign-district')) ? getDistrictByName(localStorage.getItem('campaign-district')) : getDistrictByName('Dhaka');
} else {
   d = getDistrictByName('Dhaka');
   tooltip.classList.remove('hide');
}

document.getElementById('district-dropdown').onclick = function() {
   tooltip.classList.add('hide');
   if (!localStorage.getItem('campaign-district')) {
      localStorage.setItem('campaign-district', 'Dhaka');
   }
}

document.getElementById('district-dropdown').onchange = function() {
   localStorage.setItem('campaign-district', this.value);
   d = getDistrictByName(this.value);
   updateTableRow();

   if (todaysPrayerTime) {
      showEndTime();
   }
}



/* ONLOAD AREA */
document.getElementById('district-dropdown').querySelectorAll('option').forEach(i => {
   if (i.value == d.name) {
      i.selected = true;
   }
});

updateTableRow();

if (todaysPrayerTime) {
   todaysSehri = new Date(todaysPrayerTime.sehri);
   todaysIftar = new Date(todaysPrayerTime.maghrib);

   showEndTime();
}
/* ONLOAD AREA END */

function getEndTime(t, zone) {
   return new Date(t.getTime() + (60000 * zone));
}

function showEndTime() {
   const sehri = getEndTime(todaysSehri, d.sehri);
   const iftar = getEndTime(todaysIftar, d.iftar);

   const tomorrow = new Date((new Date()).setDate(today.getDate() + 1));
   const tomorrowsSehri = getPrayerTime(getDateStr(tomorrow));

   const countdownStart = subHour(iftar, 2);

   if (countdownStart.getTime() < Date.now() && Date.now() < addMinute(iftar, 30).getTime()) {
      timeName.innerHTML = `জেলায় <strong>ইফতার</strong> শুরু`;
      countdownField.classList.remove('hide');
      endTimeWrapper.classList.add('hide');

      ramadanNoField.textContent = enToBn(todaysPrayerTime.ramadan);

      clearInterval(countdownInterval);
      countdownInterval = showCountdown(iftar);
   } else {
      countdownField.classList.add('hide');
      endTimeWrapper.classList.remove('hide');
   }

   if (sehri.getTime() > Date.now()) {
      timeName.innerHTML = `জেলায় <strong>সাহ্‌রি</strong> শেষ`;
      endTimeField[0].textContent = "ভোর";
      endTimeField[1].textContent = enToBn(withZero(get12h(sehri.getHours())));
      endTimeField[2].textContent = enToBn(withZero(sehri.getMinutes()));

      ramadanNoField.textContent = enToBn(todaysPrayerTime.ramadan);
   } else if (sehri.getTime() < Date.now() && iftar.getTime() > Date.now()) {
      timeName.innerHTML = `জেলায় <strong>ইফতার</strong> শুরু`;
      endTimeField[0].textContent = "সন্ধ্যা";
      endTimeField[1].textContent = enToBn(withZero(get12h(iftar.getHours())));
      endTimeField[2].textContent = enToBn(withZero(iftar.getMinutes()));

      ramadanNoField.textContent = enToBn(todaysPrayerTime.ramadan);
   } else if (addMinute(iftar, 30).getTime() < Date.now() && tomorrowsSehri) {
      const tomorrowsSehriEnd = getEndTime(new Date(tomorrowsSehri.sehri), d.sehri);
      timeName.innerHTML = `জেলায় <strong>সাহ্‌রি</strong> শেষ`;
      endTimeField[0].textContent = "ভোর";
      endTimeField[1].textContent = enToBn(withZero(get12h(tomorrowsSehriEnd.getHours())));
      endTimeField[2].textContent = enToBn(withZero(tomorrowsSehriEnd.getMinutes()));

      ramadanNoField.textContent = enToBn(tomorrowsSehri.ramadan);
   }
}

function updateTableRow() {
   const rows = document.querySelectorAll('tbody tr');

   rows.forEach((row, i) => {
      const tds = row.querySelectorAll('td');

      const prayerTime = prayer[i];
      const prayerDate = new Date(prayerTime.date);

      const fajr = new Date(prayerTime.fajr);
      const sehri = getEndTime(new Date(prayerTime.sehri), d.sehri);
      const iftar = getEndTime(new Date(prayerTime.maghrib), d.iftar);

      tds[0].textContent = enToBn(withZero(++i));
      tds[1].textContent = `${enToBn(prayerDate.getDate())} ${bnMonths[prayerDate.getMonth()]}, ${bnDays[prayerDate.getDay()][0]}`;
      tds[2].textContent = `${enToBn(get12h(sehri.getHours()))}-${enToBn(withZero(sehri.getMinutes()))} মি.`;
      tds[3].textContent = `${enToBn(get12h(fajr.getHours()))}-${enToBn(withZero(fajr.getMinutes()))} মি.`;
      tds[4].textContent = `${enToBn(get12h(iftar.getHours()))}-${enToBn(withZero(iftar.getMinutes()))} মি.`;

      if (i === todaysPrayerTime.ramadan) {
         row.classList.add('row-active');
         return;
      }

      if (i < todaysPrayerTime.ramadan) row.classList.add('prev-ramadan');

      row.classList.remove('row-active');
   });
}

// ad random area


function get12h(n) {
   return n % 12 === 0 ? 12 : n % 12; 
}

function withZero(n) {
   return n.toString().length > 1 ? n : "0" + n;
}

function getDistrictByName(name) {
   return districts.find(i => i.name === name);
}

function getPrayerTime(date) {
   if (prayer.some(day => day.date == date)) {
      return prayer.find(day => day.date == date);
   }
   return false;
}

function getDateStr(date) {
   date = new Date(date),
      month = '' + (date.getMonth() + 1),
      day = '' + date.getDate(),
      year = date.getFullYear();

   if (month.length < 2) month = '0' + month;
   if (day.length < 2) day = '0' + day;

   return [year, month, day].join('-');
}

function addHour(date, h) {
   let r = new Date(date.getTime());
   r.setHours(r.getHours() + h);
   return r;
}

function subHour(date, h) {
   let r = new Date(date.getTime());
   r.setHours(r.getHours() - h);
   return r;
}

function addMinute(date, m) {
   let r = new Date(date.getTime());
   r.setMinutes(r.getMinutes() + m);
   return r;
}

function subMinute(date, m) {
   let r = new Date(date.getTime());
   r.setMinutes(r.getMinutes() - m);
   return r;
}







