function isRtlCharacter(char) {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u1EE0-\u1EEF]/;
    return rtlRegex.test(char);
}

function getSubstringWidthInContext(fullText, partText) {
    const container = document.getElementById("__rtl-text-measurer");

    // Set the container's text to the full text for measurement
    container.textContent = fullText;
    // Create a Range object to determine the width of the specific substring
    const range = document.createRange();

    // Find the start index and end index of the substring within the full text
    const startIndex = fullText.indexOf(partText);
    if (startIndex === -1) {
        throw new Error("Substring not found in full text.");
    }
    const endIndex = startIndex + partText.length;

    // Create text nodes to measure
    const textNode = container.firstChild;
    range.setStart(textNode, startIndex);
    range.setEnd(textNode, endIndex);

    // Get the bounding rectangle of the selected substring
    const rect = range.getBoundingClientRect();
    const w = rect.width;
    console.log("noob", `fullText:'${fullText}'`, `partText:'${partText}'`, `w:${w}`);

    return w;
}

function getTextWidthInContext(fullText, partText) {
    const fontSettings = 'normal normal 14px "Consolas", "Courier New", monospace';

    // Create a canvas element in-memory
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = fontSettings;

    // Measure the width of the full text
    const fullWidth = context.measureText(fullText).width;

    // Measure the width of the text before and after the part text in the full text
    const startIndex = fullText.indexOf(partText);
    if (startIndex === -1) {
        throw new Error("Part not found in input text.");
    }

    const beforePartText = fullText.substring(0, startIndex);
    const afterPartText = fullText.substring(startIndex + partText.length);

    // Measure widths
    const beforeWidth = context.measureText(beforePartText).width;
    const afterWidth = context.measureText(afterPartText).width;

    // The width of the partText within the context of the full text
    const partWidthInContext = fullWidth - beforeWidth - afterWidth;

    return partWidthInContext;
}

