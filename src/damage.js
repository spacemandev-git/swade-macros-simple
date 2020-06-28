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
let targetArmor = 0;
targetArmors.map((el) => {
  targetArmor += parseInt(el.data.data.armor);
});

let targetToughenss = target.data.data.stats.toughness; //{toughness ="", armor: #, mod: #}
// console.log(targetToughenss);
rollDamage();
function rollDamage() {
  //| Other Mods: ${targetToughenss.modifier}
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
    <p>Base Toughness: ${targetToughenss.value} | Armor: ${targetArmor} </p> 
    <p>Armor Notes: </p>
    ${getTargetArmorNotes()}
    <p>Ignore Armor: <input type="checkbox" id="ignoreArmor"></input></p>    
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
          dealDamage(html);
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

function dealDamage(html) {
  let selectedWeapon = selectedWeaponsList.find(
    (el) => el.name == html.find("#selectedWeapon")[0].value
  );

  let parts = selectedWeapon.data.data.damage.split("+");
  parts = parts.map((part) => {
    if (part.indexOf("d") > -1) {
      return `${part}x=`;
    } else {
      return part;
    }
  });

  let wepDmgRoll = "";
  for (let i = 0; i < parts.length; i++) {
    if (i != parts.length - 1) {
      wepDmgRoll += `${parts[i]} +`;
    } else {
      wepDmgRoll += parts[i];
    }
  }
  let dmgMod =
    parseInt(html.find("#dmgMod")[0].value) +
    (html.find("#hasDrop")[0].checked ? 4 : 0);

  let rollString =
    wepDmgRoll +
    (html.find("#bonusDmg")[0].checked ? " +1d6x=" : "") +
    (dmgMod >= 0 ? ` +${dmgMod}` : ` ${dmgMod}`);

  let roll = new Roll(rollString, actor.getRollShortcuts()).roll();
  if (game.dice3d) {
    game.dice3d.showForRoll(roll);
  }

  let armorAfterAP = targetArmor - selectedWeapon.data.data.ap;
  armorAfterAP = armorAfterAP < 0 ? 0 : armorAfterAP;

  let tough =
    parseInt(targetToughenss.value) +
    (html.find("#ignoreArmor")[0].checked ? 0 : armorAfterAP); // + targetToughenss.modifier;

  let dmg = roll.total - tough;
  let numSuccesses = dmg / 4;

  let result = `
  <p>Weapon: ${selectedWeapon.name} | AP ${selectedWeapon.data.data.ap}</p>
  <p>Roll String: ${rollString}</p>
  <p>Damage Roll: ${roll.total}</p>
  <p>Target Toughness After AP: ${tough}</p>
  <p></p>
  <p>Damage dealt: <b>${dmg}</b></p>
  <p><b>
  ${numSuccesses >= 0 ? "Success" : "No Damage"} 
  ${numSuccesses >= 2 ? `| Raises ${Math.floor(numSuccesses - 1)}` : ""}  
  </b></p>
  `;

  ChatMessage.create({
    speaker: {
      actor: selected,
      alias: selected.name,
    },
    content: result,
  });
}
