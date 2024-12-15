const NBSPACE = " ";

function isRtlCharacter(char) {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u1EE0-\u1EEF]/;
    return rtlRegex.test(char);
}

function isEmoji(char) {
    const emojiRegex = /[\p{Emoji}]/u;
    return emojiRegex.test(char);
}


function getSubstringWidthInContext(fullText, partText) {
    const container = document.getElementById("__rtl-text-measurer");
    container.textContent = fullText;
    const range = document.createRange();
    const startIndex = fullText.indexOf(partText);
    if (startIndex === -1) {
        throw new Error("Substring not found in full text.");
    }
    const endIndex = startIndex + partText.length;
    const textNode = container.firstChild;
    range.setStart(textNode, startIndex);
    range.setEnd(textNode, endIndex);
    const rect = range.getBoundingClientRect();
    const w = rect.width;
    return w;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const runner = async (flags = []) => {
    // console.log("[RTL EXTENSION] >> runner");
    const lines_els = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-lines");
    for (let i = 0; i < lines_els.length; i++) {
        if (flags[i]) {
            const editor_el = document.querySelector("div.monaco-workbench .editor div.content");
            const content_el = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content")[i];
            // const container_el = document.querySelectorAll("div.monaco-workbench .editor div.content .editor-container")[i];
            // const editor_instance_el = document.querySelectorAll("div.monaco-workbench .editor div.content .editor-container .editor-instance")[i];
            // const monaco_el = document.querySelectorAll("div.monaco-workbench .editor div.content .monaco-editor")[i];
            // const overflow_el = document.querySelectorAll("div.monaco-workbench .editor div.content .overflow-guard")[i];
            // const editor_scrollable_el = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .editor-scrollable")[i];
            // const minimap = document.querySelectorAll(".minimap")[i];
            // const minimap_shadow = document.querySelectorAll(".minimap-shadow-visible")[i];
            // const minimap_layer = document.querySelectorAll(".minimap-decorations-layer")[i];
            // const horiz_scroller = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .editor-scrollable .scrollbar.horizontal")[i];
            // const vert_scroller = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .editor-scrollable .scrollbar.vertical")[i];
            // const vert_scroller_canvas = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .editor-scrollable .decorationsOverviewRuler")[i];
            // const scrollbar = document.querySelectorAll(".invisible.scrollbar.vertical")[0];
            // const numberbar = editor_el.querySelectorAll(".margin")[i * 2 + 1];
            const lines_el = content_el.querySelector(".view-lines");
            const overlays_el = content_el.querySelector(".view-overlays");

            setTimeout(async () => {
                const line_els = lines_el.querySelectorAll("div.view-line");
                const overlay_els = overlays_el.querySelectorAll('div');
                let interval_timer = 0;
                while (!line_els || !line_els.item(0) || !line_els.length || !overlay_els || !overlay_els.length) {
                    interval_timer++;
                    if (interval_timer > 2500) {
                        return;
                    }
                    await sleep(1);
                }
                const s = document.createElement('span');
                s.id = "__rtl-text-measurer";
                s.style.opacity = 0;
                s.style.visibility = 'hidden';
                s.style.display = "inline-block";
                s.style.position = 'absolute';
                s.style.whiteSpace = 'nowrap';
                s.style.unicodeBidi = 'plaintext';
                s.style.fontSize = lines_el.style.fontSize;
                s.style.fontFamily = lines_el.style.fontFamily;
                s.style.fontWeight = lines_el.style.fontWeight;
                s.style.fontFeatureSettings = lines_el.style.fontFeatureSettings;
                s.style.fontVariationSettings = lines_el.style.fontVariationSettings;
                s.style.lineHeight = lines_el.style.lineHeight;
                s.style.letterSpacing = lines_el.style.letterSpacing;
                s.style.height = lines_el.style.lineHeight;
                editor_el.appendChild(s);
                // const maxLen = Array.from(line_els).reduce((prev, el) => {
                //     s.innerText = el.getElementsByTagName("span").item(0).innerText;
                //     return Math.max(prev, s.getBoundingClientRect().width);
                // }, initialValue = 0);

                for (let i = 0; i < line_els.length; i++) {
                    const line_el = line_els.item(i);
                    let interval_timer = 0;
                    const interval = setInterval(async () => {
                        interval_timer++;
                        const pspan = line_el.getElementsByTagName('span').item(0);
                        if (!pspan || !pspan.firstElementChild || !pspan.firstElementChild.textContent || pspan.firstElementChild.textContent.length < 1) {
                            return;
                        }
                        else if (interval_timer > 2500) {
                            clearInterval(interval);
                            return;
                        }
                        clearInterval(interval);
                        // const overlay_el = Array.from(overlay_els).filter((el) => el.style.top === line_el.style.top)[0];
                        const span = pspan.getElementsByTagName('span').item(0);
                        const rtl = Array.from(span.innerText.trim()).reduce((prev, c) => {
                            if (prev === null) {
                                if (isEmoji(c) || c === NBSPACE) {
                                    return null;
                                }
                                else {
                                    return isRtlCharacter(c);
                                }
                            }
                            return prev;
                        }, null);
                        if (rtl) {
                            pspan.style.textAlign = "right";
                            pspan.style.textAlignLast = "right";
                            pspan.style.direction = "rtl";
                            Array.from(pspan.children).forEach((span) => span.style.unicodeBidi = "embed");
                            // if (overlay_el.firstElementChild) {
                            //     const length = Array.from(pspan.children).reduce(((prev = 0, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                            // }
                        }
                        else {
                            pspan.style.textAlign = "left";
                            pspan.style.textAlignLast = "left";
                            pspan.style.direction = "ltr";
                            Array.from(pspan.children).forEach((span) => span.style.unicodeBidi = isRtlCharacter(span.textContent.trim()[0]) ? "plaintext" : "embed");
                            // if (overlay_el.firstElementChild) {
                            //     const length = Array.from(pspan.children).reduce(((prev = 0, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                            // }
                        }
                    }, 1);
                }
            }, 1);
        }
    }
};

let __rtl_extension_queue_timer = 0;
let __rtl_extension_interval = null;
const runner_distint = async (flag = null, timeout = 50) => {
    if (!__rtl_extension_interval) {
        __rtl_extension_interval = setInterval(async () => {
            if (__rtl_extension_queue_timer > timeout) {
                clearInterval(__rtl_extension_interval);
                __rtl_extension_interval = null;
                __rtl_extension_queue_timer = 0;
                await runner(flag = flag);
                return;
            }
            __rtl_extension_queue_timer++;
        }, 1);
    }
};

let initEventCounter = 0;
let resizeObservers = [];
let mutationObservers = [];
const doer = async (init = false) => {
    const interval = setInterval(async () => {
        const content_els = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content");
        if (!content_els.item(0)) {
            return;
        }
        clearInterval(interval);
        const name_els = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .tabs .tabs-container .tab.active");
        let flags = [];
        let idx = 0;        
        for (let el of name_els) {
            if (/(\w+)\.rtl\.(\w+)$/g.test(el.textContent.trim())) {
                content_els[idx].className = String(content_els[idx].className).replace(" __rtl-lines", "");
                content_els[idx].className += " __rtl-lines";
                const lines_el = content_els[idx].querySelector(".view-lines");
                const line_els = lines_el.querySelectorAll("div.view-line");
                const overlays_el = content_els[idx].querySelector(".view-overlays");
                const overlay_els = overlays_el.querySelectorAll('div');
                try {
                    const curr_overlay_el = Array.from(overlay_els).filter((el) => el.firstElementChild && String(el.firstElementChild.className).includes("current-line"))[0];
                    const line_el = Array.from(line_els).filter((el) => el.style.top === curr_overlay_el.style.top)[0];
                    const rtl = Array.from(String(line_el.getElementsByTagName("span").item(0).innerText.trim())).reduce((prev, c) => {
                        if (prev === null) {
                            if (isEmoji(c) || c === NBSPACE) {
                                return null;
                            }
                            else {
                                return isRtlCharacter(c);
                            }
                        }
                        return prev;
                    }, null);
                    if (!rtl) {
                        if (!String(content_els[idx].className).includes("__rtl-lines-normal")) {
                            content_els[idx].className += " __rtl-lines-normal";
                        }
                    }
                    else {
                        content_els[idx].className = String(content_els[idx].className).replace(" __rtl-lines-normal", "");
                    }
                }
                catch { }
                flags = [...flags, true];
                if (init) {
                    initEventCounter++;
                    if (initEventCounter === 1) {
                        window.addEventListener('resize', async (e) => {
                            await doer(init = false);
                        });
                    }
                    let resizeObserver = resizeObservers[idx];
                    if (resizeObserver) {
                        resizeObserver.disconnect();
                    }
                    resizeObserver = new ResizeObserver(async (entries) => {
                        await doer(init = false);
                    });
                    let element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .monaco-editor")[idx];
                    resizeObserver.observe(element);
                    resizeObservers[idx] = resizeObserver;
                    let mutationObserver = mutationObservers[idx];
                    if (mutationObserver) {
                        mutationObserver.disconnect();
                    }
                    mutationObserver = new MutationObserver(async (entries) => {
                        await doer(init = false);
                    });
                    // Editor Overlays
                    element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-overlays")[idx];
                    try {
                        mutationObserver.observe(element, { subtree: true, childList: true, characterData: true });
                    } catch { }
                    // Editor Lines
                    element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-lines")[idx];
                    try {
                        mutationObserver.observe(element, { subtree: true, childList: true, characterData: true });
                    } catch { }
                    mutationObservers[idx] = mutationObserver;
                }
            }
            else {
                flags = [...flags, false];
            }
            idx++;
        }
        const timeout = init ? 23 : 2;
        await runner_distint(flags = flags, timeout);
    }, 1);
};

document.addEventListener('DOMContentLoaded', async (e) => {
    async function start() {
        console.log("[RTL EXTENSION] >> START");
        let editor_content = null;
        let rate_limit = 0;
        do {
            await sleep(1);
            if (rate_limit >= 5000) {
                console.error("[RTL EXTENSION] COULD NOT FIND THE EDITOR CONTENT ELEMENT! >> exited the code");
                return;
            }
            editor_content = (el = document.getElementById("workbench.parts.editor")) && el.querySelector("div.content");
            rate_limit++;
        } while (!editor_content);
        let mutationObserver = new MutationObserver(async (entries) => {
            editor_content = document.getElementById("workbench.parts.editor").querySelector("div.content");
            if (editor_content && !editor_content.className.includes("empty")) {
                // console.log("[RTL EXTENSION] >> init");
                await doer(init = true);
            }
        });
        mutationObserver.observe(editor_content, { attributeFilter: ["class"] });
        // Tabs
        let elements = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .tabs-container");
        try{
            elements.forEach(el => el && mutationObserver.observe(el, { subtree: true, childList: true, attributes: true }));
        } catch {}
        // Dividers
        elements = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .monaco-sash");
        try{
            elements.forEach(el => el && mutationObserver.observe(el, { subtree: true, childList: true, attributes: true }));
        } catch {}

        await doer(init = true);
    }

    // modify corruption warning notification
    try {
        let limiter = 0;
        const interval = setInterval(() => {
            if (limiter > 2500) {
                clearInterval(interval);
                return;
            }
            const notifs_parent = document.querySelectorAll(".notifications-toasts .monaco-list-rows");
            const notifs = document.querySelectorAll(".notifications-toasts .monaco-list-row");

            if (!notifs.length) {
                limiter++;
                return;
            }
            clearInterval(interval);
            let idx = 0;
            notifs.forEach((notif) => {
                const label = notif.getAttribute("aria-label");
                if (String(label).includes("appears to be corrupt")) {
                    notifs_parent[idx].style.height = "160px";
                    notifs[idx].style.height = "160px";
                    const icon = notif.querySelector(".codicon.codicon-warning");
                    if (icon) {
                        icon.className = icon.className.replace("codicon-warning", "codicon-vscode");
                        icon.style.color = "#8146e8";
                    }
                    const setting = notif.querySelector(".notification-list-item-toolbar-container .monaco-dropdown");
                    if (setting) {
                        setting.style.display = "none";
                    }
                    const message = notif.querySelector(".notification-list-item-message");
                    if (message) {
                        try {
                            const span = message.getElementsByTagName("span").item(0);
                            span.innerHTML = `Due to the need of VScode core modification by <span style="font-weight: bold;">RTL Text Documents</span> extension, VScode warns you for this change!<br><br>To dismiss this notification from now on, please close all your VScode windows and reopen them.`;
                        } catch { }
                    }
                }
                idx++;
            });
        }, 1);
    } catch { }

    try {
        await start();
    } catch (error) {
        console.error("[RTL EXTENSION]", error);
    }
});


