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
        logger(chrome.i18n.getMessage("contentWaitPopup"), "info");
        let attempts = 0;

        while (attempts < 10) {
            const elements = Array.from(document.querySelectorAll("span"));
            const isStillThere = elements.some((node) => {
                return textArray.includes(node.innerText.trim()) && isVisible(node);
            });

            if (!isStillThere) {
                logger(chrome.i18n.getMessage("contentPopupClosed"), "success");
                return true;
            }

            await delay(1000);
            attempts += 1;
        }

        return false;
    }

    async function clickDotsAndReport(button) {
        logger(chrome.i18n.getMessage("contentOpenMenu"), "warn");
        button.click();
        await delay(1500);

        logger(chrome.i18n.getMessage("contentSelectReport"), "info");
        if (!(await clickElementByText("span", ["Report post", "B\u00e1o c\u00e1o b\u00e0i vi\u1ebft", "B\u00e1o c\u00e1o"]))) {
            return false;
        }
        await delay(2500);

        logger(chrome.i18n.getMessage("contentSelectBroad"), "info");
        if (!(await clickElementByText("span", [
            "Scam, fraud or false information",
            "Th\u00f4ng tin sai s\u1ef1 th\u1eadt, l\u1eeba \u0111\u1ea3o ho\u1eb7c gian l\u1eadn"
        ]))) {
            return false;
        }
        await delay(2000);

        logger(chrome.i18n.getMessage("contentSelectDetailed"), "info");
        if (!(await clickElementByText("span", ["Fraud or scam", "Gian l\u1eadn ho\u1eb7c l\u1eeba \u0111\u1ea3o"]))) {
            return false;
        }
        await delay(2000);

        logger(chrome.i18n.getMessage("contentSubmitting"), "success");
        if (!(await clickElementByText("span", ["Submit", "G\u1eedi"]))) {
            return false;
        }
        await delay(2000);

        logger(chrome.i18n.getMessage("contentClickNext"), "success");
        await clickElementByText("span", ["Next", "Ti\u1ebfp"]);
        await delay(2000);

        logger(chrome.i18n.getMessage("contentClickDone"), "success");
        await clickElementByText("span", ["Done", "Xong"]);

        await waitForPopupToClose(["Done", "Xong", "Next", "Ti\u1ebfp"]);
        return "SUCCESS";
    }

    async function startAutoReport() {
        let emptyScanCounter = 0;

        while (isRunning) {
            const buttons = Array.from(document.querySelectorAll(
                'div[aria-label="Actions for this post"], div[aria-label="H\u00e0nh \u0111\u1ed9ng v\u1edbi b\u00e0i vi\u1ebft n\u00e0y"]'
            ));

            let foundNewPost = false;

            for (const button of buttons) {
                if (!isRunning) {
                    break;
                }

                if (button.dataset.reported === "true" || !isVisible(button)) {
                    continue;
                }

                foundNewPost = true;
                emptyScanCounter = 0;

                button.dataset.reported = "true";
                button.scrollIntoView({ block: "center", behavior: "smooth" });
                await delay(1000);

                const result = await clickDotsAndReport(button);

                if (result === "SUCCESS") {
                    reportedCount += 1;
                    logger(`${chrome.i18n.getMessage("contentCompletedItem")}${reportedCount}.`, "success");
                    chrome.runtime.sendMessage({ action: "UPDATE_COUNT", count: reportedCount });
                    await syncState({
                        reportedCount,
                        lastStatus: chrome.i18n.getMessage("contentReportedItems", String(reportedCount))
                    });
                    window.scrollBy(0, 500);
                    await delay(3000);
                    break;
                }

                logger(chrome.i18n.getMessage("contentFlowError"), "error");
                sessionStorage.setItem("PRA_RESUME_ON_LOAD", "true");
                await syncState({
                    lastStatus: chrome.i18n.getMessage("contentRefreshedError")
                });
                window.location.reload();
                return;
            }

            if (isRunning) {
                if (!foundNewPost) {
                    emptyScanCounter++;
                    if (emptyScanCounter >= 3) {
                        logger(chrome.i18n.getMessage("contentNoFreshPosts"), "warn");
                        sessionStorage.setItem("PRA_RESUME_ON_LOAD", "true");
                        await syncState({
                            lastStatus: chrome.i18n.getMessage("contentRefreshedNew")
                        });
                        window.location.reload();
                        return;
                    }
                }

                window.scrollBy(0, 800);
                await delay(4000);
            }
        }

        await syncState({
            isRunning: false,
            runningTabId: null,
            lastStatus: chrome.i18n.getMessage("contentRunStopped")
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
                        lastStatus: chrome.i18n.getMessage("contentRunStartedPopup")
                    });
                    logger(chrome.i18n.getMessage("contentStartingRun"), "success");
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
                    lastStatus: chrome.i18n.getMessage("contentRunStoppedPopup")
                });
                logger(chrome.i18n.getMessage("contentStopped"), "error");
                sendResponse({ status: "ok" });
                return;
            }

            sendResponse({ status: "error", error: "Unknown action" });
        })().catch(async (error) => {
            await syncState({
                isRunning: false,
                runningTabId: null,
                lastStatus: chrome.i18n.getMessage("contentRunFailed") + error.message
            });
            sendResponse({ status: "error", error: error.message });
        });

        return true;
    });

    (async () => {
        if (sessionStorage.getItem("PRA_RESUME_ON_LOAD") === "true") {
            sessionStorage.removeItem("PRA_RESUME_ON_LOAD");
            const stored = await getStorage(["isRunning", "reportedCount"]);
            if (stored.isRunning) {
                isRunning = true;
                reportedCount = Number(stored.reportedCount) || 0;
                logger(chrome.i18n.getMessage("contentAutoResuming"), "success");
                startAutoReport();
            }
        }
    })();
})();
