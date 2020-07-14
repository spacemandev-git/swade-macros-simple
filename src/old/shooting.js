//Get Selected Actor
if (canvas.tokens.controlled.length != 1) {
  ui.notifications.warn("Please select a single token to use with this Macro");
}

let selected = canvas.tokens.controlled[0].actor;
let shootingSkill = selected.items.find((el) => el.data.name == "Shooting");
if (shootingSkill == undefined) {
  ui.notifications.warn("This actor does not have the Shooting Skill");
}

//Ignores melee/wepons that don't have the 'shots' property
let weapons = selected.items.filter(
  (el) => el.type == "weapon" && el.data.data.shots > 0
);

//SWADE rules for how much ammo is expended per RoF
const rofAmmo = { 1: 1, 2: 5, 3: 10, 4: 20, 5: 40, 6: 50 };

getFiringSolution();

function getFiringSolution() {
  let weaponsDropdown = "";
  weapons.forEach((wep) => {
    weaponsDropdown += `<option value="${wep.name}">${wep.name} | ROF ${wep.data.data.rof} | Shots ${wep.data.data.shots} </option>`;
    //console.log(template);
  });

  let template = `
    <div class="form-group" style="display:flex; flex-direction:column;">
      <p>Select Weapon <select id="selectedWeapon" style=""> ${weaponsDropdown} </select> </p>
      <p> 
        Target Cover 
        <select id="targetCover" style="">
          <option value=0>No Cover</option>
          <option value=-2>Light</option>
          <option value=-4>Medium</option>
          <option value=-6>Heavy</option>
          <option value=-8>Complete</option>
        </select>
      </p>
      <p>
        Range Penalty
        <select id="rangePenalty" style="">
          <option value=0>Short Range</option>
          <option value=-2>Medium</option>
          <option value=-4>Long</option>
          <option value=-8>Extreme</option>
        </select>
      </p>
      <p>
        Selected RoF
        <input type="number" id="selectedRoF" style="width:50px" value=1>
      </p>
      <p>
        Recoil Penalty
        <input type="number" id="recoilPenalty" style=" width:50px" value=0>
      </p>
      <p>
        Multi Action Penalty
        <input type="number" id="maPenalty" style="width:50px" value=0>
      </p>
      <p>
        Has The Drop?
        <input type="checkbox" id="theDrop" syle="" >
      </p>
      <p>
        Other Shooting Modifiers
        <input type="number" id="otherMod" style="width:50px" value=0>
      </p>
      <p>
        Auto Subtract Ammo?
        <input type="checkbox" id="trackAmmo" syle="" checked />
      </p>
    </div>
  `;

  new Dialog({
    title: "Ranged Attack",
    content: template,
    buttons: {
      ok: {
        label: "Fire Weapon",
        callback: async (html) => {
          fireWeapon(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  }).render(true);
}

function fireWeapon(html) {
  let weapon = weapons.find(
    (el) => el.name == html.find("#selectedWeapon")[0].value
  );

  //swade pg93
  let numShootingDie = html.find("#selectedRoF")[0].value;

  //check if enough Ammo in clip to fire AND if RoF < weapon's RoF
  if (numShootingDie > weapon.data.data.rof || numShootingDie < 1) {
    ui.notifications.warn("Selected RoF beyond Weapon RoF");
    return;
  }
  if (
    html.find("#trackAmmo")[0].checked &&
    rofAmmo[numShootingDie] > weapon.data.data.shots
  ) {
    ui.notifications.warn(
      `Not enough Ammo to fire at this RoF. You only have (${weapon.data.data.shots}) shots left`
    );
    return;
  }

  let shootingSkillMod = isNaN(parseInt(shootingSkill.data.data.die.modifier))
    ? 0
    : parseInt(shootingSkill.data.data.die.modifier);
  let coverMod = parseInt(html.find("#targetCover")[0].value);
  let recoilMod = parseInt(html.find("#recoilPenalty")[0].value);
  let multiActionMod = parseInt(html.find("#maPenalty")[0].value);
  let rangeMod = parseInt(html.find("#rangePenalty")[0].value);
  let otherMod = parseInt(html.find("#otherMod")[0].value);
  let theDropMod = html.find("#theDrop")[0].checked ? 4 : 0;
  let woundMod =  (selected.calcWoundPenalties() + selected.calcFatiguePenalties()); //selected.calcWoundFatigePenalties();
  let statusMod = selected.calcStatusPenalties();

  let totalMod =
    shootingSkillMod +
    coverMod +
    recoilMod +
    multiActionMod +
    rangeMod +
    otherMod +
    theDropMod +
    woundMod +
    statusMod;

  let tModStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;

  let rollString = `1d${shootingSkill.data.data.die.sides}x= ${tModStr}`;
  let wildString = `1d${shootingSkill.data.data["wild-die"].sides}x= ${tModStr}`;

  let rolls = [];
  let results = [];
  for (let i = 0; i < numShootingDie; i++) {
    let roll = new Roll(rollString).roll();
    if (game.dice3d) {
      game.dice3d.showForRoll(roll);
    }
    rolls.push(roll.total);
    results.push(roll.total);
  }

  let wildRoll;
  if (selected.data.data.wildcard) {
    wildRoll = new Roll(wildString).roll();
    if (game.dice3d) {
      game.dice3d.showForRoll(wildRoll);
    }
    results.push(wildRoll.total);
    results.splice(results.indexOf(Math.min(...results)), 1); //drop lowest after adding in Wild Roll
  }

  //update Ammo
  if (html.find("#trackAmmo")[0].checked) {
    let newShots = (weapon.data.data.shots -= rofAmmo[numShootingDie]);
    weapon.update({ "data.shots": newShots });
  }

  let chatTemplate = `
  <p>Weapon: ${weapon.data.name}</p>
  <p>Notes: ${weapon.data.data.notes}</p>
  <p>Shots Left: ${weapon.data.data.shots}</p>
  <p></p>
  <p>
    Shooting Rolls: [${rolls}] 
    ${selected.data.data.wildcard ? ` | Wild Die Roll: ${wildRoll.total}` : ""}
  </p>
  <p>Roll String: ${rollString}</p>
  <p></p>
  <p>
    Results: <b>[${results}]</b>
  </p>
  `;

  ChatMessage.create({
    speaker: {
      actor: selected,
      alias: selected.name,
    },
    content: chatTemplate,
  });
}
