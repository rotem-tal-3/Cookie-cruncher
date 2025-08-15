// Text that appears on rejection buttons.
const rejectText = ["reject", "decline", "deny", "disagree", "only necessary", "essential only",
    "use essential", "necessary cookies only", "continue without accepting", "continue without consent",
    "opt out", "dismiss", "essential cookies only", "reject all", "רק הכרחיים", "לדחות", "סירוב", "סרב",
    "דחה", "לסרב", "השתמש רק הכרחי", "לדחות הכל", "דחה הכל", "דחה הכול"].map(s => s.toLowerCase());

// Text that appears on accept buttons.
const acceptText = ["accept", "agree", "consent", "allow", "ok", "got it", "agree to all",
    "accept all and continue", "accept all", "אני מסכים", "מקבל", "אשר", "מסכים",
    "אישור"].map(s => s.toLowerCase());

// Selectors commonly found on the reject cookies button. use '.' for selectors found on the "class" attribute of the button,
// '#' for selectors found on the "id" attribute of the button, 
const buttonSelectors = ["#onetrust-reject-all-handler", "#optanon-toggle-display", "[aria-label='Reject all']",
    "#CybotCookiebotDialogBodyButtonDecline", "#CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll",
    "button[mode='secondary'][aria-label*='Reject']", ".qc-cmp2-summary-buttons button[aria-label*='Reject']",
    ".qc-cmp2-ui.qc-cmp2-footer .qc-cmp2-reject-all", "#cookie_action_close_header_reject",
    "button.didomi-components-button--decline", "[data-didomi-translate='action:reject']",
    "a.truste-button2", "button#truste-consent-required", "button#truste-reject-all",
    "button.axeptio_btn_dismiss", "button[aria-label*='Refuser']", "#wt-cli-reject-btn",
    "button[aria-label*='reject']", "button[aria-label*='decline']", ".cc-btn.cc-deny",
    "[aria-label='deny cookies']", ".iubenda-cs-reject-btn.iubenda-cs-btn-primary", ".cky-btn.cky-btn-reject",
    ".medium.cli-plugin-button.cli-plugin-main-button.cookie_action_close_header_reject.cli_action_button.wt-cli-reject-btn",
    ".wt-cli-element.medium cli-plugin-button.cli-plugin-main-button.cookie_action_close_header_reject.cli_action_button",
    "#shopify-pc__banner__btn-decline", ".shopify-pc__banner__btn-decline", ".d1t7tfxx", '.btn.secondary.reject-all'];

// ###### Settings ###### 
// Text that appears on settings button. Some sites hide the reject all inside the settings. 
const settingText = ["settings", "manage preferences", "manage options", "preferences", "customize", "more options",
    "custom settings", "הגדרת קובצי cookie", "הגדרות", "ניהול העדפות", "התאמה אישית", "עוד אפשרויות"];

// Text that appears on the save settings button.
const saveText = ["save", "save & exit", "save and exit", "save my choices", "apply", "confirm choices", "confirm selection",
    "submit preferences", "שמור", "החל", "אישור", "שמור וצא"];

// Text on a toggle all off.
const toggleAllText = ["turn off all", "disable all", "deactivate all", "reject all non-essential", "opt out all",
    "בטל הכל", "דחה הכל"];

// Selectors commonly found on the setting buttons. Same rules as for buttonSelectors when adding new selectors.
const settingsSelectors = [".cookie-settings-button", "#cookieSettingsBtn", "#onetrust-pc-btn-handler",
    "[aria-label='manage preferences']", "button:contains('manage preferences')", "[aria-label*='Manage'][aria-label*='preference']",
    "[aria-label*='settings']", "button[id*='settings']", "button[class*='settings']", "button[id*='preferences']",
    "button[class*='preferences']", ".ot-sdk-show-settings", "#onetrust-pc-btn-handler", "#truste-show-consent",
    ".qc-cmp2-summary-buttons .qc-cmp2-customize-settings",];

// Slectors for the save settings button.
const saveSelectors = [".save-preferences-button", "#saveAndExit", "[aria-label='save preferences']",
    "[aria-label*='Save'][aria-label*='preference']", "button[id*='save']", "button[class*='save']", "button[id*='apply']",
    "button[class*='apply']", "#onetrust-pc-btn-handler-save", "button#save", ".qc-cmp2-footer .qc-cmp2-save-and-exit"];

const bannerHints = ["[id*='cookie']", "[class*='cookie']", "[id*='consent']", "[class*='consent']",
    "[id*='gdpr']", "[class*='gdpr']", "[data-testid*='cookie']", "div[role='dialog']"];

