// import randomWords from "random-sentence";
// import randomWords from "random-words";
const randomWords = require("random-words");
// Selecting elements
const lengthSlider = document.querySelector(".pass-length input"),
  options = document.querySelectorAll(".option input"),
  copyIcon = document.querySelector(".input-box span"),
  passwordInput = document.querySelector(".input-box input"),
  passIndicator = document.querySelector(".pass-indicator"),
  generateBtn = document.querySelector(".generate-btn"),
  generateKeyBtn = document.querySelector(".generate-key-btn"),
  loadKeyBtn = document.querySelector(".load-key-btn"),
  fileNameInput = document.querySelector(".file-name-input"),
  encryptFileInput = document.getElementById("encrypt-file"),
  encryptBtns = document.querySelectorAll(".encrypt-decrypt button");

  const tabs = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // Paraphrasing elements 
const charRange = document.getElementById("charRange");
const lengthValue = document.getElementById("length-value");
const capitalizeToggle = document.getElementById("capitalize-toggle");
const generatedSentence = document.getElementById("generated-sentence");
const copySentenceBtn = document.getElementById("copy-sentence");
const refreshSentenceBtn = document.getElementById("refresh-sentence");

  // switch tabs : 
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTabId = tab.dataset.tab; // Get the target tab ID from data-tab attribute
        const targetTab = document.getElementById(targetTabId); // Get the target tab element

        if (targetTab) {
            tabs.forEach(t => t.classList.remove('active')); // Remove active class from all tabs
            tabContents.forEach(tc => tc.classList.remove('active')); // Remove active class from all tab contents

            tab.classList.add('active'); // Add active class to the clicked tab
            targetTab.classList.add('active'); // Add active class to the corresponding tab content
        } else {
            console.error(`Tab with id "${targetTabId}" not found.`); // Handle the case where the tab is not found
        }
    });
});

// Function to generate a sentence
const generateSentence = () => {
  const wordCount = parseInt(charRange.value); // Get word count from range
  const words = randomWords(wordCount); // Generate words using random-words library
  let sentence = words.join(" "); // Join words into a sentence

  if (capitalizeToggle.checked) {
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1); // Capitalize first letter
  }

  generatedSentence.value = sentence; // Set the generated sentence in the input box
};

const characters = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "^!$%&|[](){}:;.,*+-#@<>~",
};

let aesKey = ""; // Placeholder for the AES key

// Function to generate a password
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

// Encrypt and save password to file
const encryptAndSavePassword = () => {
  const password = passwordInput.value;
  let fileName = encryptFileInput?.value.trim();

  console.log(`File Name Entered: ${fileName}`);

  // fileName = fileName.replace(/[\s\uFEFF\xA0]+$/g, '');

  if (!password) {
    alert("Please generate a password first!");
    return;
  }
  if (!aesKey) {
    alert("Please generate or load an AES key first!");
    return;
  }
  if (!fileName) {
    alert("Please enter a file name to save the encrypted password!");
    return;
  }

  // Enforce .txt extension for the filename
  if (!fileName.toLowerCase().endsWith(".txt")) {
    alert("File name must end with .txt extension!");
    return;
  }

  const encryptedPassword = aesEncrypt(password, aesKey);

  const blob = new Blob([encryptedPassword], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();

  alert("Encrypted password saved successfully!");
};

// Decrypt password from input file
const decryptPasswordFromFile = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt"; // Ensure it accepts .txt files

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected!");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const encryptedPassword = reader.result.trim();
      if (!aesKey) {
        alert("Please generate or load an AES key first!");
        return;
      }

      try {
        const decryptedPassword = aesDecrypt(encryptedPassword, aesKey);
        if (!decryptedPassword) throw new Error();

        // Find the input field above the "Decrypt" button
        const decryptInput = encryptBtns[1].previousElementSibling;
        decryptInput.value = decryptedPassword;

        alert("Password decrypted successfully!");
      } catch (error) {
        alert("Failed to decrypt! Ensure the correct key is loaded.");
      }
    };
    reader.readAsText(file);
  });

  input.click();
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
encryptBtns[0].addEventListener("click", encryptAndSavePassword);
encryptBtns[1].addEventListener("click", decryptPasswordFromFile);

// Event listener for character range change
charRange.addEventListener("input", () => {
  lengthValue.textContent = charRange.value; // Update displayed character count
  generateSentence(); // Generate a new sentence
});

// Event listener for copy button
copySentenceBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(generatedSentence.value)
      .then(() => {
          copySentenceBtn.textContent = "Copied!";
          setTimeout(() => copySentenceBtn.textContent = "Copy Sentence", 2000); // Reset button text
      })
      .catch(err => console.error("Failed to copy: ", err));
});

// Event listener for refresh button
refreshSentenceBtn.addEventListener("click", generateSentence);

// Initialize slider
updateSlider();
generateSentence();