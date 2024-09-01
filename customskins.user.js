// ==UserScript==
// @name         Miniblox Custom Skin
// @namespace    Loqle
// @version      1.0
// @description  Miniblox Custom Skins by Loqle
// @author       Loqle
// @match        https://miniblox.io/*
// @icon         https://miniblox.io/favicon.png
// @grant        unsafeWindow
// @grant        GM.setValue
// @grant        GM.getValue
// @run-at       document-start
// ==/UserScript==

(async () => {
  if (await GM.getValue('skinurl') == null) {
    changeCustomSkin();
  }
})();

function doc_keyUp(e) {
  if (e.altKey && e.code === 'Semicolon') {
      changeCustomSkin();
  }
}
document.addEventListener('keyup', doc_keyUp, false);

function changeCustomSkin() {
  (async () => {
    let skinurl = prompt("Please enter your skin URL (tip: get skins from https://minecraft.novaskin.me/gallery)", "https://t.novaskin.me/fc932eb7edc6dbf0487b43713324e78e9c935ec0069c52cb44f9c7b9d82acae5");
    if (skinurl == null) { // user pressed cancel
      if (await GM.getValue('skinurl') == null) {
        window.location.reload();
      } else {
        return;
      }
    }
    await GM.setValue('skinurl', skinurl);
    window.location.reload();
  })();
}


setInterval(function() {
  if (!document.getElementById("customSkinBtn")) {
    var newNode = document.createElement("button");
    newNode.type = "button";
    newNode.id = "customSkinBtn";
    newNode.classList.add("chakra-button");
    newNode.classList.add("css-32lhf4");
    newNode.innerHTML = "<p class='chakra-text css-x8h6hl'>Edit Custom Skin</p>";
    newNode.onclick=function() { changeCustomSkin(); };
    document.getElementsByClassName("css-1q5zbtn")[0].appendChild(newNode);
  }
}, 1000);


let replacements = {};
let dumpedVarNames = {};
const storeName = "a" + crypto.randomUUID().replaceAll("-", "").substring(16);

// ANTICHEAT HOOK
function replaceAndCopyFunction(oldFunc, newFunc) {
	return new Proxy(oldFunc, {
		apply(orig, origIden, origArgs) {
			const result = orig.apply(origIden, origArgs);
			newFunc(result);
			return result;
		},
		get(orig) { return orig; }
	});
}

Object.getOwnPropertyNames = replaceAndCopyFunction(Object.getOwnPropertyNames, function(list) {
	if (list.indexOf(storeName) != -1) list.splice(list.indexOf(storeName), 1);
	return list;
});
Object.getOwnPropertyDescriptors = replaceAndCopyFunction(Object.getOwnPropertyDescriptors, function(list) {
	delete list[storeName];
	return list;
});

function addReplacement(replacement, code, replaceit) {
	replacements[replacement] = [code, replaceit];
}

function addDump(replacement, code) {
	dumpedVarNames[replacement] = code;
}

function modifyCode(text) {
	for(const [name, regex] of Object.entries(dumpedVarNames)){
		const matched = text.match(regex);
		if (matched) {
			console.log(name, regex, matched);
			for(const [replacement, code] of Object.entries(replacements)){
				delete replacements[replacement];
				replacements[replacement.replaceAll(name, matched[1])] = [code[0].replaceAll(name, matched[1]), code[1]];
			}
		}
	}

	for(const [replacement, code] of Object.entries(replacements)){
		text = text.replaceAll(replacement, code[1] ? code[0] : replacement + code[0]);
	}

	var newScript = document.createElement("script");
	newScript.type = "module";
	newScript.crossOrigin = "";
	newScript.textContent = text;
	var head = document.querySelector("head");
	head.appendChild(newScript);
	newScript.textContent = "";
	newScript.remove();
}

