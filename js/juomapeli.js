var deck = [];
var decksize = 0;
var rules;
var slots = [
	"Ässä",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"Jätkä",
	"Kuningatar",
	"Kuningas",
	"Jokeri",
];

var rankstoslots = {
	"ace": "Ässä",
	"2": "2",
	"3": "3",
	"4": "4",
	"5": "5",
	"6": "6",
	"7": "7",
	"8": "8",
	"9": "9",
	"10": "10",
	"jack": "Jätkä",
	"queen": "Kuningatar",
	"king": "Kuningas",
	"joker": "Jokeri",
};

function init() {
	if (localStorage.getItem("rules")) {
		rules = JSON.parse(localStorage.getItem("rules"));
	} else {
		rules = JSON.parse(document.getElementById("rules-json").text);
	}
	renderRules();
}

window.addEventListener("load", function (event) {
	init();
});

function restoreDefaults() {
	if (confirm("Oletko varma että haluat poistaa nykyiset juomapelit ja palauttaa oletukset?")) {
		rules = JSON.parse(document.getElementById("rules-json").text);
		renderRules();
	}
}

function deleteRuleset(id) {
	if (rules[id] && confirm("Oletko varma että haluat poistaa tämän juomapelin?")) {
		rules.splice(id, 1);
		console.log(rules);
		renderRules();
	}
}

document.getElementById("import-rules-file").addEventListener("change", (event) => {
	const reader = new FileReader();
	reader.addEventListener("load", function (event) {
		rules = JSON.parse(event.target.result);
		renderRules();
	});
	reader.readAsText(event.target.files[0]);
});

function importRules() {
	document.getElementById("import-rules-file").click();
}

function exportRules() {
	saveAs(new Blob([JSON.stringify(rules, null, "\t")], { type: "application/json;charset=utf-8" }), "rules.json");
}

function renderRules() {
	for (var item of document.querySelectorAll("#rules-nav > .dynamic")) {
		item.remove();
	}
	for (var item of document.querySelectorAll("#rules-content > .dynamic")) {
		item.remove();
	}
	for (var item of document.querySelectorAll("#editor-ruleset-selector > .dynamic")) {
		item.remove();
	}

	document.getElementById("editor-form").innerHTML = "";

	for (let i = 0; i < rules.length; i++) {
		renderRuleset(i, rules[i]);
	}
	document.querySelector("[data-bs-target]").click();

	localStorage.setItem("rules", JSON.stringify(rules));
}

function renderRuleset(id, ruleset) {
	var tmp = document.createElement("div");
	tmp.innerHTML = `<li class="nav-item dynamic" role="presentation">
		<button class="nav-link" data-bs-toggle="tab" data-bs-target="#rules-content-${id}" type="button" role="tab">${ruleset.name}</button>
	</li>`;
	var rns = document.getElementById("rules-nav-editor");
	document.getElementById("rules-nav").insertBefore(tmp.firstChild, rns);

	var html = `<div class="tab-pane dynamic rules pt-3" id="rules-content-${id}" role="tabpanel"><div class="row"><div class="col">`;
	var extraclass = document.getElementById("settings-showdescriptions").checked ? "" : "d-none";
	var split = Math.ceil(ruleset.rules.length / 2);
	var twocolumn = document.getElementById("settings-twocolumnrules").checked;
	for (let i = 0; i < ruleset.rules.length; i++) {
		var rule = ruleset.rules[i];
		if (i == split && twocolumn) {
			html += `</div><div class="col">`;
		}
		html += `<p class="rule-slot rule-slot-${rule.slot}"><strong>${rule.slot}</strong>: ${rule.name} <small class="rule-description ${extraclass}">${rule.description}</small></p>`;
	}
	html += `</div></div></div>`;
	tmp = document.createElement("div");
	tmp.innerHTML = html;
	document.getElementById("rules-content").prepend(tmp.firstChild);

	tmp = document.createElement("div");
	tmp.innerHTML = `<option class="dynamic" value="${id}">${ruleset.name}</option>`;
	document.getElementById("editor-ruleset-selector").append(tmp.firstChild);
}

