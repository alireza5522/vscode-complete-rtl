function isRtlCharacter(char) {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u1EE0-\u1EEF]/;
    return rtlRegex.test(char);
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
    console.log("[RTL EXTENSION] >> runner");
    const NBSPACE = " ";
    const lines_els = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-lines");
    for (let i = 0; i < lines_els.length; i++) {
        if (flags[i]) {
            console.log("[RTL EXTENSION] >> zzz");
            const editor_el = document.querySelector("div.monaco-workbench .editor div.content");
            const content_el = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content")[i];
            const container_el = document.querySelectorAll("div.monaco-workbench .editor div.content .editor-container")[i];
            const editor_instance_el = document.querySelectorAll("div.monaco-workbench .editor div.content .editor-container .editor-instance")[i];
            const overflow_el = document.querySelectorAll("div.monaco-workbench .editor div.content .overflow-guard")[i];
            const editor_scrollable_el = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .editor-scrollable")[i];
            const wsize = editor_el.style.width;
            if (eval(String(wsize).replace("px", "")) < 200) {
                return;
            }
            const minimap = document.querySelectorAll(".minimap")[i];
            const minimap_shadow = document.querySelectorAll(".minimap-shadow-visible")[i];
            const minimap_layer = document.querySelectorAll(".minimap-decorations-layer")[i];
            const horiz_scroller = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .editor-scrollable .scrollbar.horizontal")[i];
            const scrollbar = document.querySelectorAll(".invisible.scrollbar.vertical")[0];
            const numberbar = editor_el.querySelectorAll(".margin")[i * 2 + 1];
            const lines_el = content_el.querySelector(".view-lines");
            const overlays_el = content_el.querySelector(".view-overlays");
            const margin_minimap = minimap_layer.style.width;
            const margin_scrollbar = scrollbar.style.width;
            const margin_numberbar = numberbar.style.width;
            const wfix = 16; //px
            const w = String(eval(String(wsize).replace("px", "")) - wfix - eval(String(margin_minimap).replace("px", "")) - eval(String(margin_numberbar).replace("px", "")) - eval(String(margin_scrollbar).replace("px", ""))) + "px";

            // content_el.style.transform = `scaleX(-1)`;
            container_el.style.transform = `scaleX(-1)`;
            editor_instance_el.style.transform = `scaleX(-1)`;
            overflow_el.style.transform = `scaleX(-1)`;
            lines_el.style.transform = `scaleX(-1)`;
            overlays_el.style.transform = `scaleX(-1)`;
            editor_scrollable_el.style.transform = `scaleX(-1)`;

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
                const maxLen = Array.from(line_els).reduce((prev, el) => {
                    s.innerText = el.getElementsByTagName("span").item(0).innerText;
                    return Math.max(prev, s.getBoundingClientRect().width);
                }, initialValue = 0);
                
                // lines_el.style.minWidth = String(maxLen + 150) + "px";
                // content_el.style.transform = `translateX(-${String(maxLen-100) + "px"})`;
                content_el.style.marginLeft = String(eval(String(margin_minimap).replace("px", ""))) + "px";
                // minimap.style.left = margin_numberbar;
                // minimap_shadow.style.left = "unset";
                // minimap_shadow.style.right = "-2px";
                // horiz_scroller.style.left = margin_minimap;
                for (let i = 0; i < line_els.length; i++) {
                    const line_el = line_els.item(i);

                    line_el.style.transform = `scaleX(-1)`;
                    // line_el.getElementsByTagName("span").item(0).style.transform = `scaleX(-1)`;

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
                        const overlay_el = Array.from(overlay_els).filter((el) => el.style.top === line_el.style.top)[0];

                        overlay_el.style.transform = `scaleX(-1)`;

                        const svg = overlay_el.querySelector('svg');
                        const span = pspan.getElementsByTagName('span').item(0);
                        if (isRtlCharacter(span.innerText.trim()[0])) {
                            Array.from(pspan.children).forEach((span) => span.style.unicodeBidi = "embed");
                            if (overlay_el.firstElementChild) {
                                const length = Array.from(pspan.children).reduce(((prev = 0, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                                if (svg) {
                                    // svg.style.left = `calc(100% - ${String(length) + "px"})`;
                                }
                                // overlay_el.style.width = w;
                                if (overlay_el.firstElementChild.getBoundingClientRect().width > length) {
                                    // overlay_el.firstElementChild.style.width = String(length) + "px";
                                    // overlay_el.firstElementChild.style.left = "unset";
                                    // overlay_el.firstElementChild.style.right = 0;
                                }
                            }
                            pspan.style.textAlign = "right";
                            pspan.style.direction = "rtl";
                            pspan.style.textAlignLast = "right";
                            overlay_el.style.textAlign = 'right';
                            if (overlay_el.firstChild && overlay_el.firstElementChild.className.includes("current-line")) {
                                const className = content_el.className;
                                const rtlClass = " __rtl-text-align-left";
                                if (className.includes(rtlClass)) {
                                    content_el.className = content_el.className.replace(rtlClass, "");
                                }
                            }
                        }
                        else {
                            Array.from(pspan.children).forEach((span) => span.style.unicodeBidi = isRtlCharacter(span.textContent.trim()[0]) ? "plaintext" : "embed");
                            if (overlay_el.firstElementChild) {
                                const length = Array.from(pspan.children).reduce(((prev = 0, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                                if (overlay_el.firstElementChild.getBoundingClientRect().width > length) {
                                    // overlay_el.firstElementChild.style.width = String(length) + "px";
                                }
                            }
                            pspan.style.textAlign = "left";
                            pspan.style.direction = "ltr";
                            pspan.style.textAlignLast = "left";
                            overlay_el.style.textAlign = 'left';
                            if (overlay_el.firstChild && overlay_el.firstElementChild.className.includes("current-line")) {
                                const className = content_el.className;
                                const rtlClass = " __rtl-text-align-left";
                                if (!className.includes(rtlClass)) {
                                    content_el.className += rtlClass;
                                }
                            }
                        }
                        if (svg && overlay_el.firstElementChild.className.includes('selected-text')) {
                            const isRtl = isRtlCharacter(pspan.firstElementChild.textContent.trim()[0]);
                            //@ TODO
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
                await runner(flag = flag);
                clearInterval(__rtl_extension_interval);
                __rtl_extension_interval = null;
                __rtl_extension_queue_timer = 0;
                return;
            }
            __rtl_extension_queue_timer++;
        }, 1);
    }
};

let initEventCounter = 0;
let resizeObserver;
let mutationObserver;
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
                flags = [...flags, true];
                if (init) {
                    initEventCounter++;
                    if (initEventCounter === 1) {
                        window.addEventListener('resize', async (e) => {
                            await doer(init = false);
                        });
                    }
                    if (resizeObserver) {
                        resizeObserver.disconnect();
                    }
                    resizeObserver = new ResizeObserver(async (entries) => {
                        await doer(init = false);
                    });
                    let element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .monaco-editor")[idx];
                    resizeObserver.observe(element);
                    if (mutationObserver) {
                        mutationObserver.disconnect();
                    }
                    mutationObserver = new MutationObserver(async (entries) => {
                        await doer(init = false);
                    });
                    element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-overlays")[idx];
                    mutationObserver.observe(element, { subtree: true, childList: true, characterData: true });
                    element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-lines")[idx];
                    mutationObserver.observe(element, { subtree: true, childList: true, characterData: true });
                    element = (el = document.querySelectorAll("div.monaco-workbench .editor div.content .overflow-guard .scrollbar.horizontal .slider")) && el[idx];
                    element && mutationObserver.observe(element, { attributeFilter: ["style"] });
                }
            }
            else {
                flags = [...flags, false];
            }
            idx++;
        }
        const timeout = init ? 50 : 5;
        await runner_distint(flags = flags, timeout);
    }, 1);

};

document.addEventListener('DOMContentLoaded', async (e) => {
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
    const mutationObserver = new MutationObserver(async (entries) => {
        editor_content = document.getElementById("workbench.parts.editor").querySelector("div.content");
        if (editor_content && !editor_content.className.includes("empty")) {
            console.log("[RTL EXTENSION] >> init");
            await doer(init = true);
        }
    });
    mutationObserver.observe(editor_content, { attributeFilter: ["class"] });
    const name_els = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .tabs .tabs-container .tab.active");
    name_els.forEach(name_el => name_el && mutationObserver.observe(name_el, { attributes: true }));
    await doer(init = true);
});


