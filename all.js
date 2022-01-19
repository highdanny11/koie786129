
// 初始化
let stationData = [];
let filterData = [];
// DOM
const list = document.querySelector(".list");
let map;
// 初始化
function init(){
  getLocation()
}

// https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?%24spatialFilter=nearby(22.604910084532914%2C%20120.30015439433049%2C%201000)&%24format=JSON
init();
function getLocation(){
  navigator.geolocation.getCurrentPosition(function (position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    // getStationData(lat, lon);
    getStationData(22.604910084532914, 120.30015439433049);
    initMap(22.604910084532914, 120.30015439433049);
  });
}
function initMap(lat,lon){
  map = L.map('map').setView([lat, lon], 15);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiZ29uc2Frb24iLCJhIjoiY2t4ZDZ3bXI3M2RlZDJvcG1lMmQzbnVqMyJ9.mjEj2o2Q2hq8KKGNoIuzxw'
  }).addTo(map);

  var myIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
   
  });
  L.marker([lat, lon], { icon: myIcon }).addTo(map);
}
function getStationData(lat,lon){
  console.log(lat, lon)
  console.log(getAuthorizationHeader());
  axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bike/Station/NearBy?%24spatialFilter=nearby(${lat}%2C%20${lon}%2C%201000)&%24format=JSON`,
    {
      headers: getAuthorizationHeader()
    })
  .then(function(response){
    stationData = response.data;
    getAvailableData(lat,lon);
  })
 
}

function getAvailableData(lat,lon){
  axios.get(`https://ptx.transportdata.tw/MOTC/v2/Bike/Availability/NearBy?%24spatialFilter=nearby(${lat}%2C%20${lon}%2C%201000)&%24format=JSON`,{
    header: getAuthorizationHeader()
  })
  .then(function(response){
    const availableData = response.data;
    console.log(availableData);
    availableData.forEach(function (availableItem){
      stationData.forEach(function(stationItem){
        if (availableItem.StationUID == stationItem.StationUID && availableItem.ServiceStatus == 1){
          // 組物件資料
          let obj = {};
          obj.sationUID = availableItem.StationUID;
          obj.name = stationItem.StationName.Zh_tw;
          obj.availableRentBikes = availableItem.AvailableRentBikes;
          obj.availableReturnBikes = availableItem.AvailableReturnBikes
          obj.lat = stationItem.StationPosition.PositionLat;
          obj.lon = stationItem.StationPosition.PositionLon;
          filterData.push(obj);
        }
      })
    })
    // 繪製內容
    renderFilterData();
    // 把 marker 一一的放上地圖
    filterData.forEach(function(item){
      L.marker([item.lat,item.lon]).addTo(map)
      .bindPopup(item.name)
    })
  })
}

function renderFilterData(){

  let str = "";
  filterData.forEach(function(item){
    str += `<li><a href="https://www.google.com/maps/place/${item.lat}, ${item.lon}" target="_blank">路線導航</a>${item.name}，可租：${item.availableRentBikes}、可還：${item.availableReturnBikes} </li>`
  })
  list.innerHTML = str;
}


function getAuthorizationHeader() {
  //  填入自己 ID、KEY 開始
  let AppID = '4ad9f73726a0409a9376afd2b59e59a7';
  let AppKey = 'pijXHpnIPxeb7VBTtdxDl7cbk6o';
  //  填入自己 ID、KEY 結束
  let GMTString = new Date().toGMTString();
  let ShaObj = new jsSHA('SHA-1', 'TEXT');
  ShaObj.setHMACKey(AppKey, 'TEXT');
  ShaObj.update('x-date: ' + GMTString);
  let HMAC = ShaObj.getHMAC('B64');
  let Authorization = 'hmac username=\"' + AppID + '\", algorithm=\"hmac-sha1\", headers=\"x-date\", signature=\"' + HMAC + '\"';
  return { 'Authorization': Authorization, 'X-Date': GMTString };
}

