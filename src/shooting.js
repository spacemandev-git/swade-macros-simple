//Uses the selected actor to figure out guns
let selected = canvas.tokens.controlled[0].actor;
if (typeof selected === "undefined") {
  ui.notifications.warn("You have no Token selected");
}

//Ignores melee/wepons that don't have the 'shots' property
let weapons = selected.items.filter(
  (el) => el.type == "weapon" && el.data.data.shots > 0
);

//SWADE rules for how much ammo is expended per RoF
const rofAmmo = { 1: 1, 2: 5, 3: 10, 4: 20, 5: 40, 6: 50 };

//Dialog Creater that asks for any modifiers and what gun to use
getFiringSolution();

//Utility function for printing things to chat
function printMessage(message) {
  ChatMessage.create(
    {
      speaker: {
        actor: selected,
        alias: selected.name,
      },
      content: message,
    },
    {}
  );
}

//Someone please teach me how to make pretty HTML templates because I can't CSS if my life depended on it
function getFiringSolution() {
  let weaponsList = getWeaponsListAsDropdown();

  let template = `
    <div>
      <div class="form-group">
        <label>Select Weapon</label>
        <select id="selectedRangedWeapon">
        ${weaponsList}
        </select></div>
        <label for="targetCover">Target Cover</label>
        <select id="targetCover">
          <option value=0>No Cover</option>
          <option value=-2>Light</option>
          <option value=-4>Medium</option>
          <option value=-6>Heavy</option>
          <option value=-8>Complete</option>
        </select>
        <label for="rangePenalty">Range Penalty</label>
        <select id="rangePenalty">
          <option value=0>Short Range</option>
          <option value=-2>Medium</option>
          <option value=-4>Long</option>
          <option value=-8>Extreme</option>
        </select>
        <div> 
          <label for="selectedRoF">Selected RoF </label>
          <input type="number" id="selectedRoF" style="width:50px;" value=1>
          <br />
          <label for="recoilPenalty">Recoil Penalty</label>
          <input type="number" id="recoilPenalty" style="width:50px;" value=0>
          <br />
          <label for="mapPenalty">Multi Action Penalty </label>
          <input type="number" id="mapPenalty" style="width:50px;" value=0>
          <br />
          <label for="otherMod">Other Shooting Mods</label>
          <input type="number" id="otherMod" style="width:50px;" value=0>
        </div>
      </div>
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
    default: "ok",
  }).render(true);
}

//utility function that that creates a dropdown of all weapons
function getWeaponsListAsDropdown() {
  let template = ``;
  weapons.forEach((wep) => {
    template += `<option value="${wep.name}">${wep.name} | ROF ${wep.data.data.rof} | Shots ${wep.data.data.shots} </option>`;
    console.log(template);
  });

  return template;
}

//Computes the rolls, total modifier, and takes care of ammo
function fireWeapon(html) {
  let weapon = weapons.find(
    (el) => el.name == html.find("#selectedRangedWeapon")[0].value
  );

  //swade pg93
  let numShootingDie = html.find("#selectedRoF")[0].value;

  //check if enough Ammo in clip to fire AND if RoF < weapon's RoF
  if (numShootingDie >= weapon.data.data.rof || numShootingDie < 1) {
    ui.notifications.warn("Selected RoF beyond Weapon RoF");
    return;
  }
  if (rofAmmo[numShootingDie] > weapon.data.data.shots) {
    ui.notifications.warn(`Not enough Ammo to fire at this RoF. You only have (${weapon.data.data.shots}) shots left`);
    return;
  }

  let shootingSkill = selected.items.find((el) => el.data.name == "Shooting");
  console.log(shootingSkill);
  //individually rolls each die and explodes it. as per swade rules, each die is a seperate attack
  let shootingRolls = [];
  for (let i = 0; i < numShootingDie; i++) {
    let newRoll = new Die(shootingSkill.data.data.die.sides).roll(1);
    console.log(`Shooting Roll (${i}): `, newRoll.total);
    newRoll = newRoll.explode([shootingSkill.data.data.die.sides]).total;
    console.log(`Shooting Roll (${i}) After Explosions: `, newRoll);
    shootingRolls.push(newRoll);
  }

  //will roll wild die for all attacks but only shows it if selected actor is a WildCard
  let wilddieRoll = new Die(shootingSkill.data.data["wild-die"].sides)
    .roll(1)
    .explode([shootingSkill.data.data["wild-die"].sides]).total;

  console.log("Shooting Rolls Before Mod: ", shootingRolls);
  console.log("Wild Die Roll Before Mod: ", wilddieRoll);

  //Build the Modifiers
  // Base Shooting Skill Mod
  let shootingSkillMod = isNaN(parseInt(shootingSkill.data.data.die.modifier))
    ? 0
    : parseInt(shootingSkill.data.data.die.modifier);
  let coverMod = parseInt(html.find("#targetCover")[0].value);
  let recoilMod = parseInt(html.find("#recoilPenalty")[0].value);
  let multiActionMod = parseInt(html.find("#mapPenalty")[0].value);
  let rangeMod = parseInt(html.find("#rangePenalty")[0].value);
  let otherMod = parseInt(html.find("#otherMod")[0].value);

  let distractedMod = selected.data.data.status.isDistracted ? -2 : 0;
  let woundMod =
    (selected.data.data.wounds.value - selected.data.data.wounds.ignored) * -1;
  if (woundMod < -3) {
    woundMod = -3;
  } //swade pg95

  let totalMod =
    shootingSkillMod +
    coverMod +
    recoilMod +
    multiActionMod +
    rangeMod +
    otherMod +
    distractedMod +
    woundMod;
  console.log("Total Mod: ", totalMod);

  //go over each roll and add the totalmod to it
  shootingRolls.map((roll) => {
    return (roll += totalMod);
  });
  wilddieRoll += totalMod;

  console.log("Shooting Rolls: ", shootingRolls);
  console.log("Wild Die Roll: ", wilddieRoll);

  //Spend the Bullets
  //selected.items.get(weapon.key).data.data.shots -= rofAmmo[numShootingDie]
  let newShots = weapon.data.data.shots -= rofAmmo[numShootingDie]
  weapon.update({'data.shots':  newShots});

  let chatTemplate = `
    <p>Weapon: ${weapon.data.name}</p>
    <p>Notes: ${weapon.data.data.notes}</p>
    <p>Shots Left: ${weapon.data.data.shots}</p>
    <p>Total Modifier: ${totalMod}</p>
    <p>Shooting Rolls: [${shootingRolls}]
    ${(selected.data.data.wildcard) ? `<p>Wild Die Roll: ${wilddieRoll}</p>` : ""}
  `
  printMessage(chatTemplate);
}
