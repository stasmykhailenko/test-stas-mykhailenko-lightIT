window.onload = function() {
//=== скрытие сайдбара ===
	var btnSidebar = document.querySelector('.button-sidebar');
	var sidebar = document.querySelector('.sidebar-catalog');
	
	btnSidebar.addEventListener('click', toggleSidebar);
	window.addEventListener('click', hideSidebar);
	
	function toggleSidebar() {
		sidebar.classList.toggle('hidden');
	}

	function hideSidebar(e) {
		if(!e.target.matches('.sidebar-catalog, .sidebar-catalog *') && !e.target.matches('.button-sidebar, .button-sidebar *')){
			sidebar.classList.add('hidden');
		}
	};
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
				if (answerRegistration["success"] === true) {
					// сохраняем токен в куки
			 		setCookie("token", answerRegistration["token"]);
			 		setCookie("name", loginRegistration);
			 		// выводит сообщение об успешной регистрации
			 		showMessage("Thank you! Registration completed successfully!");
			 		checkLogin();
			 	} else {
					showMessage("An unexpected error has occurred! Try again!");
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
					showMessage("Thank you! Authorization completed successfully!");
					checkLogin();
				} else {
					showMessage("Incorrect login or password! Try again!");
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
//						AJAX-request
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
					if (request.status == 401) {
						showMessage("To be able to leave feedback, please log in!");
						toggleSidebar();
					} else {
						showMessage('An error occurred while querying: ' +  request.status + ' ' + request.statusText);
					}
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
//                                        Работа с cookie
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

// === проверка на то, что пользователь авторизован
	checkLogin();

	function checkLogin() {
		if (getCookie("token") !== undefined) {
			registrationArea.classList.add('hidden');
			loginArea.classList.add('hidden');

			var sidebar = document.querySelector('.sidebar-catalog');
			var dataUser = document.createElement('div');
			dataUser.classList.add('data-user');
			dataUser.innerHTML = '<p class="data-user-name">Hallo, ' + getCookie("name") + '!</p>'
							+'<button class="button button-exit">Exit</a>'
			sidebar.appendChild(dataUser);
			exitSession();
		}
	}
		
	function exitSession() {
		var buttonExit = document.querySelector('.button-exit');

		buttonExit.onclick = function () {
			deleteCookie("token");
			deleteCookie("name");
			var dataUser = document.querySelector('.data-user');
			//var sidebar = document.querySelector('.sidebar-catalog');
			sidebar.removeChild(dataUser);
			loginArea.classList.remove('hidden');
		}
	}

//=== формирование карточки товара
	var productId = window.location.search.replace( '?', '').split("=")[1];

	//=== получение списка товаров и вывод нужного
	ajax('GET', 'http://smktesting.herokuapp.com/api/products/', false, "", 200, function(){
		var products = JSON.parse(request.responseText);
		// выводим товары в каталог
		var product = document.getElementById('product');
		for (var i = 0; i < products.length; i++) {
				if (products[i].id == productId) {
				var productDescription = document.querySelector('.product-description');
				productDescription.innerHTML = '<img src="http://smktesting.herokuapp.com/static/' + products[i].img + '" alt="' + products[i].title + '" class="photo">'
											+'<div><p class="name">' + products[i].title + '</p>'
											+'<p class="text-description">' + products[i].text + '</p></div>';
				product.insertBefore(productDescription, product.children[1]);
			}
		}
		getReviews();
	});
	//=== получение и вывод отзывов о товаре
	function getReviews() {
		ajax('GET', 'http://smktesting.herokuapp.com/api/reviews/' + productId, false, "", 200, function(){
			var reviews = JSON.parse(request.responseText);
			// выводим товары в каталог
			var productReviews = document.getElementById('product-reviews');
			for (var i = 0; i < reviews.length; i++) {
				var review = document.createElement('div');
				review.classList.add('review');
				review.innerHTML = '<p class="review-username">Username: <span>'+ reviews[i].created_by.username +'</span></p>'
											+'<p class="review-rate">Rate: <span>'+ reviews[i].rate +'</span></p>'
											+'<p class="review-text">Review: <span>'+ reviews[i].text +'</span></p>';
				productReviews.appendChild(review);
			}
		});
	}
	//=== AJAX-запрос на сервер (отправка отзыва о товаре)
	var buttonReview = document.querySelector('.button-review');

	buttonReview.onclick = function() {
		var reviewRate = document.querySelector('input[name="review-form-rate"]').value;
		var reviewText = document.querySelector('textarea[name="review-form-text"]').value;
		var errorReview = document.querySelector('.error-review')
		if (reviewRate == "" || reviewText == ""){
			errorReview.innerHTML = 'All the fields must be filled!';
		} else if(reviewRate < 0 || reviewRate > 5 || !Number.isInteger(+reviewRate)) {
			errorReview.innerHTML = 'Оценка должны быть целым числом от 1 до 5 или 0';
		} else {
			var paramsReview = JSON.stringify({"rate":reviewRate, "text":reviewText});

			ajax('POST', 'http://smktesting.herokuapp.com/api/reviews/' + productId, true, paramsReview, 200, function(){
				showMessage('Thank you! Your review has been sent successfully!');
				getReviews();
			});
		}
	}
}