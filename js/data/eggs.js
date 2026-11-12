/* Every easter egg on the page: id -> what the dog says when it is found for the first time.
   The footer counter uses the number of entries as the total. Where each one is triggered:
     bubbles    pop 10 bubbles (every 10th pop also starts a foam party) stage/droplets
     gem        double-click / double-tap the diamond             stage/interaction
     matrix     triple-click ".NET" or "C#" in the text           features/matrix-rain
     machine    "Run tests" until one fails on "my machine"       features/tdd-demo
     goodboy    pet (click) the dog sitting on the Dog owner tile features/good-boy
     devmode    click the "BK" logo 5 times within 3 seconds      features/dev-mode
     speedo     click the "9" in the Impact section             features/speedometer
     overdrive  spin the diamond ~3 full turns within 2 seconds   stage/overdrive
     pile       drag bubbles and drop 3 of them into a pile       stage/bubble-pile
     rubber     keep scrolling past the very bottom of the page   features/rubber-band
     dogclick   click the big dog while it is on screen            features/dog
   gem, bubbles, pile and overdrive need WebGL (GL_EGGS below). HINTS (below) holds one nudge per egg for the hint button in the nav (features/egg-hint).
*/
export var EGGS = {
  bubbles: 'Woof! 10 bubbles. I’d have popped 11.',
  gem: 'Woof! Careful, that diamond is real.',
  matrix: 'Woof! There is no spoon. There is a bowl, though.',
  machine: 'Woof! Then we ship your machine.',
  goodboy: 'Woof! Yes I am. Who’s a good boy? Me.',
  devmode: 'Woof! Dev mode. Please don’t refactor me.',
  speedo: 'Woof! 0 to 9 years in 1.6 seconds.',
  overdrive: 'Woof! You broke the diamond. It’s fine, it’s immutable.',
  pile: 'Woof! A stack of bubbles. Last in, first popped.',
  rubber: 'Woof! Nothing below. Even I checked.',
  dogclick: 'Woof! Caught me. Most people only watch.'
};

/* Eggs that live in the WebGL scene. Without WebGL (html.no-gl) they cannot be triggered, so the footer total and the
   hint button leave them out. */
var GL_EGGS = { gem: 1, bubbles: 1, pile: 1, overdrive: 1 };

/* Ids of the eggs a visitor can find; noGl = the page runs without WebGL. */
export function availableEggs(noGl) {
  return Object.keys(EGGS).filter(function (id) { return !(noGl && GL_EGGS[id]); });
}

/* localStorage key of the found-eggs list (written by features/easter-eggs, read by features/egg-hint). */
export var EGG_KEY = 'bk-eggs';

/* Hint button: one nudge per egg, same ids as EGGS. Only eggs that are not found yet are hinted at. */
export var HINTS = {
  gem: 'The diamond likes attention. Double-click it (double-tap on a phone).',
  bubbles: 'The glass bubbles are not just decoration. Pop ten of them.',
  pile: 'Drag a bubble instead of popping it. Drop a few close together.',
  overdrive: 'Grab the diamond and spin it. Faster. Much faster.',
  matrix: 'Triple-click any .NET or C# you can see: a word or an icon, anywhere on the page.',
  machine: 'In the Craft section the tests pass on their own. Press “Run again” once.',
  goodboy: 'Somebody sits on the “Dog owner” tile in the Human section. Pet him.',
  dogclick: 'Click the big dog while he is on screen. He shows up in the Human section.',
  speedo: 'In Impact, one of the digits wants to be revved. Click it.',
  devmode: 'The BK logo in the menu has a secret. Click it five times, fast.',
  rubber: 'Scroll to the very bottom of the page. Then keep scrolling.'
};

/* Eggs that react again (toast + dog) when re-triggered. The others re-trigger silently, because they are easy to repeat. */
export var REPEAT_REACT = { gem: 1 };

/* The only eggs the dog reacts to (jumps in and barks). The others just get the toast and the chime. */
export var DOG_REACT = { goodboy: 1, machine: 1 };