// clickable items.
const candidateSelectors = [
    "button", "a", "[role='button']", "input[type='button']", "input[type='submit']"];

function normText(elem) {
    return (elem.innerText || elem.textContent || "").trim().toLowerCase();
}

function isVisible(elem) {
    const rect = elem.getBoundingClientRect();
    const style = window.getComputedStyle(elem);
    return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        elem.offsetParent !== null
    );
}

function isAccept(text) {
    return acceptText.some(t => text.includes(t));
}

function isReject(text) {
    return rejectText.some(t => text.includes(t));
}

function attemptClickReject(elem) {
    if (!elem || !isVisible(elem)) return false;
    const txt = normText(elem);
    if (!txt) return false;
    if (isReject(txt) && !isAccept(txt)) {
        attemptToClick(elem);
        return true;
    }
    return false;
}

function trySettingsThenReject() {
    if (clickKnown(KNOWN_SETTINGS_SELECTORS)) {
        setTimeout(() => {
            tryKnownSelectors();
        }, 500);
        return true;
    }
    return false;
}

function attemptToClick(elem) {
    try {
        elem.click();
    } catch (e) {
        try {
            const evt = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
            elem.dispatchEvent(evt);
        } catch (_) { }
    }
}

function* domRoots(root = document) {
    yield root;
    const walker = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
    let node;
    while ((node = walker.nextNode())) {
        if (node.shadowRoot) {
            yield node.shadowRoot;
            yield* domRoots(node.shadowRoot);
        }
    }
}

function getCandidates(root) {
    return candidateSelectors.flatMap(sel => Array.from(root.querySelectorAll(sel)));
}

function tryKnownSelectors() {
    for (const sel of buttonSelectors) {
        for (const root of domRoots()) {
            const elem = root.querySelector(sel);
            if (elem && isVisible(elem)) {
                attemptToClick(elem);
                return true;
            }
        }
    }
    return false;
}

function searchText() {
    for (const root of domRoots()) {
        const candidates = getCandidates(root);
        const nearBanner = candidates.filter(elem => {
            const text = normText(elem);
            if (!text) return false;
            let p = elem;
            for (let i = 0; i < 4 && p; i++, p = p.parentElement) {
                if (!p) break;
                const idc = (p.id || "").toLowerCase();
                const clc = (p.className || "").toString().toLowerCase();
                if (idc.includes("cookie") || idc.includes("consent") || idc.includes("gdpr") ||
                    clc.includes("cookie") || clc.includes("consent") || clc.includes("gdpr")) {
                    return true;
                }
            }
            return false;
        });
        const list = nearBanner.length ? nearBanner : candidates;
        for (const elem of list) {
            if (attemptClickReject(elem)) return true;
        }
    }
    return false;
}
function unlockPageIfDimmed() {
    let changed = false;
    const LOCK_RE = /(cookiewall|cookie|consent|gdpr|modal-open|no-scroll|noscroll|scroll-lock|overflow-hidden|disable-scroll|is-locked|stop-scrolling|overlay|backdrop)/i;
    const scope = [document.documentElement, document.body, ...Array.from(document.body ? document.body.children : [])].slice(0, 12);
    scope.forEach(elem => {
        if (!elem) return;
        [...elem.classList].forEach(c => {
            if (LOCK_RE.test(c)) { elem.classList.remove(c); changed = true; }
        });
        if (elem.hasAttribute("inert")) { elem.removeAttribute("inert"); changed = true; }
        const cs = getComputedStyle(elem);
        if (cs.overflow === "hidden") { elem.style.setProperty("overflow", "auto", "important"); changed = true; }
        if (cs.pointerEvents === "none") { elem.style.setProperty("pointer-events", "auto", "important"); changed = true; }
        if (parseFloat(cs.opacity) < 1) { elem.style.setProperty("opacity", "1", "important"); changed = true; }
        if (cs.filter && cs.filter !== "none") { elem.style.setProperty("filter", "none", "important"); changed = true; }
        if (cs.backdropFilter && cs.backdropFilter !== "none") { elem.style.setProperty("backdrop-filter", "none", "important"); changed = true; }
    });
    const center = document.elementsFromPoint(innerWidth / 2, innerHeight / 2);
    for (const elem of center) {
        if (!elem || elem === document.documentElement || elem === document.body) continue;
        const cs = getComputedStyle(elem);
        const r = elem.getBoundingClientRect();
        const covers = r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9;
        const fixedish = cs.position === "fixed" || cs.position === "absolute" || cs.position === "sticky";
        const highZ = (parseInt(cs.zIndex) || 0) >= 999;
        const blocks = cs.display !== "none" && cs.visibility !== "hidden" && cs.pointerEvents !== "none";
        if (covers && fixedish && highZ && blocks) {
            elem.style.setProperty("display", "none", "important");
            elem.style.setProperty("visibility", "hidden", "important");
            elem.style.setProperty("pointer-events", "none", "important");
            changed = true;
            break;
        }
    }
    document.querySelectorAll("#cookiewall, .cookiewall").forEach(elem => {
        elem.style.setProperty("display", "none", "important");
        elem.style.setProperty("visibility", "hidden", "important");
        elem.style.setProperty("pointer-events", "none", "important");
    });
    document.querySelectorAll('iframe[src*="consent.cookiebot.com"],iframe[src*="cookielaw.org"],iframe[id^="sp_message_iframe_"]').forEach(f => {
        f.style.setProperty("display", "none", "important");
        f.style.setProperty("visibility", "hidden", "important");
        f.style.setProperty("pointer-events", "none", "important");
    });
    return changed;
}

