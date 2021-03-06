let isValidConditions = true;
let diceStep = ["d4", "d6", "d8", "d10", "d12"];
let currentActor;

//Uses the selected actor to figure out guns
if (canvas.tokens.controlled.length != 1) {
    ui.notifications.warn("To attack you need to select a token");
    isValidConditions = false;
}else{
    // Set Actor
    currentActor = canvas.tokens.controlled[0].actor;

    // Check shaken state
    if (currentActor.data.data.status.isShaken) {
        ui.notifications.warn("You are shaken, you can't attack");
        isValidConditions = false;
    }
}

// Check target selected
if (Array.from(game.user.targets).length != 1) {
    ui.notifications.warn("To attack you need to select a target");
    isValidConditions = false;
}

let currentTarget;
let weapons;

// Attack type choice
if (isValidConditions) {
        // Set actor target
    currentTarget = Array.from(game.user.targets)[0].actor;

    // Set weapons list
    weapons = currentActor.items.filter((el) => el.type == "weapon" && el.data.data.equipped);

    new Dialog({
        title: "Combat",
        content: `<div style="padding: 10px 0px 10px 0px;"><center><i>Please, choose one attack type</i></center></div>`,
        buttons: {
            contact: {
                label: "Melee",
                callback: async (html) => {
                    meleeAttackForm(html);
                },
            },
            ranged: {
                label: "Range",
                callback: async (html) => {
                    rangedAttackForm(html);
                },
            }
        },
    }, { width: 400 }).render(true);
}

//Utility function for printing things to chat
function printMessage(message) {
    ChatMessage.create(
        {
        speaker: {
            actor: currentActor,
            alias: currentActor.name,
        },
        content: message,
        },
        {}
    );
} // end  printMessage

// Add EventListener to a html element
function addEventListenerOnHtmlElement(element, event, func){
    // Use Hook to add event to chat message html element
    Hooks.once("renderChatMessage", (chatItem, html) => { 
        html[0].querySelector(element).addEventListener(event, func);
    });
} // end addEventListenerOnHtmlElement

// melee attack form
function meleeAttackForm(){
    let templateWeaponsList = ``;

    // generate html template weapons list
    weapons.forEach((wep) => {
        if (wep.data.data.range == "0" || wep.data.data.range == "") 
        {
            templateWeaponsList += `<option value="${wep.name}">${wep.name} | Damage ${wep.data.data.damage} </option>`;
        }
    });

    // Check if template is not empty
    if (templateWeaponsList.length == 0) {
        ui.notifications.warn("No disponible weapon for this attack type");
        isValidConditions = false;
    }

    let template = `
    <div style="display: flex; flex-wrap: wrap; flex-direction: row; justify-content: space-between">
        <div style="padding: 0px 0px 5px 0px">
            <label style="display: inline-block; width: 200px">Weapons : </label>
            <select id="selectedWeapon">
            ${templateWeaponsList}
            </select>
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="targetCover" style="display: inline-block; width: 200px">Target cover : </label>
            <select id="targetCover">
            <option value="0">No cover</option>
            <option value="-2">Light</option>
            <option value="-4">Medium</option>
            <option value="-6">Heavy</option>
            <option value="-8">Near total</option>
            </select>
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="otherMod" style="display: inline-block; width: 200px">Other mods :
            </label> <input id="otherMod" style="width: 50px;" type="number" value="0" /></div>
        </div>
    <div>
    <div style="padding: 0px 0px 5px 0px; text-align: center;">
        <i><label>Status and size scale are automated</label></i>
    </div>`;
  
    if (isValidConditions) {
        // Show form
        new Dialog({
            title: "Melee Attack",
            content: template,
            buttons: {
                ok: {
                    label: "Attack",
                    callback: async (html) => {
                    commitAttack({ html, attackSkillName : "Fighting" });
                    },
                },
                cancel: {
                    label: "Cancel",
                },
            },
            default: "ok",
        }, { width: 550 }).render(true);
    }
} // end contactAttackForm

