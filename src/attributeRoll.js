let selected = canvas.tokens.controlled[0].actor;
let rollString = `{1d${
  selected.data.data.attributes["agility"].die.sides
}x=, 1d6x=}kh +${selected.calcWoundFatigePenalties()} +${selected.calcStatusPenalties()}`;
//console.log(rollString);
new Roll(rollString).roll().toMessage();
