import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFiles, saveFiles } from './firebase.js';

let files = [];
let isPlainText = true;

document.addEventListener("DOMContentLoaded", async () => {
  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      files = await getFiles();
      renderFiles();
    } else {
      let authSuccess = false;
      const email = "admin@gmail.com";
      while (!authSuccess) {
        const password = prompt("Código de acesso:");
        try {
          await signInWithEmailAndPassword(auth, email, password);
          files = await getFiles();
          renderFiles();
          authSuccess = true;
        } catch (error) {
          alert("Código incorreto.");
          console.error(error);
        }
      }
    }
  });
});

function renderFiles() {
  const ul = document.getElementById("files-list");
  ul.innerHTML = "";
  files.forEach((file, i) => {
    let li = createCard(file, i, 
      file.type === 'plain-text' ? handleCopyPlainText : handleDownloadFile,
      handleDelete
    );
    ul.appendChild(li);
  });
}

function handleCopyPlainText(index) {
  navigator.clipboard.writeText(files[index].content);
  alert("Copiado para área de transferência!");
}

function handleDownloadFile(index) {
  const link = document.createElement("a");
  link.href = files[index].content;
  link.download = `${files[index].fileName}`;
  link.click();
}

async function handleDelete(index) {
  if (confirm(`Deseja excluir "${files[index].type === 'plain-text' ? files[index].content : files[index].fileName}"?`)) {
    files.splice(index, 1);
    renderFiles();
    await saveFiles(files);
  }
}

function createCard(file, index, onPrimaryAction, onDelete) {
  const li = document.createElement("li");
  li.className = "file-item";
  li.onclick = () => onPrimaryAction(index);

  if (file.type === "image") {
    const img = document.createElement("img");
    img.className = "file-image";
    img.src = file.content;
    img.alt = file.fileName;
    li.appendChild(img);
  } else if (file.type === "file") {
    const icon = document.createElement("div");
    icon.className = "file-icon";
    icon.innerHTML = `<ion-icon name="document-outline" size="large"></ion-icon>`;
    li.appendChild(icon);
  }

  let paragraphContent = file.type === "plain-text" ? file.content : file.fileName;

  const div = document.createElement("div");
  div.className = "file-info";

  const strong = document.createElement("strong");
  strong.textContent = file.createdAt;

  const p = document.createElement("p");
  p.title = paragraphContent;
  p.textContent = limitString(paragraphContent);

  div.appendChild(strong);
  div.appendChild(p);
  li.appendChild(div);

  const button = document.createElement("button");
  button.className = "delete-button";
  button.innerHTML = `<ion-icon name="trash-outline"></ion-icon>`;
  button.onclick = (e) => {
    e.stopPropagation();
    onDelete(index);
  };
  li.appendChild(button);

  return li;
}

function limitString(str) {
  return str.length > 100 ? str.slice(0, 100) + "..." : str;
}

document.getElementById("toggle-input-button").addEventListener("click", () => {
  isPlainText = !isPlainText;
  document.getElementById("plain-text-input").style.display = isPlainText ? "block" : "none";
  document.getElementById("file-input-container").style.display = isPlainText ? "none" : "block";
});

document.getElementById("file-input").addEventListener("change", (e) => {
  const input = e.target;
  const fileName = document.getElementById("file-name");
  fileName.textContent = input.files.length > 0 ? input.files[0].name : 'Nenhum arquivo selecionado';
});

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isPlainText) {
    const input = document.getElementById("plain-text-input");
    if (input.value.trim()) {
      files.push({ type: "plain-text", content: input.value, createdAt: getFormattedDateTime() });
      input.value = "";
    }
  } else {
    const fileInput = document.getElementById("file-input");
    const fileName = document.getElementById("file-name");
    const file = fileInput.files[0];
    if (file) {
      const base64 = await readFileAsBase64(file);
      const isImage = file.type.startsWith("image/");
      files.push({
        type: isImage ? "image" : "file",
        content: base64,
        fileName: fileName.textContent,
        createdAt: getFormattedDateTime()
      });
      fileInput.value = "";
      fileName.textContent = "Nenhum arquivo selecionado";
    }
  }

  renderFiles();
  await saveFiles(files);
});

function getFormattedDateTime() {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}, ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
