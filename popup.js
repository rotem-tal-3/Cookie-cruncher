import { normalizeHost, endsWithHost, isBlocked } from "./utils.js";

async function getActiveTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

function getConfig() {
    return new Promise(resolve => {
        chrome.storage.sync.get({ paused: false, blockedHosts: [] }, resolve);
    });
}

function saveConfig(cfg) {
    return new Promise(resolve => chrome.storage.sync.set(cfg, resolve));
}

document.addEventListener("DOMContentLoaded", async () => {
    const tab = await getActiveTab();
    const url = new URL(tab.url);
    const host = normalizeHost(url.hostname);
    document.getElementById("host").textContent = host;
    const cfg = await getConfig();
    document.getElementById("pauseAll").checked = !!cfg.paused;
    document.getElementById("disableSite").checked = isBlocked(host, cfg.blockedHosts);
    document.getElementById("pauseAll").addEventListener("change", async (e) => {
        cfg.paused = e.target.checked;
        await saveConfig(cfg);
        chrome.runtime.sendMessage({ type: "updateBadgeForAll" });
    });

    document.getElementById("disableSite").addEventListener("change", async (e) => {
        console.log("saving site");
        const list = new Set(cfg.blockedHosts || []);
        if (e.target.checked) list.add(host);
        else {
            [...list].forEach(d => { if (endsWithHost(host, d) || endsWithHost(d, host)) list.delete(d); });
        }
        cfg.blockedHosts = [...list];
        await saveConfig(cfg);
        chrome.runtime.sendMessage({ type: "updateBadgeForTab", tabId: tab.id, url: tab.url });
    });
});