// Ranged attack form
function rangedAttackForm(){
    let templateWeaponsList = ``;

    // generate html template weapons list
    weapons.forEach((wep) => {
        if (wep.data.data.range != "0" && wep.data.data.range != "") 
        {
            templateWeaponsList += `<option value="${wep.name}">${wep.name} | RoF ${wep.data.data.rof} | shots ${wep.data.data.shots} </option>`;
        }
    });

    // Check if template is not empty
    if (templateWeaponsList.length == 0) {
        ui.notifications.warn("No disponible weapon for this attack type");
        isValidConditions = false;
    }

    let template = `
    <div style="display: flex; flex-wrap: wrap; flex-direction: row; justify-content: space-between">
        <div style="padding: 0px 0px 5px 0px">
            <label style="display: inline-block; width: 200px">Weapons : </label>
            <select id="selectedWeapon">
                ${templateWeaponsList}
            </select>
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="rangePenalty" style="display: inline-block; width: 200px">Target range : </label>
            <select id="rangePenalty">
                <option value="0">Short</option>
                <option value="-2">Medium</option>
                <option value="-4">Long</option>
                <option value="-8">Extrem</option>
            </select>
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="targetCover" style="display: inline-block; width: 200px">Target cover : </label>
            <select id="targetCover">
                <option value="0">No cover</option>
                <option value="-2">Light</option>
                <option value="-4">Medium</option>
                <option value="-6">Heavy</option>
                <option value="-8">Near total</option>
            </select>
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="selectedRoF" style="display: inline-block; width: 200px">Rate of fire : </label>
            <select id="selectedRoF" style="width: 50px;">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
            </select>
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="isRecoil" style="display: inline-block; width: 200px; margin-bottom: 3px; vertical-align: bottom;">Recoil penality : </label>
            <input id="isRecoil" style="width: 43px; height: 15px;" type="checkbox" />
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="otherMod" style="display: inline-block; width: 200px">Other mods : </label>
            <input id="otherMod" style="width: 50px;" type="number" value="0" />
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="isUnstable" style="display: inline-block; width: 200px; margin-bottom: 3px; vertical-align: bottom;">Unstable : </label>
            <input id="isUnstable" style="width: 43px; height: 15px;" type="checkbox" />
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="doubleTap" style="display: inline-block; width: 200px; margin-bottom: 3px; vertical-align: bottom;">Double tap (Edge) : </label>
            <input id="doubleTap" style="width: 43px; height: 15px;" type="checkbox" />
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="threeRoundBurst" style="display: inline-block; width: 200px; margin-bottom: 3px; vertical-align: bottom;">Three round burst : </label>
            <input id="threeRoundBurst" style="width: 43px; height: 15px;" type="checkbox" />
        </div>
        <div style="padding: 0px 0px 5px 0px">
            <label for="trackAmmo" style="display: inline-block; width: 200px; margin-bottom: 3px; vertical-align: bottom;">Track ammo consumption : </label>
            <input id="trackAmmo" style="width: 43px; height: 15px;" type="checkbox" checked />
        </div>
    </div>
    <div style="padding: 0px 0px 5px 0px; text-align: center;">
        <i><label>Status and size scale are automated</label></i>
    </div>`;
    
    // Show form
    if (isValidConditions) {
        new Dialog({
            title: "Attaque à Distance",
            content: template,
            buttons: {
                ok: {
                label: "Attaquer",
                callback: async (html) => {
                    commitAttack({ html, attackSkillName : "Shooting" });
                },
                },
                cancel: {
                label: "Annuler",
                },
            },
            default: "ok",
        },{ width: 550 }).render(true);
    }
    
} // end rangedAttackForm

// Settings for damage outpout
function damageSettings(params, eventTarget)
{
    let template = `
    <div><p style="text-align: center">Apply some settings for damage roll</p></div>
    <div style="display: flex; flex-wrap: wrap; flex-direction: row; justify-content: space-between">
        <div style="padding: 0px 0px 5px 0px;">
            <label for="coverBonus" style="display: inline-block; width: 200px">Obstacle armor bonus : </label>
            <select id="coverBonus" style="width: 50px;">
                <option value="0">0</option>    
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="6">6</option>
                <option value="8">8</option>
                <option value="10">10</option>
            </select>
        </div>
        <div style="padding: 0px 0px 5px 0px;">
            <label for="ignoreArmor" style="display: inline-block; width: 200px; margin-bottom: 3px; vertical-align: bottom;">Ignore target armor : </label>
            <input id="ignoreArmor" style="width: 43px; height: 15px;" type="checkbox" />
        </div>
        <div style="padding: 0px 0px 5px 0px;">
            <label for="damageMod" style="display: inline-block; width: 200px">Damage modification : </label>
            <input id="damageMod" style="width: 50px;" type="number" value="0" />
        </div>
        <div style="padding: 0px 0px 5px 0px;">
            <label for="isGrettyDamage" style="display: inline-block; width: 200px; margin-bottom: 3px; vertical-align: bottom;">Apply gritty damage : </label>
            <input id="isGrettyDamage" style="width: 43px; height: 15px;" type="checkbox" />
        </div>
    </div>`;
    
    new Dialog({
        title: "Damage Settings",
        content: template,
        buttons: {
            ok: {
            label: "Confirm",
            callback: async (html) => {
                eventTarget.style.display = "none";
                params.html = html;
                damageCalculation(params);
            },
            },
            cancel: {
            label: "Cancel",
            },
        },
        default: "ok",
    },{ width: 540 }).render(true);    
} //end damageSettings

