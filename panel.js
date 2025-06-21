function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function panelLoop() {
    while (true) {
        fromId("panel-clock").innerHTML = getTime();
        await sleep(500);
    }
}

function updateDock() {
    for (let i = 0; i < getReg("system.dockItems").length; i++) {
        let newDockItem = document.createElement("img");
        newDockItem.setAttribute("src", `apps/${getReg("system.dockItems")[i]}/icon.svg`)
        newDockItem.setAttribute("onclick", `newWindow('${getReg("system.dockItems")[i]}')`)
        document.getElementById("dock").appendChild(newDockItem);
    }
}

updateDock();
panelLoop();