function hideConsentIframes() {
    document.querySelectorAll(
        'iframe[src*="consent.cookiebot.com"],iframe[src*="cookielaw.org"],iframe[id^="sp_message_iframe_"]'
    ).forEach(f => {
        f.style.setProperty("display", "none", "important");
        f.style.setProperty("visibility", "hidden", "important");
        f.style.setProperty("pointer-events", "none", "important");
    });
}

function hideBanners() {
    for (const root of domRoots()) {
        for (const sel of bannerHints) {
            root.querySelectorAll(sel).forEach(node => {
                if (!node || !isVisible(node)) return;
                const t = normText(node);
                if (!t) return
                const hasCookieWords =
                    /cookie|consent|gdpr|preferences|privacy/i.test(node.className + " " + node.id + " " + t);
                if (hasCookieWords) {
                    node.style.setProperty("display", "none", "important");
                    node.style.setProperty("visibility", "hidden", "important");
                }
            });
        }
    }
}

function handleIframes() {
    document.querySelectorAll("iframe").forEach(iframe => {
        try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document;
            if (!doc) return;
            if (tryKnownSelectors()) return;
            searchText();
            hideBanners();
        } catch (_) {
        }
    });
}

function attemptReject() {
    let acted = false;
    if (tryKnownSelectors()) acted = true;
    if (!acted && searchText()) acted = true;
    if (acted) {
        hideBanners()
        hideConsentIframes();
        unlockPageIfDimmed();
    }
    handleIframes();
    return acted;
}
function isBannerPresent(root = document) {
    return !!root.querySelector(
        "[id*='cookie' i],[class*='cookie' i],[id*='consent' i],[class*='consent' i],[id*='gdpr' i],[class*='gdpr' i],div[role='dialog']"
    );
}

let timer = null;
function scheduleAttempt(delay = 200) {
    if (timer) return;
    timer = setTimeout(() => {
        timer = null;
        attemptReject();
    }, delay);
}

function bootstrap() {
    let tries = 0;
    let intervalMs = 300;
    const maxTries = 8;
    let quietUntil = 0;
    const QUIET_MS_AFTER_SUCCESS = 30000;

    const wrappedAttempt = () => {
        if (Date.now() < quietUntil) return;
        const acted = attemptReject();
        if (acted) quietUntil = Date.now() + QUIET_MS_AFTER_SUCCESS;
    };
    (function tick() {
        if (tries < maxTries) {
            tries++;
            if (isBannerPresent()) wrappedAttempt();
            setTimeout(tick, intervalMs);
            intervalMs = Math.min(3000, Math.floor(intervalMs * 1.7));
        }
    })();
    const mo = new MutationObserver(muts => {
        for (const m of muts) {
            if (m.addedNodes && m.addedNodes.length) {
                if (isBannerPresent()) scheduleAttempt(200);
                break;
            }
        }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && isBannerPresent()) scheduleAttempt(100);
    });
}
function normalizeHost(h) {
    return (h || "").replace(/^www\./, "");
}

function endsWithHost(host, d) {
    host = normalizeHost(host); return host === d || host.endsWith("." + d);
}

function isBlocked(host, list) {
    host = normalizeHost(host);
    return (list || []).some(d => endsWithHost(host, d));
}

chrome.storage.sync.get({ paused: false, blockedHosts: [] }, cfg => {
    if (cfg.paused) return;
    if (isBlocked(location.hostname, cfg.blockedHosts)) return;
    bootstrap();
});

chrome.storage.onChanged.addListener(changes => {
    if (changes.paused || changes.blockedHosts) {
        location.reload();
    }
});
