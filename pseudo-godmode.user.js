// ==UserScript==
// @name         Pseudo Godmode for UBIF Portal v3
// @namespace    https://niea.me
// @version      0.1
// @description  Client-side full permission spoofer for UBIF Portal v3
// @author       Brandon Baker <brandon@niea.me>
// @match        https://portal.ubif.net/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Icons for enabled/disabled states
    const demonIcon = '😈'; // Demon icon (enabled)
    const angelIcon = '😇'; // Angel icon (disabled)
    const localStorageKey = 'godmodeEnabled';

    // Cached enabled state
    let isEnabledCached = localStorage.getItem(localStorageKey) === 'true';

    // Function to check if the button is already inserted
    function isToggleButtonInserted() {
        return !!document.querySelector('#godmode-toggle');
    }

    // Function to create and insert the anchor tag
    function insertToggleButton() {
        console.log('insertToggleButton');

        // Find the element we want to append the anchor to
        const targetElement = document.querySelector('div > footer > div.clearfix > ul.list-unstyled');
        if (!targetElement) return console.error('Could not find target element');

        // Create the anchor element
        const anchor = document.createElement('a');
        anchor.href = '#';
        anchor.id = 'godmode-toggle';

        // Set the icon based on the current state in localStorage
        anchor.textContent = localStorage.getItem(localStorageKey) === 'true' ? demonIcon : angelIcon;

        // Toggle godmode on click
        anchor.addEventListener('click', function (event) {
            event.preventDefault();
            // Toggle state in localStorage
            const isEnabled = localStorage.getItem(localStorageKey) === 'true';
            localStorage.setItem(localStorageKey, !isEnabled);

            console.log('[Godmode] Toggled to', !isEnabled);

            // Update the icon
            anchor.textContent = !isEnabled ? demonIcon : angelIcon;

            // Update the cache
            isEnabledCached = !isEnabled;
        });

        // Insert the anchor into the target element
        targetElement.appendChild(anchor);
    }

    function installXHRInterceptor() {
        const originalResponse = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response').get;

        Object.defineProperty(XMLHttpRequest.prototype, 'response', {
            get: function () {
                const original = originalResponse.call(this);

                if (!this.responseURL.includes('/api/auth/me')) return original;
                if (!isEnabledCached) return original;

                const response = JSON.parse(original);

                response.data.admin = true;

                Object.keys(response.data.permissions).forEach(key => {
                    response.data.permissions[key] = true;
                });

                return JSON.stringify(response);
            }
        });

        console.log('XHR interceptor installed');
    }

    // Check for the button every 5ms until it's inserted, then install the XHR interceptor and stop the interval
    const interval = setInterval(function () {
        if (!isToggleButtonInserted()) {
            insertToggleButton();
            installXHRInterceptor();
            clearInterval(interval);
        }
    }, 5);
})();
