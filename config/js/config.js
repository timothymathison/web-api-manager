/*jslint es6: true*/
/*global window, browser, Vue*/
(function () {
    "use strict";

    const doc = window.document;
    const standards = window.WEB_API_MANAGER.standards;
    const defaultConservativeRules = window.WEB_API_MANAGER.defaults.conservative;
    const {storageLib, stateLib} = window.WEB_API_MANAGER;
    const defaultDomain = "(default)";

    const state = stateLib.generateStateObject(defaultDomain, standards);

    const onSettingsLoaded = function (settingsResults) {

        let loadedDomainRules;

        if (Object.keys(settingsResults).length !== 0) {
            loadedDomainRules = settingsResults;
        } else {
            loadedDomainRules = Object.create(null);
            loadedDomainRules[defaultDomain] = defaultConservativeRules;
        }

        state.setDomainRules(loadedDomainRules);
        
        const vm = new Vue({
            el: doc.body,
            data: state
        });

        const updateStoredSettings = function () {
            storageLib.set(state.domainRules, function () {});
        };

        vm.$watch("selectedStandards", updateStoredSettings);
        vm.$watch("domainNames", updateStoredSettings);
    };

    const onPageLoad = function () {
        storageLib.get(onSettingsLoaded);
    };

    window.onload = onPageLoad;
}());