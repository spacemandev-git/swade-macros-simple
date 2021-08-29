/* Mini Tutorial
1 - Import the cards to a rollable table (i recommend Card Deck Importer - follow the instructions there). Name the rollable table AdventureDeck or change below.
2 - Create an item (gear) named Adventure Card. Give it to the characters that will use it.
3 - Run the macro.
*/

var rollTableName = "AdventureDeck"; /// name of the rolltable with adventure cards
var itemCard = "Adventure Card"; /// name of the item holding the adventure card

let chars = game.actors.entities.filter((t) => t.data.type === "character"); /// all the chars
let optionchars = "";
var allchars = [];

for (const char of chars) {
    let myitem = char.items.find((i) => i.name === itemCard);
    if (myitem !== null) {
        /// filters the ones that has the item
        optionchars += `<option value="` + char.id + `">` + char.name + `</option>`;
        allchars.push(char.id);
    }
}

if (!optionchars) {
    /// no chars
    ui.notifications.warn(`No character has the item ` + itemCard + `.`, {});
}

let template =
    `<p>How many cards? <input type="number" value="1" id="qtde" style="width:50px" /></p>
<p>For wich character? <select id="jogs"><option value="todos">All</option>` +
    optionchars +
    `</select></p>`;
new Dialog({
    title: "Give Adventure Cards",
    content: template,
    buttons: {
        ok: {
            label: "Give",
            callback: function (html) {
                applyFormOptions(html);
            },
        },
        cancel: {
            label: "Cancel",
        },
    },
}).render(true);

function drawFromTable(tableName) {
    /// thanks to Forien for this. Check his modules https://foundryvtt.com/community/forien
    const table = game.tables.getName(tableName);

    if (!table) {
        ui.notifications.warn(`Table ${tableName} not found.`, {});
        return;
    }
    return table.roll().then((card) => {
        let cardData = card.results[0].data;
        let collection = cardData.collection;
        return "<p>@Compendium[" + collection + "." + cardData.resultId + "]{" + cardData.text + "}</p>";
    });
}

function applyFormOptions(html) {
    let qtde = html.find("#qtde")[0].value;
    let selchar = html.find("#jogs")[0].value;

    if (selchar === "todos") {
        for (let i = 0; i < allchars.length; i++) {
            giveCards(qtde, allchars[i]);
        }
    } else {
        giveCards(qtde, selchar);
    }

    let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker(),
        content: "Adventure Cards given",
    };
    ChatMessage.create(chatData, {});
}

function giveCards(howmany, actorId) {
    let char = game.actors.get(actorId);
    let myitem = char.items.find((i) => i.name === itemCard);
    let updatedesc = "";

    myitem.data.data.description = ""; 
    myitem.update({ ["data.description"]: myitem.data.data.description });

    for (let i = 1; i <= howmany; i++) {
        drawFromTable(rollTableName).then((card) => {
           updatedesc += card;
           myitem.update({ ["data.description"]: myitem.data.data.description + " " + updatedesc });
        });
    }


}
