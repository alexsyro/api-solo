const textArea = document.getElementById('text');
const messageTable = document.getElementById('message-table');
const URL = 'http://localhost:3000';
const messages = {};

const socket = io(URL, { autoConnect: true });
const currentChat = 'Общий';
let selectedUser;

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
    p.innerText = `Сегодня в ${forecast.geo_object.locality.name} ${forecast.fact.temp}🌡️, ощущается, как ${
      forecast.fact.feels_like
    }🌡️, влажность: 💦${forecast.fact.humidity}%, сейчас на улице ${
      weatherState[forecast.fact.condition] || 'нормально'
    }`;
    weatherDiv.append(p);
    weatherDiv.setAttribute('class', 'weatherDiv');
    messageTable.append(weatherDiv);
    console.log(p);
  }
  console.log(event, args);
});

// При присоединении пользователя
socket.on('user:connected', (data) => {
  if (document.getElementsByClassName('contact-info-selected')[0].id === 'all') {
    const paragraph = document.createElement('p');
    paragraph.setAttribute('class', 'info');
    paragraph.innerHTML = data.message;
    messageTable.append(paragraph);
  }
});

const addMessage = (messData) => {
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
  return divMessage;
};

// Новое сообщение от кого-то
socket.on('chat:all:getMessage', (messData) => {
  const [currSelected] = document.getElementsByClassName('contact-info-selected');
  if (currSelected.id === 'all') {
    messageTable.append(addMessage(messData));
  }
});

// На приватное сообщение
socket.on('private', (messData) => {
  const [currSelected] = document.getElementsByClassName('contact-info-selected');
  console.log('selected:', currSelected.id, messData.login);
  if (messages[messData.login]) {
    messages[messData.login].push({ ...messData });
  } else {
    messages[messData.login] = [{ ...messData }];
  }
  if (currSelected.id === messData.login) {
    messageTable.append(addMessage(messData));
  } else {
    const [callingUser] = Array.from(document.getElementsByClassName('user-contact')).filter(
      (elem) => elem.dataset.userlogin === messData.login,
    );
    callingUser.style.color = 'red';
    const statusEl = document.getElementById(`online-${messData.login}`);
    statusEl.innerText = messages[messData.login].length;
  }
});

const sendMessage = () => {
  const [currSelected] = document.getElementsByClassName('contact-info-selected');
  if (currSelected.id === 'all') {
    socket.emit('chat:all:sendMessage', textArea.value);
  } else {
    const messData = socket.emit('private', { to: currSelected.id, message: textArea.value });
    const myMess = { date: new Date(), login: 'Me', message: textArea.value };
    if (messages[currSelected.id]) {
      messages[currSelected.id].push(myMess);
    } else {
      messages[currSelected.id] = [{ ...myMess }];
    }
    messageTable.append(addMessage(myMess));
  }
  textArea.value = '';
};

document.addEventListener('click', async (event) => {
  console.log('EVENT:::', event);
  if (event.target.id === 'sendText') {
    sendMessage();
  }

  // Выбираем контакт
  if (event.target.className === 'user-contact') {
    const [currSelected] = document.getElementsByClassName('contact-info-selected');
    console.log(currSelected.id);
    event.preventDefault();
    if (currSelected.id !== event.target.parentElement.id) {
      messageTable.innerHTML = '';
      const selectedLogin = event.target.parentElement.id;
      if (messages[selectedLogin]) {
        messages[selectedLogin].forEach((mess) => {
          messageTable.append(addMessage(mess));
        });
      } else if (selectedLogin !== 'all') {
        const response = await fetch(`/api/chat/messages/${selectedLogin}`);
        const { messages } = await response.json();
        console.log(messages);
        messages.forEach((mess) => {
          messageTable.append(addMessage(mess));
        });
      }
      Array.from(document.getElementsByClassName('user-contact')).forEach((element) => element.parentElement.setAttribute('class', 'contact-info-unselected'));
      const currUserElement = document.getElementById(`${selectedLogin}`);
      currUserElement.setAttribute('class', 'contact-info-selected');
      const [callingUser] = Array.from(document.getElementsByClassName('user-contact')).filter(
        (elem) => elem.dataset.userlogin === selectedLogin,
      );
      console.log('ccccccccccc', callingUser, document.getElementsByClassName('user-contact'));
      callingUser.style.color = '#0084ff';
      if (selectedLogin !== 'all') {
        const statusEl = document.getElementById(`online-${selectedLogin}`);
        statusEl.innerText = '';
      }
    }
  }
});

textArea.addEventListener('keypress', (key) => {
  if (key.key === 'Enter') {
    sendMessage();
  }
});
