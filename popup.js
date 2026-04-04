const STORAGE_KEYS = {
    isRunning: false,
    reportedCount: 0,
    runningTabId: null,
    lastStatus: "",
    lastHeartbeatAt: null
};

const elements = {
    statusPill: document.getElementById("status-pill"),
    tabHost: document.getElementById("tab-host"),
    tabHint: document.getElementById("tab-hint"),
    countValue: document.getElementById("count-value"),
    startButton: document.getElementById("start-btn"),
    stopButton: document.getElementById("stop-btn"),
    messageBar: document.getElementById("message-bar")
};

let activeTab = null;
let viewState = { ...STORAGE_KEYS };
let busyMessage = "";

function getStorage(keys) {
    return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
}

function setStorage(nextState) {
    return new Promise((resolve) => chrome.storage.local.set(nextState, resolve));
}

function queryActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs[0] ?? null));
    });
}

function executeContentScript(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve();
        });
    });
}

function sendTabMessage(tabId, payload) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, payload, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            resolve(response);
        });
    });
}

function getHostname(tab) {
    if (!tab?.url) {
        return "No page detected";
    }

    try {
        return new URL(tab.url).hostname;
    } catch (error) {
        return "Unsupported page";
    }
}

function isFacebookTab(tab) {
    if (!tab?.url) {
        return false;
    }

    try {
        const url = new URL(tab.url);
        return url.hostname === "facebook.com" || url.hostname.endsWith(".facebook.com");
    } catch (error) {
        return false;
    }
}

function setMessage(text, tone = "neutral") {
    elements.messageBar.textContent = text;
    elements.messageBar.dataset.tone = tone;
}

function render() {
    const isSupported = isFacebookTab(activeTab);
    const runningOnThisTab = viewState.isRunning && activeTab?.id === viewState.runningTabId;
    const runningElsewhere = viewState.isRunning && activeTab?.id !== viewState.runningTabId;

    elements.tabHost.textContent = getHostname(activeTab);
    elements.tabHint.textContent = isSupported
        ? "Ready for a user-started run on the current page."
        : "Open the exact facebook.com page you want to process.";
    elements.countValue.textContent = String(viewState.reportedCount ?? 0);

    if (runningOnThisTab) {
        elements.statusPill.textContent = "Running";
        elements.statusPill.className = "status-pill is-running";
    } else if (runningElsewhere) {
        elements.statusPill.textContent = "Other tab";
        elements.statusPill.className = "status-pill is-warning";
    } else if (isSupported) {
        elements.statusPill.textContent = "Ready";
        elements.statusPill.className = "status-pill is-idle";
    } else {
        elements.statusPill.textContent = "Unsupported";
        elements.statusPill.className = "status-pill is-warning";
    }

    elements.startButton.disabled = !isSupported || runningOnThisTab || Boolean(busyMessage);
    elements.stopButton.disabled = !runningOnThisTab || Boolean(busyMessage);

    if (busyMessage) {
        setMessage(busyMessage, "neutral");
        return;
    }

    if (!isSupported) {
        setMessage("Open a page on facebook.com, then reopen the popup.", "warning");
        return;
    }

    if (runningOnThisTab) {
        setMessage(viewState.lastStatus || "A reporting run is active on this tab.", "success");
        return;
    }

    if (runningElsewhere) {
        setMessage("A run is already marked as active in another tab.", "warning");
        return;
    }

    setMessage(viewState.lastStatus || "Ready. Review the page, then click Start.", "neutral");
}

async function refreshState() {
    activeTab = await queryActiveTab();
    viewState = { ...STORAGE_KEYS, ...(await getStorage(Object.keys(STORAGE_KEYS))) };

    if (viewState.isRunning && activeTab?.id === viewState.runningTabId) {
        try {
            await sendTabMessage(activeTab.id, { action: "PING" });
        } catch (error) {
            viewState = {
                ...viewState,
                isRunning: false,
                runningTabId: null,
                lastStatus: "The previous run ended after the page changed or reloaded."
            };
            await setStorage({
                isRunning: false,
                runningTabId: null,
                lastStatus: viewState.lastStatus
            });
        }
    }

    render();
}

async function handleStart() {
    if (!activeTab?.id || !isFacebookTab(activeTab)) {
        render();
        return;
    }

    busyMessage = "Injecting the content script into the current tab...";
    render();

    try {
        await executeContentScript(activeTab.id);
        busyMessage = "Starting the reporting run on the current tab...";
        render();

        await sendTabMessage(activeTab.id, { action: "START_REPORT", tabId: activeTab.id });
        busyMessage = "";
        await refreshState();
    } catch (error) {
        busyMessage = "";
        await setStorage({
            lastStatus: `Start failed: ${error.message}`,
            isRunning: false,
            runningTabId: null
        });
        await refreshState();
    }
}

async function handleStop() {
    if (!activeTab?.id || activeTab.id !== viewState.runningTabId) {
        render();
        return;
    }

    busyMessage = "Stopping the current run...";
    render();

    try {
        await sendTabMessage(activeTab.id, { action: "STOP_REPORT" });
    } catch (error) {
        await setStorage({
            isRunning: false,
            runningTabId: null,
            lastStatus: "Stopped locally after the content script became unavailable."
        });
    } finally {
        busyMessage = "";
        await refreshState();
    }
}

elements.startButton.addEventListener("click", handleStart);
elements.stopButton.addEventListener("click", handleStop);

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
        return;
    }

    for (const [key, change] of Object.entries(changes)) {
        if (key in viewState) {
            viewState[key] = change.newValue;
        }
    }

    render();
});

refreshState();
