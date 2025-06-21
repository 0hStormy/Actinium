const defaultRegistry = {
    "system": {
        "wallpaper": "img/bg.svg",
        "dockItems": ["filer", "settings", "musideck"]
    },
};

let currentRegistry = JSON.parse(localStorage.getItem("registry"))

// Makes code shorted when embedded in HTML
function fromId(id) {
    return document.getElementById(id)
}

// Changes the user"s desktop wallpaper
function changeWallpaper(url = undefined) {
    if (typeof url === 'undefined') {
        url = getReg("system.wallpaper")
    };
    const desktop = document.getElementById("desktop");
    desktop.setAttribute("style", `background-image: url(${url})`)
    setReg("system.wallpaper", url)
}

// Creates a new window with a specified app
function newWindow(app) {
    changeContainer(app).then(page => {
        createWindow(page, page);
        initScripts()
    });
}

async function replaceWindow(app, main = true) {
    const content = document.getElementById("content");
    win.lastPage = content.innerHTML;

    const page = await changeContainer(app, main);
    content.innerHTML = page;

    initScripts(); // re-run/reload any <script> tags
}


function goBack() {
    if (win.lastPage) {
        content = document.getElementById("content")
        content.innerHTML = win.lastPage
    }
}

function createRegistry() {
    localStorage.setItem("registry", JSON.stringify(defaultRegistry));
}

function getReg(keyPath) {
    return keyPath.split(".").reduce((acc, key) => {
        return acc && acc[key];
    }, currentRegistry);
}

function setReg(keyPath, value) {
    const keys = keyPath.split(".");
    const registry = JSON.parse(localStorage.getItem("registry") || "{}");

    let current = registry;
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) current[key] = {};
        current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    localStorage.setItem("registry", JSON.stringify(registry));
}

async function roturLogin(username, password) {
    try {
        const response = await fetch(`https://social.rotur.dev/get_user?username=${username}&password=${CryptoJS.MD5(password).toString()}`);
        const data = await response.json();

        if (data.error) {
            return reject(data.error);
        }
        resolve(data.key);
    } catch (error) {
        console.error("Login error:", error);
        reject(error);
    }
}

function getTime() {
    const now = new Date();
    const time = now.toLocaleTimeString();
    return time;
}

function changeBorderRadius(roundness) {
    document.documentElement.style.setProperty("--round", String(roundness) + "px");
}

// Returns in megabytes
async function fsGetQuota() {
    const estimate = await navigator.storage.estimate();
    return (Math.round(estimate.quota / 1048576));
}

// Returns in megabytes
async function fsGetUsage() {
    const estimate = await navigator.storage.estimate();
    return (Math.round(estimate.usage / 1048576));
}

async function fsmkdir(path) {
    const root = await navigator.storage.getDirectory();
    const parts = path.split("/");

    const fileName = parts.pop();
    let dir = root;

    for (const part of parts) {
        if (part === "") continue;
        dir = await dir.getDirectoryHandle(part, { create: true });
    }

    const file = await dir.getFileHandle(fileName, { create: true });
    return file;
}

async function fsls(path="") {
    let lsList = [];
    let dir = await navigator.storage.getDirectory();

    if (path) {
        const parts = path.split("/").filter(Boolean);
        for (const part of parts) {
            dir = await dir.getDirectoryHandle(part, { create: false });
        }
    }

    for await (const [name, handle] of dir.entries()) {
        if (handle.kind === "file") {
            lsList.push(name);
        } else if (handle.kind === "directory") {
            lsList.push(`${name}/`);
        }
    }

    return lsList;
}

async function fsGetFile(path) {
    path = path.replace(/^\/+/, "");
    
    if (!path || path.trim() === "") {
        console.error("Empty path provided");
        return null;
    }
    
    try {
        const segments = path.split("/").filter(segment => segment.length > 0);
        
        if (segments.length === 0) {
            console.error("No valid path segments");
            return null;
        }
        
        const root = await navigator.storage.getDirectory();
        let currentDir = root;
        
        for (let i = 0; i < segments.length - 1; i++) {
            currentDir = await currentDir.getDirectoryHandle(segments[i]);
        }
        
        const fileHandle = await currentDir.getFileHandle(segments.at(-1));
        const file = await fileHandle.getFile();
        const contents = await file.text();
        return contents;
    } catch (err) {
        console.error("Failed to read file from OPFS:", err);
        console.error("Path was:", path); // Add this for debugging
        return null;
    }
}

function initScripts() {
    const content = document.getElementById("content");
    const scripts = content.querySelectorAll("script");

    scripts.forEach(oldScript => {
        const newScript = document.createElement("script");

        for (const attr of oldScript.attributes) {
            newScript.setAttribute(attr.name, attr.value);
        }

        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
    });
}