(()=>{"use strict";var e={163:(e,t,r)=>{e.exports=r.p+"aad74533c70863e5419a.png"},902:(e,t,r)=>{e.exports=r.p+"a5c11a572e6b4f458a45.png"},745:(e,t,r)=>{e.exports=r.p+"97fec048f06baef3d282.png"},426:(e,t,r)=>{e.exports=r.p+"1ef74900fa05b21736ff.png"},296:(e,t,r)=>{e.exports=r.p+"b340b67402670cf370a3.png"},790:(e,t,r)=>{e.exports=r.p+"c5acd61a762601c42272.png"},574:e=>{e.exports="// Reduce clutter/keyboard pain\r\nalias float2 = vec2<f32>;\r\nalias float3 = vec3<f32>;\r\nalias float4 = vec4<f32>;\r\n\r\nstruct VertexInput {\r\n    @location(0) position: float3,\r\n};\r\n\r\nstruct VertexOutput {\r\n    @builtin(position) position: float4,\r\n    @location(0) transformed_eye: float3,\r\n    @location(1) ray_dir: float3,\r\n};\r\n\r\nstruct ViewParams {\r\n    proj_view: mat4x4<f32>,\r\n    // Not sure on WGSL padding/alignment rules for blocks,\r\n    // just assume align/pad to vec4\r\n    eye_pos: float4,\r\n    //volume_scale: float4;\r\n};\r\n\r\n@group(0) @binding(0)\r\nvar<uniform> view_params: ViewParams;\r\n\r\n@group(0) @binding(1)\r\nvar volume: texture_3d<f32>;\r\n\r\n@group(0) @binding(2)\r\nvar colormap: texture_2d<f32>;\r\n\r\n@group(0) @binding(3)\r\nvar tex_sampler: sampler;\r\n\r\n@vertex\r\nfn vertex_main(vert: VertexInput) -> VertexOutput {\r\n    var out: VertexOutput;\r\n    var pos = vert.position;\r\n    out.position = view_params.proj_view * float4(pos, 1.0);\r\n    out.transformed_eye = view_params.eye_pos.xyz;\r\n    out.ray_dir = pos - out.transformed_eye;\r\n    return out;\r\n};\r\n\r\nfn intersect_box(orig: float3, dir: float3) -> float2 {\r\n\tvar box_min = float3(0.0);\r\n\tvar box_max = float3(1.0);\r\n\tvar inv_dir = 1.0 / dir;\r\n\tvar tmin_tmp = (box_min - orig) * inv_dir;\r\n\tvar tmax_tmp = (box_max - orig) * inv_dir;\r\n\tvar tmin = min(tmin_tmp, tmax_tmp);\r\n\tvar tmax = max(tmin_tmp, tmax_tmp);\r\n\tvar t0 = max(tmin.x, max(tmin.y, tmin.z));\r\n\tvar t1 = min(tmax.x, min(tmax.y, tmax.z));\r\n\treturn float2(t0, t1);\r\n}\r\n\r\nfn linear_to_srgb(x: f32) -> f32 {\r\n\tif (x <= 0.0031308) {\r\n\t\treturn 12.92 * x;\r\n\t}\r\n\treturn 1.055 * pow(x, 1.0 / 2.4) - 0.055;\r\n}\r\n\r\n@fragment\r\nfn fragment_main(in: VertexOutput) -> @location(0) float4 {\r\n    var ray_dir = normalize(in.ray_dir);\r\n\r\n\tvar t_hit = intersect_box(in.transformed_eye, ray_dir);\r\n\tif (t_hit.x > t_hit.y) {\r\n\t\tdiscard;\r\n\t}\r\n\tt_hit.x = max(t_hit.x, 0.0);\r\n\r\n    var color = float4(0.0);\r\n\tvar dt_vec = 1.0 / (float3(256.0) * abs(ray_dir));\r\n    var dt_scale = 1.0;\r\n\tvar dt = dt_scale * min(dt_vec.x, min(dt_vec.y, dt_vec.z));\r\n\tvar p = in.transformed_eye + t_hit.x * ray_dir;\r\n\tfor (var t = t_hit.x; t < t_hit.y; t = t + dt) {\r\n\t\tvar val = textureSampleLevel(volume, tex_sampler, p, 0.0).r;\r\n\t\tvar val_color = float4(textureSampleLevel(colormap, tex_sampler, float2(val, 0.5), 0.0).rgb, val);\r\n\t\t// Opacity correction\r\n\t\tval_color.a = 1.0 - pow(1.0 - val_color.a, dt_scale);\r\n        // WGSL can't do left hand size swizzling!?!?\r\n        // https://github.com/gpuweb/gpuweb/issues/737 \r\n        // That's ridiculous for a shader language.\r\n        var tmp = color.rgb + (1.0 - color.a) * val_color.a * val_color.xyz; \r\n\t\tcolor.r = tmp.r;\r\n\t\tcolor.g = tmp.g;\r\n\t\tcolor.b = tmp.b;\r\n\t\tcolor.a = color.a + (1.0 - color.a) * val_color.a;\r\n\t\tif (color.a >= 0.95) {\r\n\t\t\tbreak;\r\n\t\t}\r\n\t\tp = p + ray_dir * dt;\r\n\t}\r\n\r\n    color.r = linear_to_srgb(color.r);\r\n    color.g = linear_to_srgb(color.g);\r\n    color.b = linear_to_srgb(color.b);\r\n    return color;\r\n}\r\n\r\n"}},t={};function r(n){var a=t[n];if(void 0!==a)return a.exports;var i=t[n]={exports:{}};return e[n](i,i.exports,r),i.exports}r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),(()=>{var e;r.g.importScripts&&(e=r.g.location+"");var t=r.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var n=t.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),r.p=e})(),(()=>{var e="undefined"!=typeof Float32Array?Float32Array:Array;function t(){var t=new e(2);return e!=Float32Array&&(t[0]=0,t[1]=0),t}function n(e,t,r){return e[0]=t,e[1]=r,e}function a(){var t=new e(3);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function i(t,r,n){var a=new e(3);return a[0]=t,a[1]=r,a[2]=n,a}function o(e,t,r,n){return e[0]=t,e[1]=r,e[2]=n,e}function s(e,t){var r=t[0],n=t[1],a=t[2],i=r*r+n*n+a*a;return i>0&&(i=1/Math.sqrt(i)),e[0]=t[0]*i,e[1]=t[1]*i,e[2]=t[2]*i,e}function u(e,t,r){var n=t[0],a=t[1],i=t[2],o=r[0],s=r[1],u=r[2];return e[0]=a*u-i*s,e[1]=i*o-n*u,e[2]=n*s-a*o,e}Math.random,Math.PI,Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)}),t();function c(){var t=new e(4);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[3]=0),t}function l(e,t,r,n,a){return e[0]=t,e[1]=r,e[2]=n,e[3]=a,e}function v(e,t){var r=t[0],n=t[1],a=t[2],i=t[3],o=r*r+n*n+a*a+i*i;return o>0&&(o=1/Math.sqrt(o)),e[0]=r*o,e[1]=n*o,e[2]=a*o,e[3]=i*o,e}function d(e,t,r){var n=t[0],a=t[1],i=t[2],o=t[3];return e[0]=r[0]*n+r[4]*a+r[8]*i+r[12]*o,e[1]=r[1]*n+r[5]*a+r[9]*i+r[13]*o,e[2]=r[2]*n+r[6]*a+r[10]*i+r[14]*o,e[3]=r[3]*n+r[7]*a+r[11]*i+r[15]*o,e}function m(){var t=new e(4);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t[3]=1,t}a(),c();var f,p=l,h=function(e,t,r){var n=t[0],a=t[1],i=t[2],o=t[3],s=r[0],u=r[1],c=r[2],l=r[3];return e[0]=n*l+o*s+a*c-i*u,e[1]=a*l+o*u+i*s-n*c,e[2]=i*l+o*c+n*u-a*s,e[3]=o*l-n*s-a*u-i*c,e},g=v;function x(){var t=new e(16);return e!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}function w(e,t){var r=t[0],n=t[1],a=t[2],i=t[3],o=t[4],s=t[5],u=t[6],c=t[7],l=t[8],v=t[9],d=t[10],m=t[11],f=t[12],p=t[13],h=t[14],g=t[15],x=r*s-n*o,w=r*u-a*o,y=r*c-i*o,b=n*u-a*s,_=n*c-i*s,T=a*c-i*u,M=l*p-v*f,P=l*h-d*f,B=l*g-m*f,A=v*h-d*p,E=v*g-m*p,C=d*g-m*h,S=x*C-w*E+y*A+b*B-_*P+T*M;return S?(S=1/S,e[0]=(s*C-u*E+c*A)*S,e[1]=(a*E-n*C-i*A)*S,e[2]=(p*T-h*_+g*b)*S,e[3]=(d*_-v*T-m*b)*S,e[4]=(u*B-o*C-c*P)*S,e[5]=(r*C-a*B+i*P)*S,e[6]=(h*y-f*T-g*w)*S,e[7]=(l*T-d*y+m*w)*S,e[8]=(o*E-s*B+c*M)*S,e[9]=(n*B-r*E-i*M)*S,e[10]=(f*_-p*y+g*x)*S,e[11]=(v*y-l*_-m*x)*S,e[12]=(s*P-o*A-u*M)*S,e[13]=(r*A-n*P+a*M)*S,e[14]=(p*w-f*b-h*x)*S,e[15]=(l*b-v*w+d*x)*S,e):null}function y(e,t){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=t[0],e[13]=t[1],e[14]=t[2],e[15]=1,e}a(),i(1,0,0),i(0,1,0),m(),m(),f=new e(9),e!=Float32Array&&(f[1]=0,f[2]=0,f[3]=0,f[5]=0,f[6]=0,f[7]=0),f[0]=1,f[4]=1,f[8]=1;var b=function(e,t,r){var n=t[0],a=t[1],i=t[2],o=t[3],s=t[4],u=t[5],c=t[6],l=t[7],v=t[8],d=t[9],m=t[10],f=t[11],p=t[12],h=t[13],g=t[14],x=t[15],w=r[0],y=r[1],b=r[2],_=r[3];return e[0]=w*n+y*s+b*v+_*p,e[1]=w*a+y*u+b*d+_*h,e[2]=w*i+y*c+b*m+_*g,e[3]=w*o+y*l+b*f+_*x,w=r[4],y=r[5],b=r[6],_=r[7],e[4]=w*n+y*s+b*v+_*p,e[5]=w*a+y*u+b*d+_*h,e[6]=w*i+y*c+b*m+_*g,e[7]=w*o+y*l+b*f+_*x,w=r[8],y=r[9],b=r[10],_=r[11],e[8]=w*n+y*s+b*v+_*p,e[9]=w*a+y*u+b*d+_*h,e[10]=w*i+y*c+b*m+_*g,e[11]=w*o+y*l+b*f+_*x,w=r[12],y=r[13],b=r[14],_=r[15],e[12]=w*n+y*s+b*v+_*p,e[13]=w*a+y*u+b*d+_*h,e[14]=w*i+y*c+b*m+_*g,e[15]=w*o+y*l+b*f+_*x,e};function _(e){var r,n,a=(n=e,(r=e)[0]*n[0]+r[1]*n[1]);if(a<=1)return p(m(),e[0],e[1],Math.sqrt(1-a),0);var i=function(e,t){var r=t[0],n=t[1],a=r*r+n*n;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e}(t(),e);return p(m(),i[0],i[1],0,0)}function T(e,t,r){return e<t?t:e>r?r:e}class M{constructor(t,r,n,i,c){var l=o(a(),t[0],t[1],t[2]),v=o(a(),r[0],r[1],r[2]),d=o(a(),n[0],n[1],n[2]);s(d,d);var f,p,h,b,_=function(e,t,r){return e[0]=t[0]-r[0],e[1]=t[1]-r[1],e[2]=t[2]-r[2],e}(a(),v,l),T=(p=(f=_)[0],h=f[1],b=f[2],Math.hypot(p,h,b));s(_,_);var M=u(a(),_,d);s(M,M);var P=u(a(),M,_);s(P,P),u(M,_,P),s(M,M),this.zoomSpeed=i,this.invScreen=[1/c[0],1/c[1]],this.centerTranslation=y(x(),r),w(this.centerTranslation,this.centerTranslation);var B=o(a(),0,0,-1*T);this.translation=y(x(),B);var A=function(t,r,n,a,i,o,s,u,c){var l=new e(9);return l[0]=t,l[1]=r,l[2]=n,l[3]=a,l[4]=i,l[5]=o,l[6]=s,l[7]=u,l[8]=c,l}(M[0],M[1],M[2],P[0],P[1],P[2],-_[0],-_[1],-_[2]);!function(e,t){if(e===t){var r=t[1],n=t[2],a=t[5];e[1]=t[3],e[2]=t[6],e[3]=r,e[5]=t[7],e[6]=n,e[7]=a}else e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8]}(A,A),this.rotation=function(e,t){var r,n=t[0]+t[4]+t[8];if(n>0)r=Math.sqrt(n+1),e[3]=.5*r,r=.5/r,e[0]=(t[5]-t[7])*r,e[1]=(t[6]-t[2])*r,e[2]=(t[1]-t[3])*r;else{var a=0;t[4]>t[0]&&(a=1),t[8]>t[3*a+a]&&(a=2);var i=(a+1)%3,o=(a+2)%3;r=Math.sqrt(t[3*a+a]-t[3*i+i]-t[3*o+o]+1),e[a]=.5*r,r=.5/r,e[3]=(t[3*i+o]-t[3*o+i])*r,e[i]=(t[3*i+a]+t[3*a+i])*r,e[o]=(t[3*o+a]+t[3*a+o])*r}return e}(m(),A),g(this.rotation,this.rotation),this.camera=x(),this.invCamera=x(),this.updateCameraMatrix()}rotate(e,r){var a=n(t(),T(2*e[0]*this.invScreen[0]-1,-1,1),T(1-2*e[1]*this.invScreen[1],-1,1)),i=n(t(),T(2*r[0]*this.invScreen[0]-1,-1,1),T(1-2*r[1]*this.invScreen[1],-1,1)),o=_(a),s=_(i);this.rotation=h(this.rotation,o,this.rotation),this.rotation=h(this.rotation,s,this.rotation),this.updateCameraMatrix()}zoom(e){var t=o(a(),0,0,e*this.invScreen[1]*this.zoomSpeed),r=y(x(),t);this.translation=b(this.translation,r,this.translation),this.translation[14]>=-.2&&(this.translation[14]=-.2),this.updateCameraMatrix()}pan(e){var t=l(c(),e[0]*this.invScreen[0]*Math.abs(this.translation[14]),e[1]*this.invScreen[1]*Math.abs(this.translation[14]),0,0),r=d(c(),t,this.invCamera),n=y(x(),r);this.centerTranslation=b(this.centerTranslation,n,this.centerTranslation),this.updateCameraMatrix()}updateCameraMatrix(){var e=function(e,t){var r=t[0],n=t[1],a=t[2],i=t[3],o=r+r,s=n+n,u=a+a,c=r*o,l=n*o,v=n*s,d=a*o,m=a*s,f=a*u,p=i*o,h=i*s,g=i*u;return e[0]=1-v-f,e[1]=l+g,e[2]=d-h,e[3]=0,e[4]=l-g,e[5]=1-c-f,e[6]=m+p,e[7]=0,e[8]=d+h,e[9]=m-p,e[10]=1-c-v,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}(x(),this.rotation);this.camera=b(this.camera,e,this.centerTranslation),this.camera=b(this.camera,this.translation,this.camera),this.invCamera=w(this.invCamera,this.camera)}eyePos(){return[this.invCamera[12],this.invCamera[13],this.invCamera[14]]}eyeDir(){var e=l(c(),0,0,-1,0);return[(e=v(e=d(e,e,this.invCamera),e))[0],e[1],e[2]]}upDir(){var e=l(c(),0,1,0,0);return[(e=v(e=d(e,e,this.invCamera),e))[0],e[1],e[2]]}}function P(e,t){var r=[t[0]-e[0],t[1]-e[1]];return Math.sqrt(Math.pow(r[0],2)+Math.pow(r[1],2))}class B{constructor(){this.mousemove=null,this.press=null,this.wheel=null,this.twoFingerDrag=null,this.pinch=null}registerForCanvas(e){var t=null,r=this;e.addEventListener("mousemove",(function(n){n.preventDefault();var a=e.getBoundingClientRect(),i=[n.clientX-a.left,n.clientY-a.top];t?r.mousemove&&r.mousemove(t,i,n):t=[n.clientX-a.left,n.clientY-a.top],t=i})),e.addEventListener("mousedown",(function(t){t.preventDefault();var n=e.getBoundingClientRect(),a=[t.clientX-n.left,t.clientY-n.top];r.press&&r.press(a,t)})),e.addEventListener("wheel",(function(e){e.preventDefault(),r.wheel&&r.wheel(-e.deltaY)})),e.oncontextmenu=function(e){e.preventDefault()};var n={};e.addEventListener("touchstart",(function(t){var a=e.getBoundingClientRect();t.preventDefault();for(var i=0;i<t.changedTouches.length;++i){var o=t.changedTouches[i];n[o.identifier]=[o.clientX-a.left,o.clientY-a.top],1==t.changedTouches.length&&r.press&&r.press(n[o.identifier],t)}})),e.addEventListener("touchmove",(function(t){t.preventDefault();var a=e.getBoundingClientRect();if(1==Object.keys(n).length){if(r.mousemove){var i=t.changedTouches[0],o=n[i.identifier],s=[i.clientX-a.left,i.clientY-a.top];t.buttons=1,r.mousemove(o,s,t)}}else{for(var u={},c=0;c<t.changedTouches.length;++c)u[(i=t.changedTouches[c]).identifier]=[i.clientX-a.left,i.clientY-a.top];var l=[];for(i in n)i in u||(u[i]=n[i]),l.push(n[i]);var v=[];for(i in u)v.push(u[i]);var d=[vec2.set(vec2.create(),v[0][0]-l[0][0],v[0][1]-l[0][1]),vec2.set(vec2.create(),v[1][0]-l[1][0],v[1][1]-l[1][1])],m=[vec2.create(),vec2.create()];vec2.normalize(m[0],d[0]),vec2.normalize(m[1],d[1]);var f=vec2.set(vec2.create(),l[1][0]-l[0][0],l[1][1]-l[0][1]);vec2.normalize(f,f);var p=vec2.lerp(vec2.create(),d[0],d[1],.5);vec2.normalize(p,p);var h=[vec2.dot(f,m[0]),vec2.dot(f,m[1])],g=[vec2.dot(p,m[0]),vec2.dot(p,m[1])];if(r.pinch&&Math.abs(h[0])>.5&&Math.abs(h[1])>.5&&Math.sign(h[0])!=Math.sign(h[1])){var x=P(l[0],l[1]),w=P(v[0],v[1]);r.pinch(w-x)}else if(r.twoFingerDrag&&Math.abs(g[0])>.5&&Math.abs(g[1])>.5&&Math.sign(g[0])==Math.sign(g[1])){var y=vec2.lerp(vec2.create(),d[0],d[1],.5);y[1]=-y[1],r.twoFingerDrag(y)}}for(c=0;c<t.changedTouches.length;++c)i=t.changedTouches[c],n[i.identifier]=[i.clientX-a.left,i.clientY-a.top]}));var a=function(e){e.preventDefault();for(var t=0;t<e.changedTouches.length;++t){var r=e.changedTouches[t];delete n[r.identifier]}};e.addEventListener("touchcancel",a),e.addEventListener("touchend",a)}}var A=r(574),E=r(163),C=r(902),S=r(745),U=r(426),G=r(296),F=r(790);const I={Fuel:"7d87jcsh0qodk78/fuel_64x64x64_uint8.raw",Neghip:"zgocya7h33nltu9/neghip_64x64x64_uint8.raw","Hydrogen Atom":"jwbav8s3wmmxd5x/hydrogen_atom_128x128x128_uint8.raw",Bonsai:"rdnhdxmxtfxe0sa/bonsai_256x256x256_uint8.raw",Foot:"ic0mik3qv4vqacm/foot_256x256x256_uint8.raw",Skull:"5rfjobn0lvb7tmo/skull_256x256x256_uint8.raw",Aneurysm:"3ykigaiym8uiwbp/aneurism_256x256x256_uint8.raw"},R={"Cool Warm":E,"Matplotlib Plasma":C,"Matplotlib Virdis":S,Rainbow:U,"Samsel Linear Green":G,"Samsel Linear YGB 1211G":F};function L(e){var t=e.match(/.*\/(\w+)_(\d+)x(\d+)x(\d+)_(\w+)\.*/);return[parseInt(t[2]),parseInt(t[3]),parseInt(t[4])]}function z(e,t){return Math.floor((e+t-1)/t)*t}async function D(e){const t=L(e),r=t[0]*t[1]*t[2];var n=document.getElementById("loadingText"),a=document.getElementById("loadingProgressBar");n.innerHTML="Loading Volume...",a.setAttribute("style","width: 0%");var i="https://www.dl.dropboxusercontent.com/s/"+e+"?dl=1";try{for(var o=(await fetch(i)).body.getReader(),s=0,u=new Uint8Array(r);;){var{done:c,value:l}=await o.read();if(c)break;u.set(l,s);var v=(s+=l.length)/r*100;a.setAttribute("style",`width: ${v.toFixed(2)}%`)}return n.innerHTML="Volume Loaded",t[0]%256!=0?function(e,t){const r=[z(t[0],256),t[1],t[2]];var n=new Uint8Array(r[0]*r[1]*r[2]);const a=t[1]*t[2];for(var i=0;i<a;++i){var o=e.subarray(i*t[0],i*t[0]+t[0]);n.set(o,i*r[0])}return n}(u,t):u}catch(e){console.log(`Error loading volume: ${e}`),n.innerHTML="Error loading volume"}return null}async function q(e,t,r){var n=e.createTexture({size:t,format:"r8unorm",dimension:"3d",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),a=e.createBuffer({size:r.length,usage:GPUBufferUsage.COPY_SRC,mappedAtCreation:!0});new Uint8Array(a.getMappedRange()).set(r),a.unmap();var i=e.createCommandEncoder(),o={buffer:a,bytesPerRow:z(t[0],256),rowsPerImage:t[1]},s={texture:n};return i.copyBufferToTexture(o,s,t),e.queue.submit([i.finish()]),await e.queue.onSubmittedWorkDone(),n}async function V(e,t){var r=new Image;r.src=t,await r.decode();var n=await createImageBitmap(r),a=e.createTexture({size:[n.width,n.height,1],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),i={source:n},o={texture:a};return e.queue.copyExternalImageToTexture(i,o,[n.width,n.height]),await e.queue.onSubmittedWorkDone(),a}function N(e,t){for(var r in t){var n=document.createElement("option");n.value=r,n.innerHTML=r,e.appendChild(n)}}(async()=>{if(void 0===navigator.gpu)return document.getElementById("webgpu-canvas").setAttribute("style","display:none;"),void document.getElementById("no-webgpu").setAttribute("style","display:block;");var e=await navigator.gpu.requestAdapter();if(!e)return document.getElementById("webgpu-canvas").setAttribute("style","display:none;"),void document.getElementById("no-webgpu").setAttribute("style","display:block;");var t=await e.requestDevice(),r=document.getElementById("webgpu-canvas"),n=r.getContext("webgpu"),i=t.createShaderModule({code:A}),s=await i.getCompilationInfo();if(s.messages.length>0){var u=!1;console.log("Shader compilation log:");for(var c=0;c<s.messages.length;++c){var l=s.messages[c];console.log(`${l.lineNum}:${l.linePos} - ${l.message}`),u=u||"error"==l.type}if(u)return void console.log("Shader failed to compile")}const v=o(a(),.5,.5,2.5),d=o(a(),.5,.5,.5),m=o(a(),0,1,0),f=function(){for(var e=[1,1,0,0,1,0,1,1,1,0,1,1,0,0,1,0,1,0,0,0,0,1,1,0,1,0,0,1,1,1,1,0,1,0,0,1,1,0,0,0,0,0],t=[],r=0;r<e.length;++r)t.push(r);return{vertices:e,indices:t}}();var p=t.createBuffer({size:4*f.vertices.length,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});new Float32Array(p.getMappedRange()).set(f.vertices),p.unmap();var h=t.createBuffer({size:4*f.indices.length,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0});new Uint16Array(h.getMappedRange()).set(f.indices),h.unmap();var g=t.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),w=t.createSampler({magFilter:"linear",minFilter:"linear"}),y=document.getElementById("volumeList"),_=document.getElementById("colormapList");N(y,I),N(_,R);var T="Bonsai";if(window.location.hash){var P=decodeURI(window.location.hash.substring(1));if(!(P in I))return void alert(`Linked to invalid data set ${P}`);y.value=P,T=P}var E="Cool Warm",C=await V(t,R[E]),S=L(I[T]),U=await D(I[T]).then((e=>q(t,S,e))),G="bgra8unorm";n.configure({device:t,format:G,usage:GPUTextureUsage.OUTPUT_ATTACHMENT,alphaMode:"premultiplied"});var F=t.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{viewDimension:"3d"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{viewDimension:"2d"}},{binding:3,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}}]}),z=t.createPipelineLayout({bindGroupLayouts:[F]}),k={module:i,entryPoint:"vertex_main",buffers:[{arrayStride:12,attributes:[{format:"float32x3",offset:0,shaderLocation:0}]}]},O={module:i,entryPoint:"fragment_main",targets:[{format:G,blend:{color:{srcFactor:"one",dstFactor:"one-minus-src-alpha"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha"}}}]},Y=t.createRenderPipeline({layout:z,vertex:k,fragment:O,primitive:{topology:"triangle-strip",stripIndexFormat:"uint16",cullMode:"front"}}),X={colorAttachments:[{view:void 0,loadOp:"clear",clearValue:[.3,.3,.3,1],storeOp:"store"}]},j=new M(v,d,m,2,[r.width,r.height]),$=function(e,t,r,n,a){var i,o=1/Math.tan(t/2);return e[0]=o/r,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=o,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i=1/-99.9,e[10]=100.1*i,e[14]=20*i,e}(x(),50*Math.PI/180,r.width/r.height),W=x(),H=new B;H.mousemove=function(e,t,r){1==r.buttons?j.rotate(e,t):2==r.buttons&&j.pan([t[0]-e[0],e[1]-t[1]])},H.wheel=function(e){j.zoom(e)},H.pinch=H.wheel,H.twoFingerDrag=function(e){j.pan(e)},H.registerForCanvas(r);var J=function(){var e=null,t=new Promise((t=>e=t));return window.requestAnimationFrame(e),t};requestAnimationFrame(J);for(var K=[{binding:0,resource:{buffer:g}},{binding:1,resource:U.createView()},{binding:2,resource:C.createView()},{binding:3,resource:w}],Q=t.createBindGroup({layout:F,entries:K}),Z=t.createBuffer({size:80,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC,mappedAtCreation:!1});;)if(await J(),!document.hidden){T!=y.value&&(T=y.value,history.replaceState(history.state,"","#"+T),S=L(I[T]),U=await D(I[T]).then((e=>q(t,S,e))),K[1].resource=U.createView(),Q=t.createBindGroup({layout:F,entries:K})),E!=_.value&&(E=_.value,C=await V(t,R[E]),K[2].resource=C.createView(),Q=t.createBindGroup({layout:F,entries:K})),W=b(W,$,j.camera),await Z.mapAsync(GPUMapMode.WRITE);var ee=j.eyePos(),te=new Float32Array(Z.getMappedRange());te.set(W),te.set(ee,W.length),Z.unmap();var re=t.createCommandEncoder();re.copyBufferToBuffer(Z,0,g,0,80),X.colorAttachments[0].view=n.getCurrentTexture().createView();var ne=re.beginRenderPass(X);ne.setPipeline(Y),ne.setBindGroup(0,Q),ne.setVertexBuffer(0,p),ne.setIndexBuffer(h,"uint16"),ne.draw(f.vertices.length/3,1,0,0),ne.end(),t.queue.submit([re.finish()])}})()})()})();