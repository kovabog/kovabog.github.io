/* Hovering/focusing a technology icon on the page lights up the matching badge orbiting the 3D diamond. */
import { emit } from '../core/events.js';

/* icon id (from the SVG sprite) -> orbit badge key */
var ORBIT_KEY = {
  csharp: 'csharp', dotnet: 'csharp', gql: 'csharp',
  azure: 'azure', ado: 'azure', docker: 'azure', tf: 'azure', cicd: 'azure',
  sql: 'sql', pg: 'sql', mongo: 'sql', ix: 'sql',
  angular: 'angular', ts: 'angular',
  react: 'react', redux: 'react',
  ai: 'ai', cursor: 'ai', copilot: 'ai'
};

export function initOrbitLinks() {
  var offTimer = null;

  document.querySelectorAll('.lg,.iconrow span,.techrow span,.tool').forEach(function (el) {
    var use = el.querySelector('use');
    if (!use) return;
    var iconId = (use.getAttribute('href') || '').split('#i-')[1];
    var key = ORBIT_KEY[iconId];
    if (!key) return;

    el.classList.add('orb');
    function on() { clearTimeout(offTimer); emit('orbit:highlight', key); }
    function off(e) {
      var delay = e && e.pointerType === 'touch' ? 1600 : 0;
      clearTimeout(offTimer);
      offTimer = setTimeout(function () { emit('orbit:highlight', null); }, delay);
    }
    el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off);
    el.addEventListener('focus', on); el.addEventListener('blur', off);
  });
}
