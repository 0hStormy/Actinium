let maxZ = 1;

if (localStorage.getItem("registry")) {
    console.log("Registry Exists")
} else {
    console.log("Created Registry")
    createRegistry();
}

changeWallpaper();

async function changeContainer(page, main = true) {
    let htmlValue;
    console.log(page)
    if (page[0] == "/") {
        htmlText = await fsGetFile(page);
    } else {
        if (main == true) {
            htmlValue = await fetch(`apps/${page}/main.ahc`);
        } else {
            htmlValue = await fetch(`apps/${page}.ahc`);
        }
        htmlText = await htmlValue.text()
    }
    console.log(htmlValue)
    return htmlText;
}

function createWindow(title = "Window", content = "") {
    const win = document.createElement("div");
    win.id = "win"
    win.className = "window";
    win.innerHTML = `
        <div class="titlebar">
            <span id="max" class="material-symbols-outlined">expand_content</span>
            <span id="min" class="material-symbols-outlined">unfold_less</span>
            <span id="close" class="material-symbols-outlined">close</span>
            <span onclick="goBack()" id="back" class="material-symbols-outlined">keyboard_arrow_left</span>
        </div>
        <div id="content" class="content">${content}</div>
    `;

    // Basic styles and position
    Object.assign(win.style, {
        top: "100px",
        left: "100px",
        position: "absolute",
        zIndex: maxZ++,
    });

    // Drag logic
    const titlebar = win.querySelector(".titlebar");
    let offsetX, offsetY;

    titlebar.addEventListener("mousedown", (e) => {
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;

        function onMove(e) {
            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        }

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", onMove);
        }, { once: true });
    });

    // Close button
    win.querySelector("#close").onclick = () => win.remove();
    // Maximize logic
    const maximizeBtn = win.querySelector("#max");
    const minimizeBtn = win.querySelector("#min");

    let isMaximized = false;
    let isMinimized = false;
    let originalStyle = {};

    maximizeBtn.onclick = () => {
        if (!isMaximized) {
            const computed = getComputedStyle(win);

            originalStyle = {
                top: computed.top,
                left: computed.left,
                width: computed.width,
                height: computed.height,
                borderRadius: computed.borderRadius,
                border: computed.border,
                position: computed.position,
                resize: computed.resize,
                backdropFilter: computed.backdropFilter
            };
            Object.assign(win.style, {
                top: "0px",
                left: "0px",
                width: "100vw",
                height: "calc((100vh) - 40px)",
                borderRadius: "0px",
                border: "none",
                resize: "none",
                backdropFilter: "blur(64px)"
            });

            isMaximized = true;
        } else {
            Object.assign(win.style, originalStyle);
            originalStyle = {};
            isMaximized = false;
        }
    };

    minimizeBtn.onclick = () => {
        if (!isMinimized) {
            const computed = getComputedStyle(win);

            originalStyle = {
                top: computed.top,
                left: computed.left,
                width: computed.width,
                height: computed.height,
                borderRadius: computed.borderRadius,
                border: computed.border,
                position: computed.position,
                resize: computed.resize,
                display: computed.display,
            };
            Object.assign(win.style, {
                top: "0px",
                left: "0px",
                width: "100vw",
                borderRadius: "0px",
                border: "none",
                resize: "none",
                display: "none",
            });

            isMaximized = true;
        } else {
            Object.assign(win.style, originalStyle);
            originalStyle = {};
            isMaximized = false;
        }
    };

    win.addEventListener("mousedown", () => {
        win.style.zIndex = ++maxZ;
    });

    document.getElementById("desktop").appendChild(win);
}