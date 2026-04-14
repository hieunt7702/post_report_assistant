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

function localizeDOM() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const msg = chrome.i18n.getMessage(el.getAttribute("data-i18n"));
        if (msg) {
            el.textContent = msg;
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", localizeDOM);
} else {
    localizeDOM();
}

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
        return chrome.i18n.getMessage("jsNoPageDetected");
    }

    try {
        return new URL(tab.url).hostname;
    } catch (error) {
        return chrome.i18n.getMessage("jsUnsupportedPage");
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
        ? chrome.i18n.getMessage("jsTabHintReady")
        : chrome.i18n.getMessage("jsTabHintOpenExact");
    elements.countValue.textContent = String(viewState.reportedCount ?? 0);

    if (runningOnThisTab) {
        elements.statusPill.textContent = chrome.i18n.getMessage("jsStatusRunning");
        elements.statusPill.className = "status-pill is-running";
    } else if (runningElsewhere) {
        elements.statusPill.textContent = chrome.i18n.getMessage("jsStatusOtherTab");
        elements.statusPill.className = "status-pill is-warning";
    } else if (isSupported) {
        elements.statusPill.textContent = chrome.i18n.getMessage("jsStatusReady");
        elements.statusPill.className = "status-pill is-idle";
    } else {
        elements.statusPill.textContent = chrome.i18n.getMessage("jsStatusUnsupported");
        elements.statusPill.className = "status-pill is-warning";
    }

    elements.startButton.disabled = !isSupported || runningOnThisTab || Boolean(busyMessage);
    elements.stopButton.disabled = !runningOnThisTab || Boolean(busyMessage);

    if (busyMessage) {
        setMessage(busyMessage, "neutral");
        return;
    }

    if (!isSupported) {
        setMessage(chrome.i18n.getMessage("jsMsgOpenFacebook"), "warning");
        return;
    }

    if (runningOnThisTab) {
        setMessage(viewState.lastStatus || chrome.i18n.getMessage("jsMsgActiveThisTab"), "success");
        return;
    }

    if (runningElsewhere) {
        setMessage(chrome.i18n.getMessage("jsMsgActiveOtherTab"), "warning");
        return;
    }

    setMessage(viewState.lastStatus || chrome.i18n.getMessage("jsMsgReadyStart"), "neutral");
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
                lastStatus: chrome.i18n.getMessage("jsMsgPrevRunEnded")
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

    busyMessage = chrome.i18n.getMessage("jsMsgInjecting");
    render();

    try {
        await executeContentScript(activeTab.id);
        busyMessage = chrome.i18n.getMessage("jsMsgStartingRun");
        render();

        await sendTabMessage(activeTab.id, { action: "START_REPORT", tabId: activeTab.id });
        busyMessage = "";
        await refreshState();
    } catch (error) {
        busyMessage = "";
        await setStorage({
            lastStatus: chrome.i18n.getMessage("jsMsgStartFailed") + error.message,
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

    busyMessage = chrome.i18n.getMessage("jsMsgStoppingRun");
    render();

    try {
        await sendTabMessage(activeTab.id, { action: "STOP_REPORT" });
    } catch (error) {
        await setStorage({
            isRunning: false,
            runningTabId: null,
            lastStatus: chrome.i18n.getMessage("jsMsgStoppedLocally")
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
