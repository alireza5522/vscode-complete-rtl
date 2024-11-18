function isRtlCharacter(char) {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u1EE0-\u1EEF]/;
    return rtlRegex.test(char);
}

function fixbdi(text) {
    const tarr = String(text).split("<");
    let res = "";
    for (let piece of tarr) {
        const tarrarr = piece.split(">");
        if (tarrarr.length === 2 && tarrarr[0] !== "bdi") {
            res += `<${tarrarr[0]}><bdi>${tarrarr[1]}<bdi>`;
        }
        else {
            res += piece;
        }
    }
    return res;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const runner = async (flags = []) => {
    console.log("zzz");
    const ZWNJ = "‌";
    const NBSPACE = " ";
    const lines_els = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-lines");
    for (let i = 0; i < lines_els.length; i++) {
        if (flags[i]) {
            // const el = lines_els[i];
            const content_el = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content")[i];
            const editor_el = document.querySelectorAll("div.monaco-workbench .editor div.content")[i];
            const wsize = editor_el.style.width;
            if (eval(String(wsize).replace("px", "")) < 250) {
                return;
            }
            // const monaco_scrollable_el = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .monaco-scrollable-element")[i];
            // const editor_container_el = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .editor-container")[i];
            // const monaco_el = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .monaco-editor")[i];
            // const editor_scrollable = document.querySelectorAll("div.content [class*='-container'] .editor-scrollable")[i];
            const minimap = document.querySelectorAll(".minimap-decorations-layer")[i];
            const scrollbar = document.querySelectorAll(".invisible.scrollbar.vertical")[0];
            const numberbar = editor_el.querySelectorAll(".margin")[i * 2 + 1];
            const lines_el = content_el.querySelector(".view-lines");
            const overlays_el = content_el.querySelector(".view-overlays");
            const margin_minimap = minimap.style.width;
            const margin_scrollbar = scrollbar.style.width;
            const margin_numberbar = numberbar.style.width;
            const wfix = 50; //px
            const w = String(eval(String(wsize).replace("px", "")) - wfix - eval(String(margin_minimap).replace("px", "")) - eval(String(margin_numberbar).replace("px", "")) - eval(String(margin_scrollbar).replace("px", ""))) + "px";
            // editor_el.firstElementChild.style.width = w;
            // monaco_scrollable_el.style.width = w;
            // monaco_scrollable_el.firstElementChild.style.width = w;
            // monaco_scrollable_el.firstElementChild.firstElementChild.style.width = w;
            // editor_container_el.style.width = w;
            // editor_container_el.firstChild.style.width = w;
            // monaco_el.style.width = w;
            // monaco_el.firstChild.style.width = w;
            // editor_scrollable.style.width = w;
            lines_el.style.width = w;
            await setTimeout(async () => {
                const line_els = lines_el.querySelectorAll("div.view-line");
                const overlay_els = overlays_el.querySelectorAll('div');
                let interval_timer = 0;
                while (!line_els || !line_els.item(0) || !line_els.length || !overlay_els || !overlay_els.length) {
                    interval_timer++;
                    if (interval_timer > 2500) {
                        return;
                    }
                    sleep(1);
                }
                for (let i = 0; i < line_els.length; i++) {
                    const line_el = line_els.item(i);
                    line_el.style.width = w;
                    let interval_timer = 0;
                    const interval = await setInterval(async () => {
                        interval_timer++;
                        const pspan = line_el.getElementsByTagName('span').item(0);
                        if (!pspan || !pspan.firstElementChild || !pspan.firstElementChild.textContent || pspan.firstElementChild.textContent.length < 1) {
                            return;
                        }
                        else if (interval_timer > 1000) {
                            clearInterval(interval);
                            return;
                        }
                        clearInterval(interval);
                        const overlay_el = Array.from(overlay_els).filter((el) => el.style.top === line_el.style.top)[0];
                        const svg = overlay_el.querySelector('svg');
                        if (svg && overlay_el.firstElementChild.className.includes('selected-text')) {
                            const s = document.createElement('span');
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
                            const selectedTextW = Array.from(overlay_el.querySelectorAll("div.selected-text")).reduce(((prev, el) => prev + el.getBoundingClientRect().width), initialValue=0);
                            let limited_idx = 0;
                            let limited_jdx = 0;
                            let limited_space_count = 0;
                            let flag = false;
                            let ongoingW = 0;
                            for (let span of pspan.getElementsByTagName('span')) {
                                let ongoingString = "";
                                let text = Array.from(span.innerText).join(ZWNJ);
                                const isRtl = isRtlCharacter(text.trim()[0]);
                                if (isRtl) {
                                    // text = text.split(NBSPACE).reverse().join(NBSPACE);
                                }
                                limited_jdx = 0;
                                console.log("kosoo i", limited_idx);
                                for (let ch of text){
                                    ongoingString += ch;
                                    s.innerText = ongoingString;
                                    const strW = s.offsetWidth;
                                    console.log("kosoo j", limited_jdx, ongoingW + strW, selectedTextW, `'${ch}'`);
                                    
                                    if (ch===NBSPACE){
                                        limited_space_count++;
                                    }
                                    if (Math.round(ongoingW + strW) >= selectedTextW){
                                        flag = true;
                                        // break;
                                    }
                                    limited_jdx++;
                                }
                                if(flag){
                                    // break;
                                }
                                s.innerText = ongoingString;
                                const strW = Math.round(s.offsetWidth);
                                ongoingW += strW;
                                limited_idx++;
                            }
                            console.log("kiri", selectedTextW, limited_idx, limited_jdx, limited_space_count);
                            return;
                            ongoingW = 0;
                            let circleNumTop = 0;
                            const circleCount = limited_space_count;
                            let circleNumRear = circleCount-1;
                            let idx = 0;
                            for (let span of pspan.getElementsByTagName('span')) {
                                if (idx>limited_idx){
                                    break;
                                }
                                let text = span.innerText;
                                const isRtl = isRtlCharacter(text.trim()[0]);
                                if (isRtl) {
                                    text = text.split(NBSPACE).reverse().join(NBSPACE);
                                }
                                let jdx = 0;
                                for (let ch of text) {
                                    if(idx===limited_idx && jdx>limited_jdx){
                                        break;
                                    }
                                    s.innerText = ch;
                                    const chw = s.getBoundingClientRect().width;
                                    ongoingW += chw;
                                    if (ch === NBSPACE) {
                                        let circle = null;
                                        if (isRtl){
                                            circle = svg.querySelectorAll("circle").item(circleNumRear);
                                            circleNumRear--;
                                        }
                                        else{
                                            circle = svg.querySelectorAll("circle").item(circleNumTop);
                                            circleNumTop++;
                                        }
                                        if(circle){
                                            circle.style.cx = ongoingW - chw/2;
                                        }
                                    }
                                    jdx++;
                                }
                                idx++;
                            }
                            s.remove();
                        }
                        const span = pspan.getElementsByTagName('span').item(0);
                        if (isRtlCharacter(span.innerText.trim()[0])) {
                            if (overlay_el.firstElementChild) {
                                const length = Array.from(pspan.children).reduce(((prev = 0, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                                if (overlay_el.querySelector('svg')){
                                    overlay_el.querySelector('svg').style.left = `calc(100% - ${String(length) + "px"})`;
                                }
                                overlay_el.style.width = w;
                                if (overlay_el.firstElementChild.getBoundingClientRect().width > length) {
                                    overlay_el.firstElementChild.style.width = String(length) + "px";
                                    overlay_el.firstElementChild.style.left = "unset";
                                    overlay_el.firstElementChild.style.right = 0;
                                }
                            }
                            pspan.style.textAlign = "right";
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
                            if (overlay_el.firstElementChild) {
                                const length = Array.from(pspan.children).reduce(((prev = 0, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                                if (overlay_el.firstElementChild.getBoundingClientRect().width > length) {
                                    overlay_el.firstElementChild.style.width = String(length) + "px";
                                }
                            }
                            pspan.style.textAlign = "left";
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
                flags = [...flags, true];
                if (init) {
                    content_els[idx].className += " __rtl-lines";
                    document.addEventListener('keydown', (e) => {
                        if (e.code.toLowerCase() === "arrowleft") {
                            console.log("SIN");
                        }
                    });
                    window.addEventListener('resize', async (e) => {
                        await doer(init = false);
                    });
                    const resizeObserver = new ResizeObserver(async (entries) => {
                        await doer(init = false);
                    });
                    let element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .monaco-editor")[idx];
                    resizeObserver.observe(element);
                    const mutationObserver = new MutationObserver(async (entries) => {
                        await doer(init = false);
                    });
                    element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content")[idx];
                    mutationObserver.observe(element, { subtree: true, childList: true, characterData: true });
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
    await doer(init = true);
});