function extractWithProperForm(inputText, partToExtract) {
    console.log("noob", inputText, partToExtract);

    // Letters with possible connectivity in Arabic/Persian
    const connectable = [
        "ب", "پ", "ت", "ث", "ج", "ح", "خ", "س", "ش", "ص", "ض",
        "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ک", "ل", "م", "ن",
        "گ", "ی", "ه", "ا"
    ];

    // Helper function to determine the proper form of a letter
    function getProperForm(text, index) {
        const letter = text[index];
        const prev = text[index - 1];
        const next = text[index + 1];

        let form = letter;

        // Check if the letter is connectable and if it needs a different form.
        if (connectable.includes(letter)) {
            if (prev && connectable.includes(prev)) {
                form = "‍" + letter; // Add zero-width joiner before if connected to previous letter
            }
            if (next && connectable.includes(next)) {
                form = form + "‍"; // Add zero-width joiner after if connected to next letter
            }
        }
        return form;
    }

    // Find the starting index of the part to extract.
    const startIndex = inputText.indexOf(partToExtract);
    if (startIndex === -1) {
        throw new Error("Part not found in input text."); // Improved error handling
    }

    // Construct the result with proper letter forms, considering both ends
    let result = "";
    for (let i = startIndex; i < startIndex + partToExtract.length; i++) {
        result += getProperForm(inputText, i);
    }

    return result;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const runner = async (flags = []) => {
    console.log("zzz");
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
            setTimeout(async () => {
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
                let pspan = null;
                for (let i = 0; i < line_els.length; i++) {
                    const line_el = line_els.item(i);
                    line_el.style.width = w;
                    let interval_timer = 0;
                    const interval = setInterval(async () => {
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
                        const span = pspan.getElementsByTagName('span').item(0);
                        if (isRtlCharacter(span.innerText.trim()[0])) {
                            Array.from(pspan.children).forEach((span) => span.style.unicodeBidi = "embed");
                            if (overlay_el.firstElementChild) {
                                const length = Array.from(pspan.children).reduce(((prev = 0, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                                if (svg) {
                                    svg.style.left = `calc(100% - ${String(length) + "px"})`;
                                }
                                overlay_el.style.width = w;
                                if (overlay_el.firstElementChild.getBoundingClientRect().width > length) {
                                    overlay_el.firstElementChild.style.width = String(length) + "px";
                                    overlay_el.firstElementChild.style.left = "unset";
                                    overlay_el.firstElementChild.style.right = 0;
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
                                    overlay_el.firstElementChild.style.width = String(length) + "px";
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
                            let left_offset = 0;
                            const isRtl = isRtlCharacter(pspan.firstElementChild.textContent.trim()[0]);
                            if (isRtl) {
                                if ((len = overlay_el.querySelectorAll("div.selected-text").length) > 1) {
                                    left_offset = overlay_el.getBoundingClientRect().width - eval(String(overlay_el.querySelector("div.selected-text").style.left).replace("px", "")) - (eval(String(overlay_el.querySelectorAll("div.selected-text").item(len - 1).style.left).replace("px", "")) - eval(String(overlay_el.querySelectorAll("div.selected-text").item(0).style.left).replace("px", "")) + overlay_el.querySelectorAll("div.selected-text").item(len - 1).getBoundingClientRect().width);
                                }
                                else {
                                    if (String(overlay_el.querySelector("div.selected-text").style.right).replace("px", "") === "0") {
                                        left_offset = 0;
                                    }
                                    else {
                                        left_offset = overlay_el.getBoundingClientRect().width - eval(String(overlay_el.querySelector("div.selected-text").style.left).replace("px", "")) - overlay_el.querySelector("div.selected-text").getBoundingClientRect().width;
                                    }
                                }
                                left_offset = Math.round(left_offset);
                                left_offset = left_offset ? left_offset - 1 : 0;
                            }
                            else {
                                left_offset = eval(String(overlay_el.querySelector("div.selected-text").style.left).replace("px", ""));
                            }
                            let special_left_offset = left_offset;
                            const selectedTextW = Array.from(overlay_el.querySelectorAll("div.selected-text")).reduce(((prev, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                            let limited_idx = [null, 0];
                            let limited_jdx = [null, 0];
                            let limited_space_count = 0;
                            let flag = false;
                            let ongoingString = "";
                            let ongoingW = 0;
                            let ongoingLeftW = 0;
                            let idx = 0;
                            let jdx = 0;
                            for (let span of pspan.getElementsByTagName('span')) {
                                console.log("kosoo i", idx);
                                let text = span.innerText;
                                let currTextIndex = 0;
                                jdx = 0;
                                for (let ch of text) {
                                    console.warn("---");
                                    ongoingString += ch;
                                    const ongoingFullString = text.substring(text.indexOf(ongoingString));
                                    const chW = (getSubstringWidthInContext(ongoingFullString, ch));
                                    console.log("[kosoo j", `text:'${text}'`, `ongoingString:'${ongoingString}'`, `ch:'${ch}'`);
                                    console.log("[kosoo j", jdx, `chW:${chW}`, `ongoingLeftW:${ongoingLeftW}`, `ongoingW:${ongoingW}`, `selectedTextW:${selectedTextW}`);
                                    console.log("[kosoo j", `left_offset:${left_offset}`, `special_left_offset:${special_left_offset}`);
                                    console.log("[kosoo>>", limited_idx, limited_jdx);

                                    if (limited_idx[0] !== null) {
                                        ongoingW += chW;
                                    }
                                    if (limited_idx[0] === null) {
                                        if(ch === NBSPACE){
                                            currTextIndex = jdx+1;
                                        }
                                        const currch = text[jdx];
                                        const isCharacterRtl = currch?isRtlCharacter(currch):isRtl;
                                        if (currch){
                                            if (currch!==NBSPACE && (isRtl && !isCharacterRtl) || (!isRtl && isCharacterRtl)){
                                                const currStrW = (getSubstringWidthInContext(ongoingFullString, text.substring(currTextIndex, jdx+1)));
                                                const currText = text.substring(currTextIndex).split(NBSPACE)[0];
                                                const currTextW = (getSubstringWidthInContext(text, currText));
                                                special_left_offset = isCharacterRtl?left_offset+currTextW-currStrW:left_offset-currTextW+2*currStrW;
                                            }
                                        }
                                        const to_compare = isCharacterRtl?Math.max(left_offset, special_left_offset):Math.min(left_offset, special_left_offset);
                                        if (Math.round(ongoingLeftW + 1) >= to_compare) {
                                            limited_idx[0] = idx;
                                            limited_jdx[0] = jdx;
                                        }
                                        ongoingLeftW += chW;
                                    }
                                    if (limited_idx[0] !== null && Math.round(ongoingW + 1) >= selectedTextW) {
                                        flag = true;
                                        limited_idx[1] = idx;
                                        limited_jdx[1] = jdx;
                                        break;
                                    }
                                    if (limited_idx[0] !== null && ch === NBSPACE) {
                                        limited_space_count++;
                                        ongoingString = "";
                                    }
                                    console.log("]kosoo>>", limited_idx, limited_jdx);
                                    console.log("]kosoo j", `left_offset:${left_offset}`, `special_left_offset:${special_left_offset}`);
                                    console.log("]kosoo j", jdx, `chW:${chW}`, `ongoingLeftW:${ongoingLeftW}`, `ongoingW:${ongoingW}`, `selectedTextW:${selectedTextW}`);
                                    console.log("]kosoo j", `text:'${text}'`, `ongoingString:'${ongoingString}'`, `ch:'${ch}'`);
                                    jdx++;
                                }
                                if (flag) {
                                    break;
                                }
                                idx++;
                            }
                            if (limited_idx[1] === 0 && limited_jdx[1] === 0) {
                                limited_idx[1] = jdx >= pspan.innerText.length ? idx - 1 : idx;
                                limited_jdx[1] = jdx;
                            }
                            console.log("kiri", selectedTextW, limited_idx, limited_jdx, limited_space_count);
                            ongoingString = "";
                            left_string = "";
                            ongoingW = 0;
                            let circleNumTop = 0;
                            const circleCount = limited_space_count;
                            let circleNumRear = circleCount - 1;
                            let textW = null;
                            if (isRtl) {
                                textW = Array.from(pspan.children).reduce(((prev, el) => prev + el.getBoundingClientRect().width), initialValue = 0);
                            }
                            idx = 0;
                            for (let span of pspan.getElementsByTagName('span')) {
                                let text = span.innerText;
                                if (idx < limited_idx[0]) {
                                    left_string += text;
                                    idx++;
                                    continue;
                                }
                                else if (idx > limited_idx[1]) {
                                    break;
                                }
                                let jdx = 0;
                                for (let ch of text) {
                                    if (idx === limited_idx[0]) {
                                        if (jdx < limited_jdx[0]) {
                                            left_string += ch;
                                            jdx++;
                                            continue;
                                        }
                                    }
                                    if (idx === limited_idx[1]) {
                                        if (jdx >= limited_jdx[1]) {
                                            break;
                                        }
                                    }
                                    console.log("kunde", `ch:'${ch}'`, `text:'${text}'`, `idx:'${idx}'`, `jdx:'${jdx}'`);
                                    ongoingString += ch;
                                    const chw = getSubstringWidthInContext(ongoingString, ch);
                                    const wholeText = pspan.innerText;
                                    ongoingW = getSubstringWidthInContext(wholeText, ongoingString);
                                    const leftW = Math.round(getSubstringWidthInContext(text, left_string));
                                    if (ch === NBSPACE) {
                                        let circle = null;
                                        if (isRtl) {
                                            circle = svg.querySelectorAll("circle").item(circleNumRear);
                                            circleNumRear--;
                                        }
                                        else {
                                            circle = svg.querySelectorAll("circle").item(circleNumTop);
                                            circleNumTop++;
                                        }
                                        if (circle) {
                                            let cw = Math.round(ongoingW - chw / 2);
                                            cw = isRtl ? textW - Math.round(ongoingW - chw / 2) : cw;
                                            cw = cw + (isRtl ? -1 : +1) * leftW;
                                            circle.style.cx = cw;
                                            console.log("poopoo", circle, `cw:'${cw}'`, `textW:'${textW}'`, `ongoingW:'${ongoingW}'`, `leftW:${leftW}`, `left_string:'${left_string}'`);
                                        }
                                    }
                                    jdx++;
                                }
                                idx++;
                            }
                            s.remove();
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
                    element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-overlays")[idx];
                    mutationObserver.observe(element, { subtree: true, childList: true, characterData: true });
                    element = document.querySelectorAll("div.monaco-workbench .editor div.content [class*='-container'] .lines-content .view-lines")[idx];
                    // mutationObserver.observe(element, { subtree: true, childList: true, characterData: true });
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


