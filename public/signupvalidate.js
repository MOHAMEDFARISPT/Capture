
//user signup validation
//<<<<<<<<<<<<>>>>>>>>>>>>>
var firstnameError = document.getElementById('firstnameError');
var lastnameError = document.getElementById('lastnameError');
var contactError = document.getElementById('contactError');
var emailError = document.getElementById('emailError');

var submitError = document.getElementById('submitError');

function validateFirstname() {
  var firstname = document.getElementById('register-fname').value.trim();

  if (firstname.length === 0) {
    firstnameError.innerHTML = 'First name should not be blank';
   
    return false;
  
  }
  if (!firstname.match(/^[a-zA-Z]+$/)) {
    firstnameError.innerHTML = 'Invalid first name';
    
    return false;
  }
  firstnameError.innerHTML = '';
  return true;
}

function validateLastname() {
  var lastname = document.getElementById('register-lname').value.trim();

  if (lastname.length === 0) {
    lastnameError.innerHTML = 'Last name should not be blank';
    
    return false;
  }
  if (!lastname.match(/^[a-zA-Z]+$/)) {
    lastnameError.innerHTML = 'Invalid last name';
   
    return false;
  }
  lastnameError.innerHTML = '';
  return true;
}

function validateContact() {
  var contact = document.getElementById('register-contact').value.trim();

  if (contact.length === 0) {
    contactError.innerHTML = 'Contact should not be blank';
    
    return false;
  }if (!contact.match(/^[0-9]+$/)) {
    contactError.innerHTML = 'Invalid phone number (only numbers are allowed)';
    
    return false;
}
  // Add your contact validation logic here if needed
  contactError.innerHTML = '';
  return true;
}

function validateEmail() {
  var email = document.getElementById('register-email').value.trim();

  if (email.length === 0) {
    emailError.innerHTML = 'Email should not be blank';
    
    return false;
  }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    emailError.innerHTML = 'Invalid email address';
   
    return false;
  }
  emailError.innerHTML = '';
  return true;
}



function validateForm() {
  return (
    validateFirstname() &&
    validateLastname() &&
    validateContact() &&
    validateEmail()
  );
}

document.getElementById("myForm").addEventListener("submit", function (event) {
  // Your validation logic goes here
  if (!validateForm()) {
    event.preventDefault(); // Prevent form submission if validation fails
    submitError.style.display = 'block';
    submitError.innerHTML = 'Please enter your details correctly.';
    setTimeout(function () {
      submitError.style.display = 'none';
    }, 3000);
  }
});

//user login validation
//<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>




