//Get Selected Actor
if (canvas.tokens.controlled.length != 1) {
  ui.notifications.warn("Please select a single token to use with this Macro");
}

//Get Target Actor
if (Array.from(game.user.targets).length != 1) {
  ui.notifications.warn("Please select a SINGLE target");
}

let selected = canvas.tokens.controlled[0].actor;
let target = Array.from(game.user.targets)[0].actor;

let selectedWeaponsList = selected.items.filter(
  (el) => el.data.type == "weapon" && el.data.data.equipped
);
//weapons dmg roll:
//let roll = new Roll(itemData.damage, actor.getRollShortcuts()).roll();

let targetArmors = target.items.filter(
  (el) => el.data.data.equipped && el.data.type == "armor"
);
let targetToughenss = target.data.data.stats.toughness; //{toughness ="", armor: #, mod: #}
rollDamage();
function rollDamage() {
  let template = `
  <div>
    <p><b>Selected Token Information</b></p>
    <div class = "form-group">
    <label>Select Weapon</label>
    <select id="selectedWeapon">
    ${getWeaponsList()}
    </select>
    <p></p>
    <p><b>Target Information</b></p>
    <p>Base Toughness: ${targetToughenss.value} | Armor: ${
    targetToughenss.armor
  } | Other Mods: ${targetToughenss.modifier}</p>
    <p>Armor Notes: </p>
    ${getTargetArmorNotes()}
    <p></p>
    <p><b>Other Modifiers</b></p>
    
    <p>
    <label>Has the Drop?</label>
    <input type="checkbox" id="hasDrop"></input>
    <label>Roll Bonus Damage?</label>
    <input type="checkbox" id="bonusDmg"></input>
    </p>

    <p>
    <label> Other Damage Mod </label>
    <input type="number" id="dmgMod" value=0 style="width:50px"></input>
    </p>
    </div>
  </div>
  `;

  new Dialog({
    title: "Damage Roll",
    content: template,
    buttons: {
      ok: {
        label: "Roll Damage",
        callback: async (html) => {
          applyDamage(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  }).render(true);
}

function getWeaponsList() {
  let template = ``;
  selectedWeaponsList.forEach((wep) => {
    template += `<option value="${wep.name}">${wep.name} | AP ${wep.data.data.ap} | DMG: ${wep.data.data.damage}</option>`;
  });

  return template;
}
function getTargetArmorNotes() {
  let template = ``;
  targetArmors.forEach((armor) => {
    template += `<p>${armor.name} | ${armor.data.data.notes}</p>`;
  });
  return template;
}
function applyDamage(html) {
  let selectedWeapon = selectedWeaponsList.find(
    (el) => el.name == html.find("#selectedWeapon")[0].value
  );

  let rollString = selectedWeapon.data.data.damage + "x= ";
  rollString += html.find("#bonusDmg")[0].checked ? " + 1d6x= " : "";

  let dmgRoll = new Roll(rollString, actor.getRollShortcuts()).roll().total;
  let dmgMod =
    parseInt(html.find("#dmgMod")[0].value) + html.find("#hasDrop")[0].checked
      ? 4
      : 0;

  let armorAfterAP = targetToughenss.armor - selectedWeapon.data.data.ap;
  armorAfterAP = armorAfterAp < 0 ? 0 : armorAfterAP;

  let tough =
    parseInt(targetToughenss.value) + armorAfterAP + targetToughenss.modifier;

  let result = `
  <p>Weapon: ${selectedWeapon.name} | AP ${selectedWeapon.data.data.ap}</p>
  <p>Damage Roll: ${dmgRoll} | Mod: ${dmgMod} | Total: ${dmgRoll + dmgMod}</p>
  <p>Target Toughness After AP: ${tough}</p>
  <p></p>
  <p>Damage dealt: <b>${dmgRoll + dmgMod - tough}</b></p>
  `;

  ChatMessage.create({
    speaker: {
      actor: selected,
      alias: selected.name,
    },
    content: result,
  });
}