function editRuleset() {
	var id = document.getElementById("editor-ruleset-selector").value;
	if (rules[id]) {
		var ruleset = rules[id];
	} else {
		id = rules.length;
		var ruleset = {
			name: "",
			rules: []
		}
	}
	var html = `<input type="text" class="form-control mt-3" placeholder="Juomapelin nimi" name="editor-ruleset-name" value="${ruleset.name}">
			<input type="number" hidden name="editor-ruleset-id" value="${id}">`;
	for (var i = 0; i < slots.length; i++) {
		if (ruleset.rules[i]) {
			var rule = ruleset.rules[i];
		} else {
			var rule = {
				slot: slots[i],
				name: "",
				description: ""
			};
		}
		html += `<div class="input-group mt-3">
				<input type="text" class="form-control" disabled style="max-width: 20%;" name="editor-rule${i}-slot" value="${rule.slot}">
				<input type="text" class="form-control" placeholder="Nimi" style="max-width: 20%;" name="editor-rule${i}-name" value="${rule.name}">
				<input type="text" class="form-control" placeholder="Kuvaus" name="editor-rule${i}-description" value="${rule.description}">
				<!--<button class="btn btn-danger" type="button" onclick="this.parentElement.remove()">X</button>-->
			</div>`;
	}
	html += `<button type="submit" class="btn btn-primary mt-3">Tallenna</button>
		<button class="btn btn-danger mt-3 float-end" type="button" onclick="deleteRuleset(${id})">Poista tämä juomapeli</button>`;
	document.getElementById("editor-form").innerHTML = html;
}

function slotSelector(selected, id) {
	var html = `<select class="form-select" style="max-width: 20%;" name="editor-rule${id}-slot">`
	for (var slot of slots) {
		html += `<option value="${slot}" ${slot == selected ? "selected" : ""}>${slot}</option>`;
	}
	html += `</select>`;
	return html;
}

document.getElementById("editor-form").addEventListener("submit", function (e) {
	e.preventDefault();
	var id = e.target.elements["editor-ruleset-id"].value;
	var ruleset = {
		name: e.target.elements["editor-ruleset-name"].value,
		rules: []
	};

	for (let i = 0; i < slots.length; i++) {
		if (e.target.elements[`editor-rule${i}-name`].value !== "") {
			ruleset.rules.push({
				slot: e.target.elements[`editor-rule${i}-slot`].value,
				name: e.target.elements[`editor-rule${i}-name`].value,
				description: e.target.elements[`editor-rule${i}-description`].value
			});
		}
	}

	rules[id] = ruleset;
	renderRules();
});

function newCard() {
	if (deck.length == 0) {
		newDeck();
	}

	var card = deck.shift();
	if (card.includes("joker")) {
		var rank = "joker";
	} else {
		var rank = card.split("_")[0];
	}

	if (document.getElementById("settings-useanimations").checked) {
		document.getElementById("card-img").classList.add("flip");
		setTimeout(function () {
			document.getElementById("card-img").src = "img/cards/" + card + ".png";
			document.querySelectorAll(`.rule-slot`).forEach(function (e) {
				e.classList.remove("active")
			});
			document.querySelectorAll(`.rule-slot.rule-slot-${rankstoslots[rank]}`).forEach(function (e) {
				e.classList.add("active")
			});
		}, 150);
		setTimeout(function () {
			document.getElementById("card-img").classList.remove("flip");
		}, 300);
	} else {
		document.getElementById("card-img").src = "img/cards/" + card + ".png";
		document.querySelectorAll(`.rule-slot`).forEach(function (e) {
			e.classList.remove("active")
		});
		document.querySelectorAll(`.rule-slot.rule-slot-${rankstoslots[rank]}`).forEach(function (e) {
			e.classList.add("active")
		});
	}

	updateDeckinfo();
}

function newDeck() {
	deck = [];

	var suits = [
		"clubs",
		"diamonds",
		"hearts",
		"spades"
	];
	var ranks = [
		"ace",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"jack",
		"queen",
		"king"
	];

	for (var s = 0; s < suits.length; s++) {
		for (var r = 0; r < ranks.length; r++) {
			deck.push(ranks[r] + "_of_" + suits[s]);
		}
	}

	var jokers = parseInt(document.getElementById("settings-jokeramount").value, 10);
	deck = deck.concat(Array(Math.ceil(jokers / 2)).fill("black_joker"), Array(Math.floor(jokers / 2)).fill("red_joker"));

	deck = shuffle(deck);

	decksize = deck.length;
	updateDeckinfo();

	console.log(deck);
}

function updateDeckinfo() {
	document.getElementById("deck-info").innerText = `Kortteja jäljellä: ${deck.length} / ${decksize}`
}

function toggleShowDescriptions() {
	var toggle = document.getElementById("settings-showdescriptions");
	document.querySelectorAll(".rule-description").forEach(function (elem) {
		if (toggle.checked) {
			elem.classList.remove("d-none");
		} else {
			elem.classList.add("d-none");
		}
	});
}

function updateHighlight() {
	if (document.getElementById("settings-highlight").checked) {
		document.querySelectorAll(".rule-slot").forEach(function (e) {
			e.classList.add("rule-highlight")
		});
	} else {
		document.querySelectorAll(".rule-slot").forEach(function (e) {
			e.classList.remove("rule-highlight")
		});
	}
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

window.addEventListener("keydown", function (e) {
	if (e.key == " " && e.target == document.body) {
		e.preventDefault();
		newCard();
	}
});
