function initEvents() {
    document.getElementById("enable-physics").addEventListener("click", (e) => {
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(enablePhysics)
            .catch(reportError);
    });

    document.getElementById("reset").addEventListener("click", (e) => {
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(reset)
            .catch(reportError);
    })

    document.getElementById("set-precision").addEventListener("change", (e) => {
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(setPrecision)
            .catch(reportError);
    })
    document.getElementById("set-grav-mult").addEventListener("change", (e) => {
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(setGravMult)
            .catch(reportError);
    })
    document.getElementById("set-body-count").addEventListener("change", (e) => {
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(setBodyCount)
            .catch(reportError);
    })
}

function enablePhysics(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "enable-physics",
    });
}

function reset(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "reset",
    });
}

function setPrecision(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "set-precision",
        value: document.getElementById("set-precision").value
    });
}

function setGravMult(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "set-grav-mult",
        value: document.getElementById("set-grav-mult").value
    });
}

function setBodyCount(tabs) {
    browser.tabs.sendMessage(tabs[0].id, {
        command: "set-body-count",
        value: document.getElementById("set-body-count").value
    });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportError(error) {
    // document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    document.querySelector("#error-message").textContent = `Error: ${error.message}`;
}

[
    "HTMLCustomElement.js",
    "HTMLPointElement.js",
    "HTMLRectElement.js",
    "physics.js",
    "physics.Loop.js",
    "physics.Vector.js",
    "physics.Collisions.js",
    "physics.BodyRect.js",
    "inputController.js",
].forEach((fileName) => {
    browser.tabs
        .executeScript({ file: "/content_scripts/" + fileName })
        .catch(reportError);
});

browser.tabs
    .insertCSS({ file: "/content_scripts/main.css"})
    .catch(reportError);
browser.tabs
    .executeScript({ file: "/content_scripts/main.js" })
    .then(initEvents)
    .catch(reportError);