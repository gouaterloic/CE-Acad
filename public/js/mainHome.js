const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const signInInfo = document.getElementById('signInInfo');
const signUpInfo = document.getElementById('signUpInfo');
const signUpContainer = document.getElementById('sign-up-container');
const signInContainer = document.getElementById('sign-in-container');
const forgotPass = document.getElementById('forgot-password');

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

forgotPass.addEventListener('click',() => {
	d = document;
	// Create a modal container div
	parentDiv = container.appendChild(d.createElement('div'));
	parentDiv.classList.add("modalContainer")
	parentDiv.innerHTML = 
	"<form action='/ressetpass' method='POST' autocomplete='off'>" +
	"<h1>Forgot Password</h1>" +
	"<div class='social-container'>" +
		"<img src='/img/logo-transparent.png' alt='CE-Acad logo' width='200'>" +
	"</div>" +
	"<span>A new password will be sent to your email address</span>" +
	"<input type='email' placeholder='Enter Email' name='email'/>" +
	"<a id='ressetPassInfo' href='#'>Remember Password?</a>" +
	"<button>Resset Password</button>" +
	"</form>";
	document.getElementById('ressetPassInfo').addEventListener('click',()=>{
		container.removeChild(document.getElementsByClassName("modalContainer")[0])
	})
})