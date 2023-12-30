var emailError = document.getElementById('emailerror');
var passwordError = document.getElementById('passworderror');
var submitError = document.getElementById('submiterror');

function validatEmail(){
var email = document.getElementById('signin-email').value;
 
if(email.length === 0){
   emailError.innerHTML=' password should not be blank';
   setTimeout(function () {
    emailError.style.display = 'none';
  }, 3000);
   return false;
}
if(!email.match(/^[A-Za-z0-9._-]+@[A-Za-z]+\.[a-z]{2,4}$/)){
   emailError.innerHTML = 'invalid',
   setTimeout(function () {
    emailError.style.display = 'none';
  }, 3000);

   return false;
}
// emailError.innerHTML= ' Valid'
return true;

}

function validatpass(){
   var pass= document.getElementById('signin-password').value.trim();
   if(pass.length === 0){
       passwordError.innerHTML=' invalid password'
       setTimeout(function () {
        passwordError.style.display = 'none';
      }, 3000);
       return false;
   }
  
//    passwordError.innerHTML= ' Valid'
   return true;
  
  }

  function validForm() {
   if (!validatEmail() || !validatpass()) {
     submitError.style.display = 'block';
     submitError.innerHTML = 'please Enter your detials';
     setTimeout(function () {
       submitError.style.display = 'none';
     }, 3000);
    
     return false;
     
   }
   return true;
 }
   


 //<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>

//otp form validation


  function validateOTP() {
      var otpInput = document.getElementById("otp");
      var otpValue = otpInput.value;

      // Check if OTP is exactly 6 digits
      if (otpValue.length !== 6 || isNaN(otpValue)) {
          alert("Please enter a valid 6-digit OTP.");
          return false;
      }

      // You can add additional validation if needed

      return true;
  }


 

