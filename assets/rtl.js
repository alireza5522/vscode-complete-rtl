function isRtlCharacter(char) {
    const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u1EE00-\u1EEFF]/;
    return rtlRegex.test(char);
}

document.addEventListener('DOMContentLoaded',
    () => {
        setTimeout(() => {
            console.log("zzz");
            
            const name_els = document.querySelectorAll("div.content [class*='-container'] .tabs .tabs-container .tab.active");
            let flags = [];
            for (const el of name_els) {
                if (/(\w+)\.rtl\.(\w+)$/g.test(el.textContent.trim())) {
                    flags = [...flags, true];
                }
                else {
                    flags = [...flags, false];
                }
            }

            const lines_els = document.querySelectorAll("div.content [class*='-container'] .lines-content .view-lines");
            const overlays_els = document.querySelectorAll("div.content [class*='-container'] .lines-content .view-overlays");
            const minimaps = document.querySelectorAll(".minimap-decorations-layer");
            for (let i = 0; i < lines_els.length; i++) {
                if (flags[i]) {
                    const el = lines_els[i];
                    document.addEventListener('keydown', (e) => {
                        if(e.code.toLowerCase()==="arrowleft"){
                            console.log("SIN");
                        }
                    });
                    const minimap = minimaps[i];
                    const margin = minimap.style.width;
                    const content_el = document.querySelectorAll("div.content [class*='-container'] .lines-content")[i];
                    content_el.style.marginLeft = `-${margin}`;
                    content_el.className += " __rtl-lines";
                    const line_els = el.querySelectorAll(".view-line");
                    for (const line of line_els){
                        // line.innerHTML = `<bdi>${line.innerHTML}</bdi>`;
                        console.log("zzzTRUE");
                    }
                }
            }
        }, 850);
    }
);

// #workbench\.parts\.editor > div.content > div > div > div > div > div.monaco-scrollable-element > div.split-view-container > div > div > div.title.tabs.show-file-icons > div.tabs-and-actions-container.tabs-border-bottom > div.monaco-scrollable-element > div.tabs-container > div.tab.tab-actions-right.sizing-fit.has-icon.active.selected.tab-border-bottom.tab-border-top

