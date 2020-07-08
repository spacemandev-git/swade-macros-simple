# SWADE Macros Simple
A set of useful macros for the SWADE system. Growing list, currently:
### Shooting Roll
Automatically pulls ranged weapons from token, allows you to input modifiers like range, recoil, etc, spits out rolls to Chat and auto reduces ammo.
### Damage Roll 
Auto calculated damage based on target toughness. To use it, select your token, then TARGET another token. It'll pull the armor and toughness values from the targetted token and print any notes the target armor has.
### Fighting Roll
Auto calcuates your Fighting die vs Target's parry including any shields they might have.
### Combat Flow
A full combat sequence between a actor and this target. Select attack type, weapons and set your mod for a automated rolls and calculated results, from attack to damage. You can reroll with Bennies and set some settings for damage rolls
This module will use Dice So Nice if that's installed.

###### Localization support
- English
- French
- Deutsch
##### Documentation
###### use of macro
<table>
    <tr style="border: none;">
    	<td style="border: none; width: 150px">First step</td>
        <td style="border: none"><img src="https://drive.google.com/uc?export=view&id=1deev5bmowE5Winy3n8Dm4mM-EfovGXW9"/></td>
        <td style="border: none">
        	When you trigger macro you need to choose your attack type
        </td>
    </tr>
    <tr style="border: none;">
    	<td style="border: none; width: 150px">Melee dialog</td>
        <td style="border: none"><img src="https://drive.google.com/uc?export=view&id=1mJAtc3J7IbK5yLScI5nAEY0w7ewt0GDV"/></td>
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
        <td style="border: none"><img src="https://drive.google.com/uc?export=view&id=1aaGlNxuzpQcm8n_F2Dgtm2deVc1P361p"/></td>
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
        <td style="border: none"><img src="https://drive.google.com/uc?export=view&id=1A3IES-1QWcpVNj3kupDQzo0QvKXjHpku"/></td>
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
        <td style="border: none"><img src="https://drive.google.com/uc?export=view&id=1v16T4_lb9gcvwd0mA1Z00ahut36EvqE7"/></td>
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
    	<td style="border: none; width: 150px">Damage settings</td>
        <td style="border: none"><img src="https://drive.google.com/uc?export=view&id=1eZhzda_tJAoy6mrD8YkbvXfkMfQLrNg3"/></td>
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
- **Shooting skill name** : Define the name of shooting skill ()
- **Fighting skill name** : Define the name of fighting skill ()
- **Track ammo consumption** : Define if you want track ammo consumption during range attack
- **Gritty damage** : Define if you want apply gritty damage to all damage result
