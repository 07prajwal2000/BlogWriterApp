document.oncontextmenu = e => e.preventDefault();

const saveWindow = document.querySelector('#save-window');
const saveWindowCloseBtn = document.querySelector('#save-window-close');
const infoModalWindow = document.querySelector('#info-modal');

const saveBtn = document.querySelector('#save-btn');
const clearBtn = document.querySelector('#clear-btn');
const loadArticleBtn = document.querySelector('#load-btn');
const infoBtn = document.querySelector('#info-btn');
const closeInfoWindowBtn = document.querySelector('#close-info-window-btn');

const cancelBtn = document.querySelector('#cancel-btn');
const confirmBtn = document.querySelector('#confirm-btn');

const titleInput = document.querySelector('#title');
const shortDescInput = document.querySelector('#short-desc');
const yourNameInput = document.querySelector('#your-name');
let loadedFromFile = false;

const RTE_Editor = tinymce.init({
  selector: '#editor',
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount', 'codesample',
  ],
  toolbar: 'undo redo | blocks | ' +
  'bold italic forecolor | codesample | alignleft aligncenter ' +
  'alignright alignjustify | bullist numlist outdent indent | ' +
  'removeformat | help ',
  toolbar_mode: 'floating',
  branding: false,
  menubar: 'file edit insert view format table tools',
  skin_url: '/static/ui/CUSTOM',
  codesample_languages: [
    {text: 'HTML/XML', value: 'markup'},
    {text: 'CSS', value: 'css'},
    {text: 'JavaScript', value: 'javascript'},
    {text: 'Typescript', value: 'typescript'},
    {text: 'C#', value: 'csharp'},
    {text: 'C++', value: 'cpp'},
    {text: 'Python', value: 'python'},
    {text: 'Java', value: 'java'},
    {text: 'PHP', value: 'php'},
    {text: 'Ruby', value: 'ruby'},
    {text: 'C', value: 'c'},
  ],
});

infoBtn.onclick = e => {
  infoModalWindow.classList.remove('hidden');
  infoModalWindow.classList.add('fixed');
};

closeInfoWindowBtn.onclick = e => {
  infoModalWindow.classList.remove('fixed');
  infoModalWindow.classList.add('hidden');

};

const data = {
  title: '',
  shortDescription: '',
  author: '',
  value: '',
  createdAt: ''
};

clearBtn.onclick = e => {
  tinymce.get('editor').setContent('');
  loadedFromFile = false;
  ResetSaveWindow();
};

saveWindowCloseBtn.onclick = e => {
  CloseSaveWindow();
};
confirmBtn.onclick = OnConfirmed;

// NOTE: LOADING FILE to Editor
loadArticleBtn.onclick = async e => {
  const filePaths = await Neutralino.os.showOpenDialog("Open a Article file", {
    defaultPath: "/",
    filters: [
      {name: "Article File (*.jartd)", extensions: ['jartd']}
    ]
  });
  const filePath = filePaths[0];
  if (filePath === '') {
    await Neutralino.os.showMessageBox("Error", "Open a valid file");
    return;
  }
  const articleData = await Neutralino.filesystem.readFile(filePath);
  console.log(articleData);
  if (articleData.trim() === '') {
    await Neutralino.os.showMessageBox("Error", "File contains no data");
    return;
  }

  try {
    const keys = ['title', 'shortDescription', 'author', 'value', 'createdAt'];
    const obj = JSON.parse(articleData);

    // Check all keys exists
    keys.forEach(x => {
      if (!obj[x]) {
        console.log(x + " is dont contains");
        throw new Error("File Corrupted");
      }
      if ((obj[x] instanceof String) || (typeof obj[x] !== 'string')) {
        console.log(x + " is not string");
        throw new Error(x + " is not String");
      }
    });

    // SUCCESSFULLY LOADED
    tinymce.get('editor').setContent(obj.value);
    await Neutralino.os.showNotification('File Loaded', `File is successfully loaded.`);
    FillSaveWindow(obj);
    loadedFromFile = true;
    
  } catch (error) {
    console.log(error);
    await Neutralino.os.showMessageBox("Error", "File is corrupted. Sorry. File can't be opened.");
    return;
  }
  
}

function CloseSaveWindow() {
  saveWindow.classList.remove('fixed');
  saveWindow.classList.add('hidden');
  EnableButtons();
  ResetSaveWindow();
}

saveBtn.onclick = e => {
  // ResetSaveWindow();
  saveWindow.classList.add('fixed');
  saveWindow.classList.remove('hidden');
};

function EnableButtons() {
  titleInput.disabled = false;
  shortDescInput.disabled = false;
  yourNameInput.disabled = false;

  cancelBtn.disabled = false;
  confirmBtn.disabled = false;
  saveWindowCloseBtn.disabled = false;
}

function DisableButtons() {
  titleInput.disabled = true;
  shortDescInput.disabled = true;
  yourNameInput.disabled = true;
  
  cancelBtn.disabled = true;
  confirmBtn.disabled = true;
  saveWindowCloseBtn.disabled = true;
}

function ResetSaveWindow() {
  if(loadedFromFile) return;
  titleInput.value = "";
  yourNameInput.value = "";
  shortDescInput.value = "";
}

function FillSaveWindow({title, author, shortDescription}) {
  titleInput.value = title;
  yourNameInput.value = author;
  shortDescInput.value = shortDescription;
}

async function OnConfirmed(e) {
  DisableButtons();
  const date = new Date();
  const rand = date.getMinutes().toString() + date.getHours().toString() + date.getDate().toString() + Math.round(Math.random() * 10000).toString();


  if(titleInput.value.trim() === "" || shortDescInput.value.trim() === "" || yourNameInput.value.trim() === "" ) {
    await Neutralino.os.showMessageBox("Error", "Enter a valid data inside Entry");
    EnableButtons();
    return;
  }

  data.title = titleInput.value.trim();
  data.shortDescription = shortDescInput.value.trim();
  data.author = yourNameInput.value.trim();
  data.value = tinymce.get('editor').getContent();
  data.createdAt = date.toDateString();
  const jsonData = JSON.stringify(data);

  let saveFolder = await Neutralino.os.showFolderDialog("Select Folder to save", {});
  if (saveFolder === "") {
    await Neutralino.os.showMessageBox("Error", "Select a valid Folder to Save");
    EnableButtons();
    return;
  }
  const fileName = saveFolder + "/" + data.author + "_" + rand + ".jartd"
  await Neutralino.filesystem.writeFile(fileName, jsonData);
  await Neutralino.os.showNotification('Successful', `Saved to ${saveFolder + fileName}`);
  EnableButtons();
  CloseSaveWindow();
}

function OnLinksClicked(type) {
  if(type === "linkedin")
    Neutralino.os.open("https://www.linkedin.com/in/prajwal-aradhya/");
  else if(type === "github")
    Neutralino.os.open("https://github.com/07prajwal2000");
  else if(type === 'mail')
    Neutralino.os.open("mailto:manuaradhya07@gmail.com");
}