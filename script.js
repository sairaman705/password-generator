const lengthSlider = document.querySelector(".pass-length input"),
  options = document.querySelectorAll(".option input"),
  copyIcon = document.querySelector(".input-box span"),
  passwordInput = document.querySelector(".input-box input"),
  passIndicator = document.querySelector(".pass-indicator"),
  generateBtn = document.querySelector(".generate-btn"),
  encryptBtn = document.querySelector("#encrypt-btn"),
  decryptBtn = document.querySelector("#decrypt-btn"),
  encryptedPasswordInput = document.querySelector("#encrypted-password"),
  decryptedPasswordInput = document.querySelector("#decrypted-password");

const characters = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "^!$%&|[](){}:;.,*+-#@<>~",
};

const aesKey = "1234567890123456"; // AES key (16 characters for AES-128)

// Function to generate password
const generatePassword = () => {
  let staticPassword = "",
    randomPassword = "",
    excludeDuplicate = false,
    passLength = lengthSlider.value;

  options.forEach((option) => {
    if (option.checked) {
      if (option.id !== "exc-duplicate" && option.id !== "spaces") {
        staticPassword += characters[option.id];
      } else if (option.id === "spaces") {
        staticPassword += `  ${staticPassword}  `;
      } else {
        excludeDuplicate = true;
      }
    }
  });

  for (let i = 0; i < passLength; i++) {
    let randomChar =
      staticPassword[Math.floor(Math.random() * staticPassword.length)];
    if (excludeDuplicate) {
      !randomPassword.includes(randomChar) || randomChar == " "
        ? (randomPassword += randomChar)
        : i--;
    } else {
      randomPassword += randomChar;
    }
  }
  passwordInput.value = randomPassword;
};

// Update password strength indicator
const updatePassIndicator = () => {
  passIndicator.id =
    lengthSlider.value <= 8
      ? "weak"
      : lengthSlider.value <= 16
      ? "medium"
      : "strong";
};

// Update slider value and regenerate password
const updateSlider = () => {
  document.querySelector(".pass-length span").innerText = lengthSlider.value;
  generatePassword();
  updatePassIndicator();
};

// Copy password to clipboard
const copyPassword = () => {
  navigator.clipboard.writeText(passwordInput.value);
  copyIcon.innerText = "check";
  copyIcon.style.color = "#4285F4";
  setTimeout(() => {
    copyIcon.innerText = "copy_all";
    copyIcon.style.color = "#707070";
  }, 1500);
};

// AES encryption
const aesEncrypt = (text, key) => {
  const cipher = CryptoJS.AES.encrypt(text, key);
  return cipher.toString();
};

// AES decryption
const aesDecrypt = (encryptedText, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Encrypt the generated password
const encryptPassword = () => {
  const password = passwordInput.value;
  if (!password) {
    alert("Please generate a password first!");
    return;
  }
  const encryptedPassword = aesEncrypt(password, aesKey);
  encryptedPasswordInput.value = encryptedPassword;
};

// Decrypt the encrypted password
const decryptPassword = () => {
  const encryptedPassword = encryptedPasswordInput.value;
  if (!encryptedPassword) {
    alert("Please encrypt a password first!");
    return;
  }
  const decryptedPassword = aesDecrypt(encryptedPassword, aesKey);
  decryptedPasswordInput.value = decryptedPassword;
};

// Event listeners
copyIcon.addEventListener("click", copyPassword);
lengthSlider.addEventListener("input", updateSlider);
generateBtn.addEventListener("click", generatePassword);
encryptBtn.addEventListener("click", encryptPassword);
decryptBtn.addEventListener("click", decryptPassword);

// Initialize slider
updateSlider();
