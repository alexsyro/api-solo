const textArea = document.getElementById('text');
const messageTable = document.getElementById('message-table');
const URL = 'http://localhost:3000';

const socket = io(URL, { autoConnect: true });
const currentChat = 'Общий';

const weatherState = {
  clear: 'ясно',
  'partly-cloudy': 'малооблачно',
  cloudy: 'облачно с прояснениями',
  overcast: 'пасмурно',
  drizzle: 'морось',
  'light-rain': 'небольшой дождь',
  rain: 'дождь',
  'moderate-rain': 'умеренно сильный дождь',
  'heavy-rain': 'сильный дождь',
  'continuous-heavy-rain': 'длительный сильный дождь',
  showers: 'ливень',
  'wet-snow': 'дождь со снегом',
  'light-snow': 'небольшой снег',
  snow: 'снег',
  'snow-showers': 'снегопад',
  hail: 'град',
  thunderstorm: 'гроза',
  'thunderstorm-with-rain': 'дождь с грозой',
  'thunderstorm-with-hail': 'гроза с градом',
};

// Смотрим все события
socket.onAny((event, ...args) => {
  if (event === 'user:weather') {
    const [forecast] = args;
    const weatherDiv = document.createElement('div');
    const p = document.createElement('p');
    p.innerText = `Сегодня в ${forecast.geo_object.locality.name} ${
      forecast.fact.temp
    }🌡️, ощущается, как ${forecast.fact.feels_like}🌡️, влажность: 💦${
      forecast.fact.humidity
    }%, сейчас на улице ${weatherState[forecast.fact.condition] || 'нормально'}`;
    weatherDiv.append(p);
    weatherDiv.setAttribute('class', 'weatherDiv');
    messageTable.append(weatherDiv);
    console.log(p);
  }
  console.log(event, args);
});

// При присоединении пользователя
socket.on('user:connected', (data) => {
  console.log('AAAAAAAA', data);
  const paragraph = document.createElement('p');
  paragraph.setAttribute('class', 'info');
  paragraph.innerHTML = data.message;
  messageTable.append(paragraph);
});

// Новое сообщение от кого-то
socket.on('chat:getMessage', (messData) => {
  console.log('New MESSAGE', messData);
  const divMessage = document.createElement('div');
  divMessage.setAttribute('class', 'message-box');
  const divMessageInfo = document.createElement('div');
  divMessageInfo.setAttribute('class', 'message-info');
  const date = document.createElement('p');
  date.setAttribute('class', 'date');
  date.innerHTML = messData.date;
  divMessageInfo.append(date);
  const login = document.createElement('p');
  login.setAttribute('class', 'login');
  login.innerHTML = messData.login;
  divMessageInfo.append(login);
  divMessage.append(divMessageInfo);
  const message = document.createElement('p');
  message.setAttribute('id', 'message');
  message.innerHTML = messData.message;
  divMessage.append(message);
  messageTable.append(divMessage);
});

document.addEventListener('click', (event) => {
  if (event.target.id === 'sendText') {
    if (currentChat === 'Общий') {
      console.log('SSSSSSS', textArea.value);
      socket.emit('chat:all:sendMessage', textArea.value);
    }
    textArea.value = '';
  }
});
