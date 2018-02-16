window.onload = function() {
//=== если пользователь авторизован, перенаправляем его на страницу каталога товаров
	if (getCookie("token") !== undefined) {
		window.location.href = '../catalog.html';
	}

//=== переключение между формой авторизации и регистрации
	var btnTransitionRegForm = document.querySelector('.transition-reg-form span');
	var btnTransitionLoginForm = document.querySelector('.transition-login-form span');
	var registrationArea = document.querySelector('.registration-area');
	var loginArea = document.querySelector('.login-area');

	btnTransitionRegForm.addEventListener('click', toggleForm);
	btnTransitionLoginForm.addEventListener('click', toggleForm);

	function toggleForm() {
		registrationArea.classList.toggle('hidden');
		loginArea.classList.toggle('hidden');
	}

//=== регистрация пользователя
	var btnRegistration = document.querySelector('.button-registration');

	btnRegistration.onclick = function() {
		var loginRegistration = document.querySelector('input[name="username-registration"]').value;
		var passwordRegistration = document.querySelector('input[name="password-registration"]').value;
		var confirmPasswordRegistration = document.querySelector('input[name="confirm-password-registration"]').value;
		var errorRegistration = document.querySelector('.error-registration')
		if (loginRegistration == "" || passwordRegistration == "" || confirmPasswordRegistration == ""){
			errorRegistration.innerHTML = "All the fields must be filled!";
		} else if (passwordRegistration != confirmPasswordRegistration) {
			errorRegistration.innerHTML = "Passwords do not match!";
		} else {
			var paramsRegistration = JSON.stringify({"username":loginRegistration, "password":passwordRegistration});		

			ajax('POST', 'http://smktesting.herokuapp.com/api/register/', false, paramsRegistration, 201, function(){
				var answerRegistration = JSON.parse(request.responseText);
				// Проверка подтверждения 
				if (answerRegistration["success"] === true) {
					// сохраняем токен в куки
			 		setCookie("token", answerRegistration["token"]);
			 		setCookie("name", loginRegistration);
			 		// выводим сообщение об успешной регистрации
			 		showMessage('Thank you! Registration completed successfully!');
			 		// перенаправляем на страницу каталога
			 		setTimeout(function() {
			 			window.location.href = '../catalog.html';
			 		}, 1000);
				} else {
					showMessage('An unexpected error has occurred! Try again!');
				}
			});
		}
	}  

//=== авторизация пользователя
	var btnLogin = document.querySelector('.button-login');

	btnLogin.onclick = function() {
		var loginLogin = document.querySelector('input[name="username-login"]').value;
		var passwordLogin = document.querySelector('input[name="password-login"]').value;
		var errorLogin = document.querySelector('.error-login')
		if (loginLogin == "" || passwordLogin == ""){
			errorLogin.innerHTML = "All the fields must be filled!";
		} else {
			var paramsLogin = JSON.stringify({"username":loginLogin, "password":passwordLogin});		

			ajax('POST', 'http://smktesting.herokuapp.com/api/login/', false, paramsLogin, 200, function(){
				// парсим JSON
				var answerLogin = JSON.parse(request.responseText);
				if (answerLogin["success"] === true) {
					// сохраняем токен в куки
					setCookie("token", answerLogin["token"]);
					setCookie("name", loginLogin);
					// выводит сообщение об успешной авторизации
					showMessage('Thank you! Authorization completed successfully!');
					// перенаправляем на страницу каталога
					setTimeout(function() {
						window.location.href = '../catalog.html';
					}, 1000);
				} else {
					showMessage('Incorrect login or password! Try again!');
				} 
			});	
		}
	}
// модальное окно с сообщением
	function showMessage(data) {
		var messageWindow = document.createElement('div');
		messageWindow.classList.add('message-window');
		messageWindow.innerHTML = '<div class="message">' + data + '</div>'
								+'<button class="button button-message">OK</button>';
		document.body.insertBefore(messageWindow, document.body.children[1]);
		canselMessage();
	}
	function canselMessage(){
		var messageWindow = document.querySelector('.message-window');
		var buttonMessage = document.querySelector('.button-message');
		buttonMessage.onclick = function() {
			messageWindow.classList.add('hidden');
		}
	}
//=======================================================================================
//						AJAX-запрос
//=======================================================================================
	var request = new XMLHttpRequest();

	function ajax(method, url, token, params, status, callback) {
		request.onreadystatechange = function() {
			// проверяем вернулись ли запрошенные данные
			if (request.readyState == 4) {
				// проверяем статус ответа сервера
				if(request.status == status) {
					callback();
				} else {
					// иначе выводим сообщение об ошибке
					showMessage('An error occurred while querying: ' +  request.status + ' ' + request.statusText);
				} 	
			}
		}

		request.open(method, url);
		if (method == "POST") {
			request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
			if (token == true) {
				request.setRequestHeader('Authorization', 'Token ' + getCookie("token"));
			}
		}
		request.send(params);
	}

//=========================================================================================
//                     Работа с cookie
//=========================================================================================
// возвращает cookie с именем name, если есть, если нет, то undefined
	function getCookie(name) {
		var matches = document.cookie.match(new RegExp(
			"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));
		return matches ? decodeURIComponent(matches[1]) : undefined;
	}

	// устанавливает cookie с именем name и значением value
	// options - объект с свойствами cookie (expires, path, domain, secure)
	function setCookie(name, value, options) {
		options = options || {};

		var expires = options.expires;

		if (typeof expires == "number" && expires) {
			var d = new Date();
			d.setTime(d.getTime() + expires * 1000);
			expires = options.expires = d;
		}
		if (expires && expires.toUTCString) {
			options.expires = expires.toUTCString();
		}

		value = encodeURIComponent(value);

		var updatedCookie = name + "=" + value;

		for (var propName in options) {
			updatedCookie += "; " + propName;
			var propValue = options[propName];
			if (propValue !== true) {
				updatedCookie += "=" + propValue;
			}
		}

		document.cookie = updatedCookie;
	}

	// удаляет cookie с именем name
	function deleteCookie(name) {
		setCookie(name, "", {
			expires: -1
		})
	}
}