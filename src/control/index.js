import store from '../store';
import todo from './todo';

// WASD uses the same actions as the original arrow keys.
// W: rotate (former Up), A: left, S: down, D: right.
// Sound moves from S to M to avoid a keyboard shortcut conflict.
const keyboard = {
  87: 'rotate', // W
  65: 'left',   // A
  83: 'down',   // S
  68: 'right',  // D
  32: 'space',  // Space: hard drop
  77: 's',      // M: sound
  82: 'r',      // R: restart
  80: 'p',      // P: pause
};

let keydownActive;

const boardKeys = Object.keys(keyboard).map(e => parseInt(e, 10));

const keyDown = (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  }
  e.preventDefault();
  const type = keyboard[e.keyCode];
  if (type === keydownActive) {
    return;
  }
  keydownActive = type;
  todo[type].down(store);
};

const keyUp = (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || boardKeys.indexOf(e.keyCode) === -1) {
    return;
  }
  e.preventDefault();
  const type = keyboard[e.keyCode];
  if (type === keydownActive) {
    keydownActive = '';
  }
  todo[type].up(store);
};

document.addEventListener('keydown', keyDown, true);
document.addEventListener('keyup', keyUp, true);

