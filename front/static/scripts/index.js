const mainContainer = document.getElementById('content-container');
const { credentialForm } = document;

// Отлавливаем нажатие на ссылки в форме credentialForm
credentialForm.addEventListener('click', async (event) => {
  // event.preventDefault();
  let response;
  switch (event.target.id) {
    case 'logoutLink':
      window.location = '/logout';
      break;
    case 'profileLink': {
      const login = event.target.href.replace(/.*[/]([^/]+)$/gi, '$1');
      response = await fetch(`/api/users/${login}`);
      break;
    }
    default:
      response = undefined;
      break;
  }
  if (response) {
    const responseHTML = await response.text();
    mainContainer.innerHTML = responseHTML;
  }
});

// Просматриваем Custom нажатия
document.addEventListener('submit', async (event) => {
  console.log(event);
  // Нажимаем на подтверждение регистрации
  if (event.submitter.id === 'regAcceptBtn') {
    event.preventDefault();
    const { login, email, password, checkpassword } = event.target;
    console.log(login, email, password);
    if (password.value === checkpassword.value) {
      const data = {
        login: login.value,
        email: email.value,
        password: password.value,
      };
      const response = await fetch(event.target.action, {
        method: event.target.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const responseHTML = await response.text();
      if (responseHTML.includes('Error')) {
        mainContainer.innerHTML = responseHTML;
      } else {
        document.body.innerHTML = responseHTML;
      }
      const nextURL = '/sounds';
      const nextTitle = '';
      const nextState = {};
      window.history.replaceState(nextState, nextTitle, nextURL);
    } else {
      document.getElementById('warningInfo').innerText = 'Пароли не совпадают';
    }
  }

  if (event.submitter.id === 'addFile') {
    // const data
  }
});