//Attack process
function commitAttack(params)
{

    let html = params.html;
    let attackSkillName = params.attackSkillName;
    let bennieUsed = params.bennieUsed;

    let ammoUsed = 0;
    
    //SWADE rules for how much ammo is expended per RoF
    let rofAmmo = { 1: 1, 2: 5, 3: 10, 4: 20, 5: 40, 6: 50 };
    
    //SWADE rules SizeScale
    let sizeScale = [
        {size: -4, mod : -6}, {size: -3, mod : -4}, {size: -2, mod : -2}, {size: -1, mod : 0},
        {size: 0, mod : 0}, {size: 1, mod : 0}, {size: 2, mod : 0}, {size: 3, mod : 0},
        {size: 4, mod : 2}, {size: 5, mod : 2}, {size: 6, mod : 2}, {size: 7, mod : 2},
        {size: 8, mod : 4}, {size: 9, mod : 4}, {size: 10, mod : 4}, {size: 11, mod : 4},
        {size: 12, mod : 6}, {size: 13, mod : 6}, {size: 14, mod : 6}, {size: 15, mod : 6},
        {size: 16, mod : 6}, {size: 17, mod : 6}, {size: 18, mod : 6}, {size: 19, mod : 6}, {size: 20, mod : 6}
      ];

    
    // Get weapon selected
    let weapon = weapons.find((el) => el.name == html.find("#selectedWeapon")[0].value);

    // Get number of attack if a ranged attack or set to 1 for melee attack
    let nbAttack = html.find("#selectedRoF")[0] === undefined ? 1 : html.find("#selectedRoF")[0].value;

    // Get skill need for attack
    let attackSkill = currentActor.items.find((el) => el.data.name == attackSkillName);
    
    // Get Track ammo setting
    let trackAmmo = html.find("#trackAmmo")[0] === undefined ? 0 : html.find("#trackAmmo")[0].checked ? -2 : 0;
    
    // Get double Tap option
    let doubleTapEdge = html.find("#doubleTap")[0] === undefined ? 0 : html.find("#doubleTap")[0].checked ? 1 : 0;

    // Get three round burst ability
    let threeRoundBurstAbility = html.find("#threeRoundBurst")[0] === undefined ? 0 : html.find("#threeRoundBurst")[0].checked ? 1 : 0;
    
    // Set nbAttack for his special abilities
    if (doubleTapEdge || threeRoundBurstAbility) nbAttack = 1

    // Simulate unskilled skill when the attack skill is not found
    if (attackSkill === null) attackSkill = { data : { data : { die : { sides : 4, modifier: -2 }, "wild-die" : { sides : 6 }  } } };
    
    //Some check for Ranged Attack
    if (attackSkillName == "Shooting") {
        ammoUsed = rofAmmo[nbAttack];

        if (threeRoundBurstAbility) ammoUsed = 3;
        if (doubleTapEdge) ammoUsed * 2;

        // Check RoF
        if ((nbAttack > weapon.data.data.rof)) {
            ui.notifications.warn("You need to select a valid RoF for your weapon");
            isValidConditions = false;
        };
        
        // Check ammo
        if (ammoUsed > weapon.data.data.shots) {
            ui.notifications.warn(`No munition for this rate of fore, you have (${weapon.data.data.shots}) ammo left`);
            isValidConditions = false;
        };
    };

    let diceResultPool = [];
    // Roll Dices
    for (let i = 0; i < nbAttack; i++) {
        diceResultPool.push({ type: "skillRoll", roll : new Roll("1d" + attackSkill.data.data.die.sides + "x=" + (attackSkill.data.data.die.modifier == "" ? "" : " + " + attackSkill.data.data.die.modifier)).roll(), saved : 1});
    }

    // Roll Wild for Joker
    // Last entities in dicePoolResult is Wild
    if (currentActor.data.data.wildcard) {
        diceResultPool.push({ type: "wildRoll", roll : new Roll("1d" + attackSkill.data.data["wild-die"].sides + "x=").roll(), saved : 1});
    }

    // Unsaved lesser result from Dice Pool
    if (diceResultPool.length > 1)
        diceResultPool[diceResultPool.findIndex((el) => el.roll.total == Math.min(...diceResultPool.map((el) => el.roll.total)))].saved = 0;

    // Build Modifiers
    let skillModPool = [];
    //skillModPool.push({ mod : "skilled", value : !parseInt(attackSkill.data.data.die.modifier) ? 0 : parseInt(attackSkill.data.data.die.modifier) });
    skillModPool.push({ mod : "rangePenalty", title : "Range Penality", abilitie : 0, value : html.find("#rangePenalty")[0] === undefined ? 0 : parseInt(html.find("#rangePenalty")[0].value) });
    skillModPool.push({ mod : "targetCover", title : "Target Cover", abilitie : 0, value : html.find("#targetCover")[0] === undefined ? 0 : parseInt(html.find("#targetCover")[0].value) });
    skillModPool.push({ mod : "isRecoil", title : "Is Recoil", abilitie : 0, value : html.find("#isRecoil")[0] === undefined ? 0 : html.find("#isRecoil")[0].checked ? -2 : 0 });
    skillModPool.push({ mod : "isUnstable", title : "Is Unstable", abilitie : 0, value : html.find("#isUnstable")[0] === undefined ? 0 : html.find("#isUnstable")[0].checked ? -2 : 0 });
    skillModPool.push({ mod : "distracted", title : "Distracted", abilitie : 0, value : currentActor.data.data.status.isDistracted ? -2 : 0});
    skillModPool.push({ mod : "vulnerable", title : "Target Vunerable", abilitie : 0, value : currentTarget.data.data.status.isVulnerable ? 2 : 0});
    skillModPool.push({ mod : "woundsFatigue", title : "Wounds and Fatigue", abilitie : 0, value : currentActor.calcWoundFatigePenalties()});
    skillModPool.push({ mod : "sizeScale", title : "Size Scale", abilitie : 0, value : (sizeScale[sizeScale.findIndex((el) => el.size == currentActor.data.data.stats.size)].mod * -1) + sizeScale[sizeScale.findIndex((el) => el.size == currentTarget.data.data.stats.size)].mod });
    skillModPool.push({ mod : "doubleTap", title : "Double Tap", abilitie : 1, value : doubleTapEdge ? 1 : 0 });
    skillModPool.push({ mod : "threeRoundBurst", title : "Three Round Burst", abilitie : 1, value : threeRoundBurstAbility ? 1 : 0 });
    if (attackSkillName == "Shooting") 
    { 
        skillModPool.push({ mod : "minStrength", title : "Min Strength", abilitie : 0, value : weapon.data.data.minStr == "" ? 0 : diceStep.indexOf(weapon.data.data.minStr) > diceStep.indexOf(("d" + currentActor.data.data.attributes.strength.die.sides)) ? diceStep.indexOf(("d" + currentActor.data.data.attributes.strength.die.sides)) - diceStep.indexOf(weapon.data.data.minStr) : 0});
    }
    skillModPool.push({ mod : "otherMod", title : "Other Mod", abilitie : 0, value : html.find("#otherMod")[0] === undefined ? 0 : parseInt(html.find("#otherMod")[0].value) });

    // Set Total modifications variable
    let totalMod = 0;
    skillModPool.forEach((el) =>  totalMod += el.value );

    let displaySuccessResultTemplate = ``;
    let displayRollResultTemplate = ``;
    let successResultPool = [];

    // Create roll result template
    diceResultPool.forEach((el) => {
        displayRollResultTemplate +=
        `<div style="flex: 1 0 auto;">
                <div style="padding: 3px 0px 3px 0px; box-shadow: 0 0 2px #FFF inset; border-radius: 3px; ${ el.type == "wildRoll" ? "background-color: rgb(255,215,0, 0.35);" : el.roll.total > el.roll.parts[0].faces ? "background-color : rgb(0, 200, 0, 0.35)" : el.roll.total == 1 ? "background-color : rgb(255, 0, 0, 0.35)" : "" }" title="${el.roll.formula }"><label style="color: white;">${ el.roll.total }</label></div>
            </div>`;
    });

    // Check if critical failure !
    let criticalFailure = (diceResultPool.filter((el) => el.roll.total == 1).length > (diceResultPool.length / 2)) && (!currentActor.data.data.wildcard || diceResultPool.find((el) => el.type == "wildRoll" && el.roll.total == 1) !== undefined);
    if (criticalFailure){
        displaySuccessResultTemplate += 
        `<div style="flex: 1 0 auto;">
            <div style="padding: 3px 0px 3px 0px; box-shadow: 0 0 2px #FFF inset; border-radius: 3px; background-color : rgb(255, 0, 0, 0.35)"><label style="color : rgb(200, 0, 0);">!! Critical Failure !!</label></div>
        </div>`;
    }
    else
    {
        // Create roll interpretation template
        diceResultPool.filter((el) => el.saved).forEach((el) =>{

            let result = (el.roll.total + totalMod) >= (attackSkillName == "Shooting" ? 4 : parseInt(currentTarget.data.data.stats.parry.value)) + 4 ? { display : "Raise", color : "rgb(0, 0, 255, 0.35)" } :
                            (el.roll.total + totalMod) >= (attackSkillName == "Shooting" ? 4 : parseInt(currentTarget.data.data.stats.parry.value)) ? { display : "Hit", color : "rgb(0, 200, 0, 0.35)" } : { display : "Miss", color : "rgb(255, 0, 0, 0.35)" }
            
            if (result.display != "Miss") successResultPool.push(result.display);
            
            displaySuccessResultTemplate += 
                `<div style="flex: 1 0 auto;">
                    <div style="padding: 3px 0px 3px 0px; box-shadow: 0 0 2px #FFF inset; border-radius: 3px; background-color : ${ result.color }" title="${ el.roll.total} (${ el.roll.total + totalMod })"><label style="color : white;">${ result.display }</label></div>
                </div>`;
        });
    }

    //Message chat template
    let chatTemplate = $(
    `<div>
        <div style="display: flex; align-items: center;">
            <div style="width: 52px; flex: 0 0 52px;">
                <img src="${weapon.data.img}"></img>
            </div>
            <div style="padding-left: 5px;">
                <span>Attack against <b>${currentTarget.data.name}</b> with the weapon <b>${weapon.data.name}</b></span>
            </div>
        </div>
        ${ attackSkillName == "Shooting" ? `<p><i><b>${ ammoUsed }</b> ammo used</i></p>` : "" }
        <p><i>Notes : ${weapon.data.data.notes}</i></p>
        <p style="font-size: 12px;"><label style="font-weight: bold;">Abilities used :</label> ${ skillModPool.filter((el) => el.abilitie == 1).map((el) => el.title).join(", ") }</p>
        ${ bennieUsed ? `<p style="text-align: center"><b>One bennie used for reroll attack</b></p>` : "" }
        <div style="border: 1px solid #999; display: flex; box-shadow: 0 0 2px #FFF inset; background: rgba(255, 255, 240, 0.8); margin-bottom: 5px; text-align: center;">
                <div style="flex-grow: 1; padding-bottom: 2px; padding-top: 2px;"><span>Diff. : </span><span>${ attackSkillName == "Shooting" ? "4" : currentTarget.data.data.stats.parry.value }</span></div>
                <div style="flex-grow: 1; padding-bottom: 2px; padding-top: 2px;" title="${ skillModPool.filter((el) => el.value != 0).map((el) => el.title + " : " + el.value).join("\n") }"><span>Mod : </span><span>${totalMod}</span></div>
        </div>
        <div style="border: 1px solid #999; border-radius: 3px; box-shadow: 0 0 2px #FFF inset; background: rgba(0, 0, 0, 0.1); text-align: center;">
            <div style="display: flex; flex-wrap: wrap;">
                <div style="box-shadow: 0 0 2px #FFF inset; display: flex; flex-direction: column; text-align: center; flex: 1 100 auto; width: 100%">
                    <div style="padding: 5px 0px 5px 0px; background: rgba(255, 255, 240, 0.8);">
                        <label><b>Roll</b></label>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; font-size: 16px; font-weight: bold">
                        ${displayRollResultTemplate}
                    </div>
                </div>
                <div style="box-shadow: 0 0 2px #FFF inset; display: flex; flex-direction: column; text-align: center; flex: 1 100 auto; width: 100%">
                    <div style="padding: 5px 0px 5px 0px; background: rgba(255, 255, 240, 0.8);">
                        <label><b>Result</b></label>
                    </div>
                    <div style="display: flex; flex-wrap: wrap; font-size: 16px; font-weight: bold">
                        ${displaySuccessResultTemplate}
                    </div>
                </div>
            </div>
        </div>
    </div>`);
    
    if (isValidConditions) {

        // Apply bennie button and listener to chatTemplate if not critical failure
        if (!criticalFailure) {
            let bennieButtonTemplate = $(
                `<div style="display: flex; padding-top: 5px;">
                <button id="reRollButton"><center>Reroll with a Bennie</center></button>
                </div>`
            );
        
            chatTemplate.append(bennieButtonTemplate);

            // Add event to chat message html element
            addEventListenerOnHtmlElement("#reRollButton", 'click', (e) => { 
                e.target.style.display = "none"; 
                params.bennieUsed = true;
                commitAttack(params);
            }); 
        }
        
         // Apply damage button and listener to chatTemplate if 1+ success
        if (successResultPool.length > 0) {
            let damageButtonTemplate = $(
                `<div style="display: flex; padding-top: 5px;">
                <button id="callDamageButton"><center>Apply damage</center></button>
                </div>`
            );
            
            chatTemplate.append(damageButtonTemplate);

            // Add event to chat message html element
            addEventListenerOnHtmlElement("#callDamageButton", 'click', (e) => { 
                damageSettings({weapon, successResultPool, attackSkillName, doubleTapEdge, threeRoundBurstAbility}, e.target);
            }); 
        }

        // Remove ammo from weapon
        if (attackSkillName == "Shooting" && trackAmmo && !bennieUsed) {
            let newShots = (weapon.data.data.shots -= ammoUsed);
            weapon.update({ "data.shots": newShots });
        };

        // Displat chat template
        // Check can use "So Nice Dices" mod effects
        game.dice3d === undefined ? printMessage(chatTemplate[0].outerHTML) : game.dice3d.showForRoll(diceResultPool.map((el) => el.roll)).then(displayed => {
            
            printMessage(chatTemplate[0].outerHTML);
        });   
    }
}// end commitAttack

