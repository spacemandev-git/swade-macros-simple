let isValidConditions = true;
let diceStep = ["d4", "d6", "d8", "d10", "d12"];
let currentActor;

//Uses the selected actor to figure out guns
if (canvas.tokens.controlled.length != 1) {
    ui.notifications.warn(i18n("swadeMacro.ui.notification.needActor"));
    isValidConditions = false;
}else{
    // Set Actor
    currentActor = canvas.tokens.controlled[0].actor;

    // Check shaken state
    if (currentActor.data.data.status.isShaken) {
        ui.notifications.warn(i18n("swadeMacro.ui.notification.actorShaken"));
        isValidConditions = false;
    }
}

// Check target selected
if (Array.from(game.user.targets).length != 1) {
    ui.notifications.warn(i18n("swadeMacro.ui.notification.needTarget"));
    isValidConditions = false;
}

let currentTarget;
let weapons;

function i18n(key) {
    return game.i18n.localize(key);
}

if (isValidConditions) openDialogCombat();

// Attack type choice
async function openDialogCombat()
{   
    // Set actor target
    currentTarget = Array.from(game.user.targets)[0].actor;

    // Set weapons list
    
    weapons = currentActor.items.filter((el) => el.type == "weapon" && el.data.data.equipped);

    let template = await renderTemplate("modules/swade-macros-simple-localization/templates/dialog-combat.html");

    new Dialog({
        title: i18n("swadeMacro.combatDialog.title"),
        content: template,
        buttons: {
            contact: {
                label: i18n("swadeMacro.combatDialog.meleeButton"),
                callback: async (html) => {
                    meleeAttackForm(html);
                },
            },
            ranged: {
                label: i18n("swadeMacro.combatDialog.rangeButton"),
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
async function  meleeAttackForm(){
     let meleeWeapons = weapons.filter((el) => el.data.data.range == "0" || el.data.data.range == "");
 
    // Check if template is not empty
    if (meleeWeapons.length == 0) {
        ui.notifications.warn(i18n("swadeMacro.ui.notification.noWeaponsMessage"));
        isValidConditions = false;
    }

    // Prepare melee atack form template
    let template = await renderTemplate("modules/swade-macros-simple-localization/templates/dialog-melee-attack.html",{weapons : meleeWeapons });

    if (isValidConditions) {
        // Show form
        new Dialog({
            title: i18n("swadeMacro.meleeCombatDialog.title"),
            content: template,
            buttons: {
                ok: {
                    label: i18n("swadeMacro.meleeCombatDialog.confirmButton"),
                    callback: async (html) => {
                    commitAttack({ html, attackSkillName : "Fighting" });
                    },
                },
                cancel: {
                    label: i18n("swadeMacro.meleeCombatDialog.cancelButton"),
                },
            },
            default: "ok",
        }, { width: 550 }).render(true);
    }
} // end contactAttackForm

// Ranged attack form
async function rangedAttackForm(){

    let rangeWeapons = weapons.filter((el) => el.data.data.range != "0" && el.data.data.range != "")
    // Check if template is not empty
    if (rangeWeapons.length == 0) {
        ui.notifications.warn(i18n("swadeMacro.ui.notification.noWeaponsMessage"));
        isValidConditions = false;
    }
    //templateWeaponsList += `<option value="${wep.name}">${wep.name} | RoF ${wep.data.data.rof} | shots ${wep.data.data.shots} </option>`;
    // Prepare range atack form template
    let template = await renderTemplate("modules/swade-macros-simple-localization/templates/dialog-range-attack.html",{weapons : rangeWeapons });

    // Show form
    if (isValidConditions) {
        new Dialog({
            title: i18n("swadeMacro.rangeCombatDialog.title"),
            content: template,
            buttons: {
                ok: {
                label: i18n("swadeMacro.rangeCombatDialog.confirmButton"),
                callback: async (html) => {
                    commitAttack({ html, attackSkillName : "Shooting" });
                },
                },
                cancel: {
                label: i18n("swadeMacro.rangeCombatDialog.cancelButton"),
                },
            },
            default: "ok",
        },{ width: 550 }).render(true);
    }

} // end rangedAttackForm

// Settings for damage outpout
async function damageSettings(params, eventTarget)
{
    let template = await renderTemplate("modules/swade-macros-simple-localization/templates/dialog-damage-settings.html");

    new Dialog({
        title: i18n("swadeMacro.damageSettingsDialog.title"),
        content: template,
        buttons: {
            ok: {
            label: i18n("swadeMacro.damageSettingsDialog.confirmButton"),
            callback: async (html) => {
                eventTarget.style.display = "none";
                params.html = html;
                damageResult(params);
            },
            },
            cancel: {
            label: i18n("swadeMacro.damageSettingsDialog.cancelButton"),
            },
        },
        default: "ok",
    },{ width: 540 }).render(true);    
} //end damageSettings

//Attack process
async function commitAttack(params)
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
            ui.notifications.warn(i18n("swadeMacro.ui.notification.rofNotValid"));
            isValidConditions = false;
        };
        
        // Check ammo
        if (ammoUsed > weapon.data.data.shots) {
            ui.notifications.warn(i18n("swadeMacro.ui.notification.noEnougthAmmo"));
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
    skillModPool.push({ mod : "rangePenalty", title : i18n("swadeMacro.attack.skillMod.rangePenality"), abilitie : 0, value : html.find("#rangePenalty")[0] === undefined ? 0 : parseInt(html.find("#rangePenalty")[0].value) });
    skillModPool.push({ mod : "targetCover", title : i18n("swadeMacro.attack.skillMod.targetCover"), abilitie : 0, value : html.find("#targetCover")[0] === undefined ? 0 : parseInt(html.find("#targetCover")[0].value) });
    skillModPool.push({ mod : "isRecoil", title : i18n("swadeMacro.attack.skillMod.isRecoil"), abilitie : 0, value : html.find("#isRecoil")[0] === undefined ? 0 : html.find("#isRecoil")[0].checked ? -2 : 0 });
    skillModPool.push({ mod : "isUnstable", title : i18n("swadeMacro.attack.skillMod.isUnstable"), abilitie : 0, value : html.find("#isUnstable")[0] === undefined ? 0 : html.find("#isUnstable")[0].checked ? -2 : 0 });
    skillModPool.push({ mod : "distracted", title : i18n("swadeMacro.attack.skillMod.distracted"), abilitie : 0, value : currentActor.data.data.status.isDistracted ? -2 : 0});
    skillModPool.push({ mod : "vulnerable", title : i18n("swadeMacro.attack.skillMod.vulnerable" ), abilitie : 0, value : currentTarget.data.data.status.isVulnerable ? 2 : 0});
    skillModPool.push({ mod : "woundsFatigue", title : i18n("swadeMacro.attack.skillMod.woundsFatigue" ), abilitie : 0, value : currentActor.calcWoundFatigePenalties()});
    skillModPool.push({ mod : "sizeScale", title : i18n("swadeMacro.attack.skillMod.sizeScale"), abilitie : 0, value : (sizeScale[sizeScale.findIndex((el) => el.size == currentActor.data.data.stats.size)].mod * -1) + sizeScale[sizeScale.findIndex((el) => el.size == currentTarget.data.data.stats.size)].mod });
    skillModPool.push({ mod : "doubleTap", title : i18n("swadeMacro.attack.skillMod.doubleTap"), abilitie : 1, value : doubleTapEdge ? 1 : 0 });
    skillModPool.push({ mod : "threeRoundBurst", title : i18n("swadeMacro.attack.skillMod.threeRoundBurst"), abilitie : 1, value : threeRoundBurstAbility ? 1 : 0 });
    if (attackSkillName == "Shooting") 
    { 
        skillModPool.push({ mod : "minStrength", title : i18n("swadeMacro.attack.skillMod.minStr"), abilitie : 0, value : weapon.data.data.minStr == "" ? 0 : diceStep.indexOf(weapon.data.data.minStr) > diceStep.indexOf(("d" + currentActor.data.data.attributes.strength.die.sides)) ? diceStep.indexOf(("d" + currentActor.data.data.attributes.strength.die.sides)) - diceStep.indexOf(weapon.data.data.minStr) : 0});
    }
    skillModPool.push({ mod : "otherMod", title : i18n("swadeMacro.attack.skillMod.otherMods"), abilitie : 0, value : html.find("#otherMod")[0] === undefined ? 0 : parseInt(html.find("#otherMod")[0].value) });

    // Set Total modifications variable
    let totalMod = 0;
    skillModPool.forEach((el) =>  totalMod += el.value );

    // Check if critical failure !
    let criticalFailure = (diceResultPool.filter((el) => el.roll.total == 1).length > (diceResultPool.length / 2)) && (!currentActor.data.data.wildcard || diceResultPool.find((el) => el.type == "wildRoll" && el.roll.total == 1) !== undefined);
    let successResultPool = [];

    // Create roll result template
    diceResultPool.forEach((el) => {
        el.bgColor = (el.type == "wildRoll" ? "background-color: rgb(255,215,0, 0.35);" : el.roll.total > el.roll.parts[0].faces ? "background-color : rgb(0, 200, 0, 0.35)" : el.roll.total == 1 ? "background-color : rgb(255, 0, 0, 0.35)" : "");
        
        if (el.saved){
            let result = (el.roll.total + totalMod) >= (attackSkillName == "Shooting" ? 4 : parseInt(currentTarget.data.data.stats.parry.value)) + 4 ? { display : i18n("swadeMacro.commitAttackChat.raise"), color : "rgb(0, 0, 255, 0.35)" } :
            (el.roll.total + totalMod) >= (attackSkillName == "Shooting" ? 4 : parseInt(currentTarget.data.data.stats.parry.value)) ? { display : i18n("swadeMacro.commitAttackChat.hit"), color : "rgb(0, 200, 0, 0.35)" } : { display : i18n("swadeMacro.commitAttackChat.miss"), color : "rgb(255, 0, 0, 0.35)" }
            if (result.display != i18n("swadeMacro.commitAttackChat.miss")) successResultPool.push(result.display);
            result.total = (el.roll.total + totalMod);
            el.display = result;
        };
    });
    
    if (isValidConditions) {

        let chatMessage = await renderTemplate("modules/swade-macros-simple-localization/templates/chat-commit-attack.html",{
            weaponImg : weapon.data.img,
            weaponName : weapon.data.name,
            weaponNotes : weapon.data.data.notes,
            targetName : currentTarget.data.name,
            isRangeAttack : attackSkillName == "Shooting",
            ammoUsed : ammoUsed,
            bennieUsed : bennieUsed == undefined ? 0 : bennieUsed,
            abilitites : skillModPool.filter((el) => el.abilitie == 1).map((el) => el.title).join(", "),
            difficulty : attackSkillName == "Shooting" ? "4" : currentTarget.data.data.stats.parry.value,
            modTitle : skillModPool.filter((el) => el.value != 0).map((el) => el.title + " : " + el.value).join("\n"),
            modValue : totalMod,
            isHit : successResultPool.length > 0 && !criticalFailure,
            isCriticalFailure : criticalFailure,
            isNotCriticalFailure : !criticalFailure,
            diceResultPool : diceResultPool
        });

        // Apply bennie button and listener to chatTemplate if not critical failure
        if (!criticalFailure) {
            addEventListenerOnHtmlElement("#reRollButton", 'click', (e) => { 
                e.target.style.display = "none"; 
                params.bennieUsed = true;
                commitAttack(params);
            }); 
        }
        
        // Apply damage button and listener to chatTemplate if 1+ success
        if (successResultPool.length > 0) {
            // Add event to chat message html element
            addEventListenerOnHtmlElement("#callDamageButton", 'click', (e) => { 
                damageSettings({weapon, successResultPool, attackSkillName, doubleTapEdge, threeRoundBurstAbility}, e.target);
            }); 
        }

        // Remove ammo from weapon
        if (attackSkillName == "Shooting" && trackAmmo) {
            let newShots = (weapon.data.data.shots -= ammoUsed);
            weapon.update({ "data.shots": newShots });
        };

        // Displat chat template
        // Check can use "So Nice Dices" mod effects
        game.dice3d === undefined ? printMessage(chatMessage) : game.dice3d.showForRoll(diceResultPool.map((el) => el.roll)).then(displayed => {
            
            printMessage(chatMessage);
        });   
    }
}// end commitAttack

// Calcul and display damages
async function damageResult(params) //weapon, successResultPool, attackSkillName)
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
        { value : [ 2 ], injury : i18n("swadeMacro.damageResultChat.unmentionables"), subInjury : undefined },
        { value : [ 3, 4 ], injury : i18n("swadeMacro.damageResultChat.arm"), subInjury : undefined },
        { value : [ 5, 6, 7, 8, 9 ], injury : i18n("swadeMacro.damageResultChat.guts"), subInjury : [
            { value : [ 1, 2 ], injury : i18n("swadeMacro.damageResultChat.broken") },
            { value : [ 3, 4 ], injury : i18n("swadeMacro.damageResultChat.battered") },
            { value : [ 5, 6 ], injury : i18n("swadeMacro.damageResultChat.busted") }
        ]},
        { value : [ 10, 11 ], injury : i18n("swadeMacro.damageResultChat.leg"), subInjury : undefined },
        { value : [ 12 ], injury : i18n("swadeMacro.damageResultChat.head"), subInjury : [
            { value : [ 1, 2, 3 ], injury : i18n("swadeMacro.damageResultChat.hideousScar") },
            { value : [ 4, 5 ], injury : i18n("swadeMacro.damageResultChat.blinded") },
            { value : [ 6 ], injury : i18n("swadeMacro.damageResultChat.brainDamage") }
        ]}
    ];

    console.log(criticalInjury);

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
    if (doubleTapEdge) damageModPool.push({ mod : "doubleTap", title : i18n("swadeMacro.damageResultChat.doubleTap"), abilitie : 0, value : 1});
    if (threeRoundBurstAbility) damageModPool.push({ mod : "threeRoundBurst", title : i18n("swadeMacro.damageResultChat.threeRoundBurst"), abilitie : 0, value : 1});
    damageModPool.push({ mod : "otherMod", title : i18n("swadeMacro.damageResultChat.otherMods"), abilitie : 0, value : html.find("#damageMod")[0] === undefined ? 0 : parseInt(html.find("#damageMod")[0].value)});

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
        weaponDamage += (successResultPool[i] == i18n("swadeMacro.commitAttackChat.raise") ? " + 1d6" : "")
        weaponDamage += " + " + totalDamageMod;

        // Explode all dices
        let regexDiceExplode = /d[0-9]{1,2}/g;
        weaponDamage = weaponDamage.replace(regexDiceExplode, "$&x=");

        // Roll dices damages
        diceResultPool.push({ type: "damageRoll", roll : new Roll(weaponDamage).roll(), raise : successResultPool[i] == i18n("swadeMacro.commitAttackChat.raise") ? 1 : 0});
    }

    // Prepare template
    //let displayRollResultTemplate = ``;
    let targetShaken = currentTarget.data.data.status.isShaken;

    // Get armor equipped
    let armorToughness = 0;
    if (!ignoreAmor) currentTarget.items.filter((el) => el.data.type == "armor" && el.data.data.equipped).forEach((el) => armorToughness += parseInt(el.data.data.armor));

    // Create roll result template
    diceResultPool.forEach((el) => {

        el.rollBgColor = el.raise ? "background-color: rgb(0, 200, 0, 0.35);" : "";
        el.rollTitle = el.roll.formula + "\n" + el.roll.result;

        // Calcul total toughness
        let totalToughness = (parseInt(currentTarget.data.data.stats.toughness.value) 
                            + (parseInt(weapon.data.data.ap) > (parseInt(armorToughness) + parseInt(coverBonus)) ? 0 : (parseInt(armorToughness) + parseInt(coverBonus)) - parseInt(weapon.data.data.ap))
                            + parseInt(currentTarget.data.data.stats.toughness.modifier));

        el.toughness = totalToughness;
        el.toughnessPassed = el.roll.total >= totalToughness;
        el.toughnessNotPassed = !el.toughnessPassed;
        
        // Check if roll is better that toughness
        if (el.roll.total >= totalToughness) {
    
            // Calcul wounds
            let wounds = Math.floor(((el.roll.total - totalToughness) / 4)) + (targetShaken ? 1 : 0);

            el.wounds = wounds;
            el.isShaken = targetShaken;
            el.isNotShaken = !targetShaken;
            
            el.wounded = wounds > 0;
            if (wounds > 0)
            {
                el.woundRank = (totalToughness + (wounds * 4));
                el.isGrettyDamage = isGrettyDamage && ((targetShaken && wounds > 1) || !targetShaken);

                if (isGrettyDamage && ((targetShaken && wounds > 1) || !targetShaken)) {

                    let roll1 =new Roll("2d6").roll().total;
                    let roll2 =new Roll("1d6").roll().total;
                    
                    let injury = criticalInjury.find((el) => el.value.includes(roll1));
                    let subInjury =  injury.subInjury != undefined ? injury.subInjury.find((el) => el.value.includes(roll2)) : undefined;

                    el.grittyDamageTitle = roll1 + " " + (injury.subInjury != undefined ? "-> " + roll2 : "");
                    el.grittyDamageValue = subInjury == undefined ? injury.injury : subInjury.injury;
                }
            }
            
            targetShaken = true;
        }

    });

    console.log({
        weaponImg : weapon.data.img,
        weaponName : weapon.data.name,
        weaponAp : weapon.data.data.ap,
        targetName : currentTarget.data.name,
        toughnessValue : currentTarget.data.data.stats.toughness.value,
        bennieUsed : bennieUsed == undefined ? 0 : bennieUsed,
        armorTitle : "armor : " + armorToughness + "\n" + "cover : " + coverBonus,
        armorValue : armorToughness + parseInt(coverBonus),
        damageModTitle : damageModPool.map((el) => el.title + " : " + el.value).join("\n"),
        damageModValue : totalDamageMod,
        diceResultPool : diceResultPool
    });

    let chatMessage = await renderTemplate("modules/swade-macros-simple-localization/templates/chat-damage-result.html",{
        weaponImg : weapon.data.img,
        weaponName : weapon.data.name,
        weaponAp : weapon.data.data.ap,
        targetName : currentTarget.data.name,
        toughnessValue : currentTarget.data.data.stats.toughness.value,
        bennieUsed : bennieUsed == undefined ? 0 : bennieUsed,
        armorTitle : "armor : " + armorToughness + "\n" + "cover : " + coverBonus,
        armorValue : armorToughness + parseInt(coverBonus),
        damageModTitle : damageModPool.map((el) => el.title + " : " + el.value).join("\n"),
        damageModValue : totalDamageMod,
        diceResultPool : diceResultPool
    });

    // Add event to chat message html element
    addEventListenerOnHtmlElement("#reRollButton", 'click', (e) => { 
        e.target.style.display = "none"; 
        params.bennieUsed = true;
        damageResult(params);
    }); 

    // Displat chat template
    // Check can use "So Nice Dices" mod effects
    game.dice3d === undefined ? printMessage(chatMessage) : game.dice3d.showForRoll(diceResultPool.map((el) => el.roll)).then(displayed => {
        printMessage(chatMessage);
    });

} // end damageCalculation