/* Renders each technology SVG onto a rounded glass tile and turns it into a three.js texture. */
import { ORBIT } from '../data/orbit-icons.js';

function badgeTexture(THREE, svgStr) {
    return new Promise(function(res){
      var img=new Image();
      img.onload=function(){
        var s=256,c=document.createElement('canvas');c.width=c.height=s;var g=c.getContext('2d');
        function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();}
        g.shadowColor='rgba(20,48,47,.28)';g.shadowBlur=26;g.shadowOffsetY=10;
        rr(22,18,s-44,s-44,56);var gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,'rgba(255,255,255,.98)');gr.addColorStop(1,'rgba(232,242,242,.94)');g.fillStyle=gr;g.fill();
        g.shadowColor='transparent';g.lineWidth=2;g.strokeStyle='rgba(255,255,255,.9)';g.stroke();
        g.drawImage(img,s/2-70,s/2-82,140,140);
        var t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;res(t);
      };
      img.onerror=function(){res(null);};
      img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgStr);
    });
}

/* Resolves to an array of textures in the same order as `order` (null where an SVG failed to load). */
export function loadBadgeTextures(THREE, order) {
  return Promise.all(order.map(function (k) { return badgeTexture(THREE, ORBIT[k]); }));
}
