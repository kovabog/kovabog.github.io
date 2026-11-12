/* Every easter egg on the page: id -> what the dog says when it is found for the first time.
   The footer counter uses the number of entries as the total. Where each one is triggered:
     konami     Konami code on the keyboard                       features/konami
     bubbles    pop 10 bubbles                                    stage/droplets
     gem        double-click / double-tap the diamond             stage/interaction
     matrix     triple-click ".NET" or "C#" in the text           features/matrix-rain
     machine    "Run tests" until one fails on "my machine"       features/tdd-demo
     goodboy    pet (click) the dog sitting on the Dog owner tile features/good-boy
     devmode    click the "BK" logo 5 times within 3 seconds      features/dev-mode
     speedo     click the "9" in the Numbers section              features/speedometer
     overdrive  spin the diamond ~3 full turns within 2 seconds   stage/overdrive
     pile       drag bubbles and drop 3 of them into a pile       stage/bubble-pile
     rubber     keep scrolling past the very bottom of the page   features/rubber-band
*/
export var EGGS = {
  konami: 'Woof! The Konami code? Respect.',
  bubbles: 'Woof! 10 bubbles. I’d have popped 11.',
  gem: 'Woof! Careful, that diamond is real.',
  matrix: 'Woof! There is no spoon. There is a bowl, though.',
  machine: 'Woof! Then we ship your machine.',
  goodboy: 'Woof! Yes I am. Who’s a good boy? Me.',
  devmode: 'Woof! Dev mode. Please don’t refactor me.',
  speedo: 'Woof! 0 to 9 years in 1.6 seconds.',
  overdrive: 'Woof! You broke the diamond. It’s fine, it’s immutable.',
  pile: 'Woof! A stack of bubbles. Last in, first popped.',
  rubber: 'Woof! Nothing below. Even I checked.'
};

/* Eggs that react again (toast + dog) when re-triggered. The others re-trigger silently, because they are easy to repeat. */
export var REPEAT_REACT = { konami: 1, gem: 1 };
