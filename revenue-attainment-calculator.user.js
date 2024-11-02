// ==UserScript==
// @name         Revenue Attainment Calculator
// @namespace    https://github.com/bmbkr/portal-user-scripts
// @version      2024-11-03
// @description  Show revenue attainment in the POS page on Portal.
// @author       Brandon Baker <brandon@niea.me>
// @match        https://portal.ubif.net/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=portal.ubif.net
// @grant        none
// ==/UserScript==

const correct_url = "https://portal.ubif.net/pos";
const span_selector = "h4[ng-if=\"isInStore()\"] > span:not(.has-attainment)"

const high_color = "#00ff00";
const medium_color = "#ffff00";
const low_color = "#ff0000";

const high_threshold = 100;
const medium_threshold = 80;
const low_threshold = 60;

function calculateColor(attainment) {
    if (attainment >= high_threshold) {
        return high_color;
    }

    if (attainment >= medium_threshold) {
        return medium_color;
    }

    return low_color;
}

function work() {
    if (window.location.href !== correct_url) {
        return;
    }

    const spans = document.querySelectorAll(span_selector);
    if (spans.length === 0) {
        return;
    }

    [...spans].splice(2).forEach(span => {
        const text = span.innerText
            .replaceAll("$", "")
            .replaceAll(",", "");

        const [ left, right ] = text.split(" / ")
            .map(n => parseFloat(n.toString()));

        const attainment = (left / right) * 100;
        const asPercentage = attainment.toFixed(2) + "%";

        if (asPercentage === "NaN%") {
            return;
        }

        const textNode = document.createTextNode(` (${asPercentage})`);
        textNode.style.color = calculateColor(attainment);
        span.appendChild(textNode);
        
        span.classList.add("has-attainment");
    })
}

setInterval(work, 1000);
