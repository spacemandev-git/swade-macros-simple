# SWADE Macros Simple
A set of useful macros for the SWADE system. Growing list, currently:
### Card Draw Macro (Spacemandev)
Draws random cards as tiles on top of the page.

### Adventure Card Macro (lipefl)
Macro for giving adventure cards to characters with a prompt similar to Roll20 (you'll need a rollable table with the cards and a item to hold the cards)
Mini Tutorial
1 - Import the cards to a rollable table (i recommend Card Deck Importer - follow the instructions there). Name the rollable table AdventureDeck or change below.
2 - Create an item (gear) named Adventure Card. Give it to the characters that will use it.
3 - Run the macro.

### Combat Flow (Nnayl)
A full combat sequence between a actor and this target. Select attack type, weapons and set your mod for a automated rolls and calculated results, from attack to damage. You can reroll with Bennies and set some settings for damage rolls. This module will use Dice So Nice if that's installed.

###### Localization support
- English
- French
- Deutsch
- Portugues
##### Documentation
###### use of macro
<table>
    <tr style="border: none;">
    	<td style="border: none; width: 150px">First step</td>
        <td style="border: none"><img src="https://i.ibb.co/ynVv7DW/step-1.jpg"/></td>
        <td style="border: none">
        	When you trigger macro you need to choose your attack type
        </td>
    </tr>
    <tr style="border: none;">
    	<td style="border: none; width: 150px">Melee dialog</td>
        <td style="border: none"><img src="https://i.ibb.co/0fhhX79/step-2-a.jpg"/></td>
        <td style="border: none">
        	During melee attack, you need to set some settings <br>
            <ul>
            <li>Select a equiped melee weapon</li>
            <li>Select the target cover</li>
            <li>set some other modficications</li>
            </ul>
            Note : modifications from status and scale size are automated
        </td>
    </tr>
     <tr style="border: none;">
    	<td style="border: none; width: 150px">Range dialog</td>
        <td style="border: none"><img src="https://i.ibb.co/WDm72Nz/step-2-b.jpg"/></td>
        <td style="border: none">
        	During range attack, you need to set some settings <br>
            <ul>
            <li>Select a equiped range weapon</li>
            <li>Select the target range</li>
            <li>Select the target cover</li>
            <li>Select your rate of fire. You cant take a RoF upper to your RoF weapon</li>
            <li>Set some other modficications</li>
            <li>Choose to set recoil penality</li>
            <li>Choose to set unstable penality</li>
            <li>Choose if you use double tap edge</li>
            <li>Choose if you use three round burst weapon ability</li>
            <li>Choose if you want track your ammo consumption. This setting can be default set in module option settings</li>
            </ul>
            Note : modifications from status and scale size are automated
        </td>
    </tr>
    <tr style="border: none;">
    	<td style="border: none; width: 150px">Rolls result</td>
        <td style="border: none"><img src="https://i.ibb.co/kSmf3vJ/step-3.jpg"/></td>
        <td style="border: none">
        	When you confirm a attack dialog, the result of rolls showing in Chat, the Chat message contains
            <ul>
            <li>A ambiance message whith weapon picture, name of target and weapon used</li>
            <li>The notes of weapon used</li>
            <li>All abilities choosen in attack dialog</li>
            <li>The difficulty roll and total modifications (you can see details of it when your mouse hover label)</li>
            <li>Rolls result, golden background is wild dice</li>
            <li>Interpreted result, green for a hit, blue for a raise, red for a miss. When your mouse hover label, you can see the calculated value result</li>
            <li>A button to reroll with a bennie</li>
            <li>Apply damage. You can apply damage only if you get one or more Hit or Raise.</li>
            </ul>
                Note : if you do a critical fail, you don't see any button
        </td>
    </tr>
     <tr style="border: none;">
    	<td style="border: none; width: 150px">Damage settings</td>
        <td style="border: none"><img src="https://i.ibb.co/tp6h7QT/step-4.jpg"/></td>
        <td style="border: none">
        	When you apply damage from rolls result, you can apply settings to damage roll<br>
            <ul>
            <li>Select armor bonus from obstacle</li>
            <li>Set some other modifications to damage value</li>
            <li>Choose if you want ignore target armor (Obstacle armor is not include)</li>
            <li>Choose if you want apply optional rule "gritty damage". This setting can be default set in module option settings</li>
            </ul>
            Note : bonus from Double Tap edge and Three Round Burst are automated
        </td>
    </tr>
         <tr style="border: none;">
    	<td style="border: none; width: 150px">Damage Result</td>
        <td style="border: none"><img src="https://i.ibb.co/0QXkRmx/step-5.jpg"/></td>
        <td style="border: none">
        	When you confirm damage dialog, the result of rolls showing in Chat, the Chat message contains
            <ul>
            <li>A ambiance message whith weapon picture, name of target and weapon used</li>
            <li>The weapon AP, armor target (you can see details of it when your mouse hover label)</li>
            <li>The toughness value of target and damage modifications (you can see details of it when your mouse hover label)</li>
            <li>Rolls result with interpretation</li>
            <ul>
            <li>Dices result (green background when attack is a raise result)</li>
            <li>Shaken status if not yet (golden background)</li>
            <li>Number of wounds (red background)</li>
            <li>Gritty Damage result (gray background)</li>
            <li>No damage result if roll dont pass toughness (blue background)</li>
            </ul>
            <li>A button to reroll with a bennie</li>
            </ul>
        </td>
    </tr>
</table>

###### module settings
You can set some default values from module settings
- **Shooting skill name** : Define the name of shooting skill
- **Fighting skill name** : Define the name of fighting skill
- **Track ammo consumption** : Define if you want track ammo consumption during range attack
- **Gritty damage** : Define if you want apply gritty damage to all damage result