// Calcul and display damages
function damageCalculation(params) //weapon, successResultPool, attackSkillName)
{
    let weapon = params.weapon;
    let successResultPool = params.successResultPool;
    let attackSkillName = params.attackSkillName;
    let bennieUsed = params.bennieUsed;
    let html = params.html;
    let doubleTapEdge = params.doubleTapEdge;
    let threeRoundBurstAbility = params.threeRoundBurstAbility;

    // SWADE rule, injury table page 95
    let criticalInjury = [
        { value : [ 2 ], injury : "Unmentionables", subInjury : undefined },
        { value : [ 3, 4 ], injury : "Arm", subInjury : undefined },
        { value : [ 5, 6, 7, 8, 9 ], injury : "Guts", subInjury : [
            { value : [ 1, 2 ], injury : "Broken" },
            { value : [ 3, 4 ], injury : "Battered" },
            { value : [ 5, 6 ], injury : "Busted" }
        ]},
        { value : [ 10, 11 ], injury : "Leg", subInjury : undefined },
        { value : [ 12 ], injury : "Head", subInjury : [
            { value : [ 1, 2, 3 ], injury : "Hideous Scar" },
            { value : [ 4, 5 ], injury : "Blinded" },
            { value : [ 6 ], injury : "Brain Damage" }
        ]}
    ];

    let damageModPool = [];

    // create a dice pool
    let diceResultPool = [];
    
    // get cover bonus
    let coverBonus = html.find("#coverBonus")[0] === undefined ? 0 : html.find("#coverBonus")[0].value;

    // get isGrettyDamage parameter
    let isGrettyDamage = html.find("#isGrettyDamage")[0] === undefined ? false : html.find("#isGrettyDamage")[0].checked ? true : false;

    // get ignore armor
    let ignoreAmor = html.find("#ignoreArmor")[0] === undefined ? false : html.find("#ignoreArmor")[0].checked ? true : false;

    // get damage modification
    if (doubleTapEdge) damageModPool.push({ mod : "doubleTap", title : "Double Tap", abilitie : 0, value : 1});
    if (threeRoundBurstAbility) damageModPool.push({ mod : "threeRoundBurst", title : "Three Round Burst", abilitie : 0, value : 1});
    damageModPool.push({ mod : "otherMod", title : "Other Mod", abilitie : 0, value : html.find("#damageMod")[0] === undefined ? 0 : parseInt(html.find("#damageMod")[0].value)});

    // Set Total damage variables
    let totalDamageMod = 0;
    damageModPool.forEach((el) =>  totalDamageMod += el.value );

    // Roll Dices
    for (let i = 0; i < successResultPool.length; i++) {
        
        let weaponDamage = weapon.data.data.damage;

        // Downgrade weapon damage for minStr restrcitions
        if (attackSkillName == "Fighting" && weapon.data.data.minStr != "" && diceStep.indexOf(weapon.data.data.minStr) > diceStep.indexOf(("d" + currentActor.data.data.attributes.strength.die.sides))) 
        {
            weaponDamage = "@str+1d" + currentActor.data.data.attributes.strength.die.sides + " + " + (currentActor.data.data.attributes.strength.die.modifier != "0" ? currentActor.data.data.attributes.strength.die.modifier : "");
        }     

        // Update @str from Strenght dice
        let regexStr = /[@]str/g;
        weaponDamage = weaponDamage.replace(regexStr, "1d" + currentActor.data.data.attributes.strength.die.sides)

        // Add Raise
        weaponDamage += (successResultPool[i] == "Raise" ? " + 1d6" : "")
        weaponDamage += " + " + totalDamageMod;

        // Explode all dices
        let regexDiceExplode = /d[0-9]{1,2}/g;
        weaponDamage = weaponDamage.replace(regexDiceExplode, "$&x=");

        // Roll dices damages
        diceResultPool.push({ type: "damageRoll", roll : new Roll(weaponDamage).roll(), raise : successResultPool[i] == "Raise" ? 1 : 0});
    }

    // Prepare template
    let displayRollResultTemplate = ``;
    let targetShaken = currentTarget.data.data.status.isShaken;

    // Get armor equipped
    let armorToughness = 0;
    if (!ignoreAmor) currentTarget.items.filter((el) => el.data.type == "armor" && el.data.data.equipped).forEach((el) => armorToughness += parseInt(el.data.data.armor));

    // Create roll result template
    diceResultPool.forEach((el) => {
        displayRollResultTemplate += `<div style="display: flex; flex-wrap: wrap; font-size: 16px; font-weight: bold">`;
        displayRollResultTemplate +=
            `<div style="flex: 0 0 50px;">
                <div style="padding: 3px 0px 3px 0px; box-shadow: 0 0 2px #FFF inset; border-radius: 3px; ${ el.raise ? "background-color: rgb(0, 200, 0, 0.35);" : "" } "  title="${ el.roll.formula + "\n" + el.roll.result }" ><label style="color: white;">${ el.roll.total }</label></div>
            </div>`;

        // Calcul total toughness
        let totalToughness = (parseInt(currentTarget.data.data.stats.toughness.value) 
                            + (parseInt(weapon.data.data.ap) > (parseInt(armorToughness) + parseInt(coverBonus)) ? 0 : (parseInt(armorToughness) + parseInt(coverBonus)) - parseInt(weapon.data.data.ap))
                            + parseInt(currentTarget.data.data.stats.toughness.modifier));

        // FOR VERSION OF SWADE SYSTEM WITH ARMOR IMPROVMENT
        // let totalToughness = (parseInt(currentTarget.data.data.stats.toughness.value) 
        //                     + (parseInt(weapon.data.data.ap) > parseInt(currentTarget.data.data.stats.toughness.armor) ? 0 : parseInt(currentTarget.data.data.stats.toughness.armor) - parseInt(weapon.data.data.ap))
        //                     + parseInt(currentTarget.data.data.stats.toughness.modifier));
        
        // Check if roll is better that toughness
        if (el.roll.total >= totalToughness) {
       
            // Calcul wounds
            let wounds = Math.floor(((el.roll.total - totalToughness) / 4)) + (targetShaken ? 1 : 0);

            if (!targetShaken) {
                displayRollResultTemplate +=
                    `<div style="flex: 1 0 auto;">
                        <div style="padding: 3px 0px 3px 0px; box-shadow: 0 0 2px #FFF inset; border-radius: 3px; background-color: rgb(255,215,0, 0.35);" title=">= ${ totalToughness }"><label style="color: white;">Shaken</label></div>
                    </div>`; 
            }
            
            if (wounds > 0)
            {
                displayRollResultTemplate +=
                        `<div style="flex: 1 0 auto;">
                            <div style="padding: 3px 0px 3px 0px; box-shadow: 0 0 2px #FFF inset; border-radius: 3px; background-color: rgb(255, 0, 0, 0.35);" title=">=${ (totalToughness + (wounds * 4)) }"><label style="color: white;">${ wounds } Wounds</label></div>
                        </div>`;
                
                if (isGrettyDamage && ((targetShaken && wounds > 1) || !targetShaken)) {

                    let roll1 =new Roll("2d6").roll().total;
                    let roll2 =new Roll("1d6").roll().total;
                    
                    let injury = criticalInjury.find((el) => el.value.includes(roll1));
                    let subInjury =  injury.subInjury != undefined ? injury.subInjury.find((el) => el.value.includes(roll2)) : undefined;

                    displayRollResultTemplate +=
                        `<div style="flex: 1 0 auto;">
                            <div style="padding: 3px 0px 3px 0px; box-shadow: 0 0 2px #FFF inset; border-radius: 3px;"><label style="color: white;" title="${ roll1 } ${ injury.subInjury != undefined ? "->" + roll2 : ""}">${ subInjury == undefined ? injury.injury : subInjury.injury }</label></div>
                        </div>`;
                }
            }
             
            targetShaken = true;
        }else{
            displayRollResultTemplate += 
                `<div style="flex: 1 0 auto;">
                    <div style="padding: 3px 0px 3px 0px; box-shadow: 0 0 2px #FFF inset; border-radius: 3px; background-color: rgb(0, 0, 255, 0.35);" title="< ${ totalToughness }"><label style="color: white;">No Damage</label></div>
                </div>`;
        }
        displayRollResultTemplate += `</div>`;
    });

    // Chat Template
    let chatTemplate = $(
        `<div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <div style="width: 52px; flex: 0 0 52px;">
                    <img src="${weapon.data.img}"></img>
                </div>
                <div style="padding-left: 5px;">
                    <span>Attack with weapon <b>${weapon.data.name}</b> hit the target <b>${currentTarget.data.name}</b></span>
                </div>
            </div>
            ${ bennieUsed ? `<p style="text-align: center"><b>One bennie used for reroll damage</b></p>` : "" }
            <div style="border: 1px solid #999; display: flex; box-shadow: 0 0 2px #FFF inset; background: rgba(255, 255, 240, 0.8); margin-bottom: 5px; text-align: center; flex-wrap: wrap;">
                <div style="width: 50%; flex: 1 0 auto; padding-bottom: 2px; padding-top: 2px;"><span>AP : </span><span>${ weapon.data.data.ap }</span></div>
                <div style="width: 50%; flex: 1 0 auto; padding-bottom: 2px; padding-top: 2px;" title="${ "armor : " + armorToughness + "\n" + "cover : " + coverBonus }"><span>Armor : </span><span> ${ (armorToughness + parseInt(coverBonus)) }</span></div>
                <div style="width: 50%; flex: 1 0 auto; padding-bottom: 2px; padding-top: 2px;"><span>Toughness : </span><span> ${ currentTarget.data.data.stats.toughness.value }</span></div>
                <div style="width: 50%; flex: 1 0 auto; padding-bottom: 2px; padding-top: 2px;" title="${ damageModPool.map((el) => el.title + " : " + el.value).join("\n") }"><span>Damage mod : </span><span>${ totalDamageMod }</span></div>
            </div>
            <div style="border: 1px solid #999; border-radius: 3px; box-shadow: 0 0 2px #FFF inset; background: rgba(0, 0, 0, 0.1); text-align: center; margin-bottom: 10px;">
                <div style="display: flex; flex-wrap: wrap;">
                    <div style="box-shadow: 0 0 2px #FFF inset; display: flex; flex-direction: column; text-align: center; flex: 1 100 auto; width: 100%">
                        <div style="padding: 5px 0px 5px 0px; background: rgba(255, 255, 240, 0.8);">
                            <label><b>Result</b></label>
                        </div>
                        ${ displayRollResultTemplate }
                    </div>
                </div>
            </div>
        </div>`
    );

    // Apply bennie button and listener to chatTemplate if not critical failure
    let bennieButtonTemplate = $(
        `<div style="display: flex; padding-top: 5px;">
        <button id="reRollButton"><center>Reroll with a Bennie</center></button>
        </div>`
    );

    chatTemplate.append(bennieButtonTemplate);
    
    // Add event to chat message html element
    addEventListenerOnHtmlElement("#reRollButton", 'click', (e) => { 
        e.target.style.display = "none"; 
        params.bennieUsed = true;
        damageCalculation(params);
    }); 
    
    // Displat chat template
    // Check can use "So Nice Dices" mod effects
    game.dice3d === undefined ? printMessage(chatTemplate[0].outerHTML) : game.dice3d.showForRoll(diceResultPool.map((el) => el.roll)).then(displayed => {
        printMessage(chatTemplate[0].outerHTML);
    });

} // end damageCalculation