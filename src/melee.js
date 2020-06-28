// Fighting vs Parry
// Take into account The Drop

if (canvas.tokens.controlled.length != 1) {
  ui.notifications.warn("Please select a single token to use with this Macro");
  return;
}

if (Array.from(game.user.targets).length != 1) {
  ui.notifications.warn("Please select a SINGLE target");
  return;
}

let selected = canvas.tokens.controlled[0].actor;
let target = Array.from(game.user.targets)[0].actor;

let meleeWeaponsList = selected.items.filter(
  (el) => el.data.type == "weapon" && el.data.data.damage.indexOf("@str") >= 0
);

let targetParry = target.data.data.stats.parry.value;
let targetShields = target.items.filter(
  (el) => el.data.data.equipped && el.data.type == "shield"
);

let targetParryMod = 0;
targetShields.map((el) => {
  targetParryMod += parseInt(el.data.data.parry);
});

getFightingSolution();

function getFightingSolution() {
  let template = `
  <div class="form-group">
    <p>Target Parry ${targetParry} | Parry Bonus from Shield ${targetParryMod}</p>
    <p></p>
    <p> Has the Drop? <input type="checkbox" id="theDrop" unchecked /> </p>
    <p> Unarmed Defender? <input type="checkbox" id="unarmedDefender" unchecked /> </p>
    <label>Called Shot Mod</label>
    <input type="number" id="calledShot" style="width:50px;" value=0>
    <label> Other Modifiers </label>
    <input type="number" id="otherMod" style="width:50px;" value=0>

    </div>
  `;

  new Dialog({
    title: "Fighting Roll",
    content: template,
    buttons: {
      ok: {
        label: "Roll Fighting",
        callback: async (html) => {
          rollFighting(html);
        },
      },
      cancel: {
        label: "Cancel",
      },
    },
  }).render(true);
}

function rollFighting(html) {
  let fightSkill = selected.items.find((el) => el.name == "Fighting");
  let rollFormula = "";
  let modifier = "";

  // Check if Skill Defined
  // Check if Wildcard

  if (fightSkill && fightSkill.data.data.die.modifier == "") {
    modifier = "+0";
  } else if (fightSkill && parseInt(fightSkill.data.data.die.modifier) >= 0) {
    modifier = `+${parseInt(fightSkill.data.data.die.modifier)}`;
  } else if (fightSkill) {
    console.log("");
    modifier = parseInt(fightSkill.data.data.modifier).toString(); // - is baked into a negative
  } else {
    modifier = "-2"; //unskilled
  }

  let otherMods = 0;
  otherMods += parseInt(html.find("#otherMod")[0].value);
  otherMods += parseInt(html.find("#calledShot")[0].value);
  otherMods += html.find("#unarmedDefender")[0].checked ? 2 : 0;
  otherMods += html.find("#theDrop")[0].checked ? 4 : 0;
  otherMods += selected.calcWoundFatigePenalties();
  otherMods += selected.calcStatusPenalties();
  let otherModifier = otherMods >= 0 ? `+${otherMods}` : parseInt(otherMods);

  if (fightSkill && selected.data.data.wildcard) {
    //WC with Fight Skill
    //console.log("WC with Fight Skill");
    rollFormula = `{1d${fightSkill.data.data.die.sides}x=, 1d${fightSkill.data.data["wild-die"].sides}x=}kh ${modifier} ${otherModifier}`;
  } else if (selected.data.data.wildcard) {
    rollFormula = `{1d4x=, 1d6x=}kh ${modifier} ${otherModifier}`;
    //WC without Fight skill
  } else if (fightSkill) {
    //NPC with Fight Skill
    //console.log("NPC with Fight Skill");
    rollFormula = `1d${fightSkill.data.data.die.sides}x= ${modifier} ${otherModifier}`;
  } else {
    //NPC without Fight Skill
    //console.log("NPC ");
    rollFormula = `1d4x= ${modifier} ${otherModifier}`;
  }

  let roll = new Roll(rollFormula).roll();
  if (game.dice3d) {
    game.dice3d.showForRoll(roll);
  }

  let numRaises = (roll.total - (targetParry + targetParryMod)) / 4;

  let chatTemplate = `
  <p> Fighting Skill: ${
    fightSkill ? fightSkill.data.data.die.sides : "Unskilled"
  } </p>
  <p> Target Parry (Shield Bonus): ${targetParry}(${targetParryMod}) </p>
  <p> Roll Formula: ${rollFormula} </p>
  <p></p>
  <p> Roll: ${roll.total} </p>
  <p> <b>
  ${numRaises >= 0 ? "Success" : "Did Not Hit"} 
  ${numRaises >= 2 ? `| Raises ${Math.floor(numRaises - 1)}` : ""}  
  </b></p>
  `;

  ChatMessage.create({
    speaker: {
      actor: selected,
      alias: selected.name,
    },
    content: chatTemplate,
  });
}
