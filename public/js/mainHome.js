const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signInInfo = document.getElementById('signInInfo');
const signUpInfo = document.getElementById('signUpInfo');
const signUpContainer = document.getElementById('sign-up-container')
const signInContainer = document.getElementById('sign-in-container')

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

signInInfo.addEventListener('click',() => {
	signUpContainer.classList.remove("send-front");
	signInContainer.classList.add("send-front");
	container.classList.toggle("right-panel-active");
});

signUpInfo.addEventListener('click',() => {
	signUpContainer.classList.add("send-front");
	signInContainer.classList.remove("send-front");
	container.classList.toggle("right-panel-active");
});