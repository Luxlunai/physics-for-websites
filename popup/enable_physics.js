/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
    document.addEventListener("click", (e) => {

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

        if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) return;
        if (e.target.type === "reset") {
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then(reset)
                .catch(reportError);
        } else {
            browser.tabs
                .query({ active: true, currentWindow: true })
                .then(enablePhysics)
                .catch(reportError);
        }
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
    "physics.js",
    "physics.Loop.js",
    "physics.Vector.js",
    "physics.Particle.js",
    "physics.Spring.js",
    "physics.window.js"
].forEach((fileName) => {
    browser.tabs.executeScript({ file: "/content_scripts/" + fileName }).catch(reportError);
});

browser.tabs
    .executeScript({ file: "/content_scripts/main.js" })
    .then(listenForClicks)
    .catch(reportError);
