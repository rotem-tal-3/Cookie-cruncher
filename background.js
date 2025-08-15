import { normalizeHost, isBlocked } from "./utils.js";

async function getConfig() {
    return new Promise(resolve => {
        chrome.storage.sync.get({ paused: false, blockedHosts: [] }, resolve);
    });
}

async function updateBadgeForTab(tabId, url) {
    if (!url || !/^https?:/.test(url)) {
        await chrome.action.setBadgeText({ tabId, text: "" });
        return;
    }
    const cfg = await getConfig();
    const host = new URL(url).hostname;
    const off = cfg.paused || isBlocked(host, cfg.blockedHosts);
    await chrome.action.setBadgeText({ tabId, text: off ? "OFF" : "" });
    if (off) {
        await chrome.action.setBadgeBackgroundColor({ tabId, color: "#d33" });
    }
}

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "toggle-site",
        title: "Toggle on this site",
        contexts: ["action"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "toggle-site" || !tab?.url) return;
    const cfg = await getConfig();
    const host = normalizeHost(new URL(tab.url).hostname);
    const set = new Set(cfg.blockedHosts || []);
    if (set.has(host)) set.delete(host); else set.add(host);
    cfg.blockedHosts = [...set];
    await chrome.storage.sync.set(cfg);
    updateBadgeForTab(tab.id, tab.url);
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
    const tab = await chrome.tabs.get(tabId);
    updateBadgeForTab(tabId, tab.url);
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" || changeInfo.url) updateBadgeForTab(tabId, tab.url);
});
chrome.storage.onChanged.addListener(() => chrome.tabs.query({}, tabs => {
    tabs.forEach(t => updateBadgeForTab(t.id, t.url));
}));

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "updateBadgeForTab") updateBadgeForTab(msg.tabId, msg.url);
    if (msg.type === "updateBadgeForAll") chrome.tabs.query({}, tabs => tabs.forEach(t => updateBadgeForTab(t.id, t.url)));
    sendResponse && sendResponse();
});