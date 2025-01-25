const lengthSlider = document.querySelector(".pass-length input"),
  options = document.querySelectorAll(".option input"),
  copyIcon = document.querySelector(".input-box span"),
  passwordInput = document.querySelector(".input-box input"),
  passIndicator = document.querySelector(".pass-indicator"),
  generateBtn = document.querySelector(".generate-btn"),
  encryptedPasswordInput = document.querySelector("#encrypted-password"),
  decryptedPasswordInput = document.querySelector("#decrypted-password"),
  generateKeyBtn = document.querySelector(".generate-key-btn"),
  loadKeyBtn = document.querySelector(".load-key-btn");
  fileNameInput = document.querySelector(".file-name-input");

const characters = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "^!$%&|[](){}:;.,*+-#@<>~",
};

let aesKey = ""; // Placeholder for the AES key

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
  if (!aesKey) {
    alert("Please generate or load an AES key first!");
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
  if (!aesKey) {
    alert("Please generate or load an AES key first!");
    return;
  }
  const decryptedPassword = aesDecrypt(encryptedPassword, aesKey);
  decryptedPasswordInput.value = decryptedPassword;
};

// Generate a key and save it to a file
const generateKey = () => {
  const fileName = fileNameInput.value.trim();
  if (!fileName) {
    alert("Please enter a file name!");
    return;
  }
  if (!fileName.endsWith(".key")) {
    alert("File name must end with .key extension!");
    return;
  }

  // Generate a random 16-character key for AES-128
  aesKey = Array.from({ length: 16 }, () =>
    String.fromCharCode(33 + Math.floor(Math.random() * 94))
  ).join("");

  // Create a Blob and save the file
  const blob = new Blob([aesKey], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();

  alert("Key generated and saved successfully!");
};

// Load a key from a file
const loadKey = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".key";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const loadedKey = reader.result.trim();
      if (loadedKey.length !== 16) {
        alert("Invalid key file! Ensure the key is 16 characters long.");
        return;
      }
      aesKey = loadedKey;
      alert("Key loaded successfully!");
    };
    reader.readAsText(file);
  });

  input.click();
};

// Event listeners
copyIcon.addEventListener("click", copyPassword);
lengthSlider.addEventListener("input", updateSlider);
generateBtn.addEventListener("click", generatePassword);
generateKeyBtn.addEventListener("click", generateKey);
loadKeyBtn.addEventListener("click", loadKey);

// Initialize slider
updateSlider();