(function() {
	'use strict';

	// PRE
	addReplacement('document.addEventListener("DOMContentLoaded",startGame,!1);', `
		setTimeout(function() {
			var DOMContentLoaded_event = document.createEvent("Event");
			DOMContentLoaded_event.initEvent("DOMContentLoaded", true, true);
			document.dispatchEvent(DOMContentLoaded_event);
		}, 0);
	`);

	addReplacement('Potions.jump.getId(),"5");', `
		let blocking = false;
		let sendYaw = false;
		let breakStart = Date.now();
		let noMove = Date.now();

		let enabledModules = {};
		let modules = {};

		let keybindCallbacks = {};
		let keybindList = {};

		let tickLoop = {};
		let renderTickLoop = {};
	`);

	addReplacement('skinManager.loadTextures(),');
	addReplacement('async loadSpritesheet(){', `
		async loadSpritesheet(){
	`, true);

	addReplacement('this.game.unleash.isEnabled("disable-ads")', 'true', true);

	// SKIN
	addReplacement('ClientSocket.on("CPacketSpawnPlayer",$=>{const et=j.world.getPlayerById($.id);', `
  if ($.socketId === player$1.socketId) {
    hud3D.remove(hud3D.rightArm);
    hud3D.rightArm = undefined;
    player$1.profile.cosmetics.skin = "CustomSkin";
    $.cosmetics.skin = "CustomSkin";
    $.cosmetics.cape = "CustomSkin";
  }
	`);
	addReplacement('bob:{id:"bob",name:"Bob",tier:0,skinny:!1},', 'CustomSkin:{id:"CustomSkin",name:"CustomSkin",tier:0,skinny:!1},');
	addReplacement('cloud:{id:"cloud",name:"Cloud",tier:2},', 'CustomSkin:{id:"CustomSkin",name:"CustomSkin",tier:0},');
  (async () => {
    addReplacement('async downloadSkin(_){', `
      if (_ == "CustomSkin") {
        const $ = skins[_];
        return new Promise((et, tt) => {
          textureManager.loader.load("` + await GM.getValue('skinurl') + `", rt => {
            const nt = {
              atlas: rt,
              id: _,
              skinny: $.skinny,
              ratio: rt.image.width / 64
            };
            SkinManager.createAtlasMat(nt), this.skins[_] = nt, et();
          }, void 0, function(rt) {
            console.error(rt), et();
          });
        });
      }
    `);
  })();
	addReplacement('async downloadCape(_){', `
		if (_ == "CustomSkin") {
			const $ = capes[_];
			return new Promise((et, tt) => {
				textureManager.loader.load("https://raw.githubusercontent.com/realsnowy/customcapes/master/capes/2011.png", rt => {
					const nt = {
						atlas: rt,
						id: _,
						name: $.name,
						ratio: rt.image.width / 64,
						rankLevel: $.tier,
						isCape: !0
					};
					SkinManager.createAtlasMat(nt), this.capes[_] = nt, et();
				}, void 0, function(rt) {
					console.error(rt), et();
				});
			});
		}
	`);

	let loadedConfig = false;
	async function execute(src, oldScript) {
		Object.defineProperty(unsafeWindow.globalThis, storeName, {value: {}, enumerable: false});
		if (oldScript) oldScript.type = 'javascript/blocked';
		await fetch(src).then(e => e.text()).then(e => modifyCode(e));
		if (oldScript) oldScript.type = 'module';
		await new Promise((resolve) => {
			const loop = setInterval(async function() {
				if (unsafeWindow.globalThis[storeName].modules) {
					clearInterval(loop);
					resolve();
				}
			}, 10);
		});
	}

  if (navigator.userAgent.indexOf("Firefox") != -1) {
    window.addEventListener("beforescriptexecute", function(e) {
      if (e.target.src.includes("https://miniblox.io/assets/index")) {
        e.preventDefault();
        e.stopPropagation();
        execute(e.target.src);
      }
    }, false);
  }
  else {
    new MutationObserver(async (mutations, observer) => {
      let oldScript = mutations
        .flatMap(e => [...e.addedNodes])
        .filter(e => e.tagName == 'SCRIPT')
        .find(e => e.src.includes("https://miniblox.io/assets/index"));

      if (oldScript) {
        observer.disconnect();
        execute(oldScript.src, oldScript);
      }
    }).observe(document, {
      childList: true,
      subtree: true,
    });
  }
})();
