(() => {
    const APP_KEY = "__postReportAssistant";

    if (window[APP_KEY]) {
        return;
    }

    let isRunning = false;
    let reportedCount = 0;

    window[APP_KEY] = { initialized: true };

    const logger = (message, type = "info") => {
        const colors = {
            info: "#1877f2",
            success: "#42b72a",
            warn: "#f1c40f",
            error: "#e74c3c"
        };

        const color = colors[type] ?? colors.info;
        console.log(
            `%c[Post Report Assistant] ${message}`,
            `color: ${color}; font-weight: bold; border-left: 4px solid ${color}; padding-left: 8px;`
        );
    };

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    function getStorage(keys) {
        return new Promise((resolve) => chrome.storage.local.get(keys, resolve));
    }

    function setStorage(payload) {
        return new Promise((resolve) => chrome.storage.local.set(payload, resolve));
    }

    async function syncState(overrides = {}) {
        if (typeof overrides.isRunning === "boolean") {
            isRunning = overrides.isRunning;
        }

        if (typeof overrides.reportedCount === "number") {
            reportedCount = overrides.reportedCount;
        }

        const stored = await getStorage(["runningTabId", "lastStatus"]);

        await setStorage({
            isRunning,
            reportedCount,
            runningTabId: Object.prototype.hasOwnProperty.call(overrides, "runningTabId")
                ? overrides.runningTabId
                : (stored.runningTabId ?? null),
            lastStatus: typeof overrides.lastStatus === "string"
                ? overrides.lastStatus
                : (stored.lastStatus ?? ""),
            lastHeartbeatAt: Date.now()
        });
    }

    function isVisible(element) {
        return !!(element && element.offsetParent !== null);
    }

    async function clickElementByText(tag, textArray) {
        const elements = Array.from(document.querySelectorAll(tag));
        const element = elements.find((node) => {
            const text = node.innerText.trim();
            return textArray.includes(text) && isVisible(node);
        });

        if (element) {
            element.click();
            await delay(1500);
            return true;
        }

        return false;
    }

    async function waitForPopupToClose(textArray) {
        logger("Waiting for the popup to close completely...", "info");
        let attempts = 0;

        while (attempts < 10) {
            const elements = Array.from(document.querySelectorAll("span"));
            const isStillThere = elements.some((node) => {
                return textArray.includes(node.innerText.trim()) && isVisible(node);
            });

            if (!isStillThere) {
                logger("Popup closed. Continuing with the next item.", "success");
                return true;
            }

            await delay(1000);
            attempts += 1;
        }

        return false;
    }

    async function clickDotsAndReport(button) {
        logger("Opening the 3-dot menu...", "warn");
        button.click();
        await delay(1500);

        logger("Selecting report post...", "info");
        if (!(await clickElementByText("span", ["Report post", "B\u00e1o c\u00e1o b\u00e0i vi\u1ebft", "B\u00e1o c\u00e1o"]))) {
            return false;
        }
        await delay(2500);

        logger("Selecting broad reason...", "info");
        if (!(await clickElementByText("span", [
            "Scam, fraud or false information",
            "Th\u00f4ng tin sai s\u1ef1 th\u1eadt, l\u1eeba \u0111\u1ea3o ho\u1eb7c gian l\u1eadn"
        ]))) {
            return false;
        }
        await delay(2000);

        logger("Selecting detailed reason...", "info");
        if (!(await clickElementByText("span", ["Fraud or scam", "Gian l\u1eadn ho\u1eb7c l\u1eeba \u0111\u1ea3o"]))) {
            return false;
        }
        await delay(2000);

        logger("Submitting...", "success");
        if (!(await clickElementByText("span", ["Submit", "G\u1eedi"]))) {
            return false;
        }
        await delay(2000);

        logger("Clicking Next...", "success");
        await clickElementByText("span", ["Next", "Ti\u1ebfp"]);
        await delay(2000);

        logger("Clicking Done...", "success");
        await clickElementByText("span", ["Done", "Xong"]);

        await waitForPopupToClose(["Done", "Xong", "Next", "Ti\u1ebfp"]);
        return "SUCCESS";
    }

    async function startAutoReport() {
        while (isRunning) {
            const buttons = Array.from(document.querySelectorAll(
                'div[aria-label="Actions for this post"], div[aria-label="H\u00e0nh \u0111\u1ed9ng v\u1edbi b\u00e0i vi\u1ebft n\u00e0y"]'
            ));

            for (const button of buttons) {
                if (!isRunning) {
                    break;
                }

                if (button.dataset.reported === "true" || !isVisible(button)) {
                    continue;
                }

                button.dataset.reported = "true";
                button.scrollIntoView({ block: "center", behavior: "smooth" });
                await delay(1000);

                const result = await clickDotsAndReport(button);

                if (result === "SUCCESS") {
                    reportedCount += 1;
                    logger(`Completed item ${reportedCount}.`, "success");
                    chrome.runtime.sendMessage({ action: "UPDATE_COUNT", count: reportedCount });
                    await syncState({
                        reportedCount,
                        lastStatus: `Reported ${reportedCount} item(s) on this device.`
                    });
                    window.scrollBy(0, 500);
                    await delay(3000);
                    break;
                }

                logger("Flow error. Trying to close the popup...", "error");
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
                await delay(2000);
            }

            if (isRunning) {
                window.scrollBy(0, 800);
                await delay(4000);
            }
        }

        await syncState({
            isRunning: false,
            runningTabId: null,
            lastStatus: "Run stopped."
        });
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        (async () => {
            if (message.action === "PING") {
                sendResponse({ status: "ok", isRunning, reportedCount });
                return;
            }

            if (message.action === "START_REPORT") {
                if (!isRunning) {
                    const stored = await getStorage(["reportedCount"]);
                    reportedCount = Number(stored.reportedCount) || 0;
                    isRunning = true;
                    await syncState({
                        isRunning: true,
                        runningTabId: message.tabId ?? null,
                        lastStatus: "Run started from the popup."
                    });
                    logger("Starting run...", "success");
                    startAutoReport();
                }

                sendResponse({ status: "ok" });
                return;
            }

            if (message.action === "STOP_REPORT") {
                isRunning = false;
                await syncState({
                    isRunning: false,
                    runningTabId: null,
                    lastStatus: "Run stopped from the popup."
                });
                logger("Stopped.", "error");
                sendResponse({ status: "ok" });
                return;
            }

            sendResponse({ status: "error", error: "Unknown action" });
        })().catch(async (error) => {
            await syncState({
                isRunning: false,
                runningTabId: null,
                lastStatus: `Run failed: ${error.message}`
            });
            sendResponse({ status: "error", error: error.message });
        });

        return true;
    });
})();
