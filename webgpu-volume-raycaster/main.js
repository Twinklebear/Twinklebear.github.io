(()=>{"use strict";var t={163:(t,e,r)=>{t.exports=r.p+"aad74533c70863e5419a.png"},902:(t,e,r)=>{t.exports=r.p+"a5c11a572e6b4f458a45.png"},745:(t,e,r)=>{t.exports=r.p+"97fec048f06baef3d282.png"},426:(t,e,r)=>{t.exports=r.p+"1ef74900fa05b21736ff.png"},296:(t,e,r)=>{t.exports=r.p+"b340b67402670cf370a3.png"},790:(t,e,r)=>{t.exports=r.p+"c5acd61a762601c42272.png"},574:t=>{t.exports="// Reduce clutter/keyboard pain\r\ntype float2 = vec2<f32>;\r\ntype float3 = vec3<f32>;\r\ntype float4 = vec4<f32>;\r\n\r\nstruct VertexInput {\r\n    [[location(0)]] position: float3;\r\n};\r\n\r\nstruct VertexOutput {\r\n    [[builtin(position)]] position: float4;\r\n    [[location(0)]] transformed_eye: float3;\r\n    [[location(1)]] ray_dir: float3;\r\n};\r\n\r\n[[block]]\r\nstruct ViewParams {\r\n    proj_view: mat4x4<f32>;\r\n    // Not sure on WGSL padding/alignment rules for blocks,\r\n    // just assume align/pad to vec4\r\n    eye_pos: float4;\r\n    //volume_scale: float4;\r\n};\r\n\r\n[[group(0), binding(0)]]\r\nvar<uniform> view_params: ViewParams;\r\n\r\n[[group(0), binding(1)]]\r\nvar volume: texture_3d<f32>;\r\n\r\n[[group(0), binding(2)]]\r\nvar colormap: texture_2d<f32>;\r\n\r\n[[group(0), binding(3)]]\r\nvar tex_sampler: sampler;\r\n\r\n[[stage(vertex)]]\r\nfn vertex_main(vert: VertexInput) -> VertexOutput {\r\n    var out: VertexOutput;\r\n    var pos = vert.position;\r\n    out.position = view_params.proj_view * float4(pos, 1.0);\r\n    out.transformed_eye = view_params.eye_pos.xyz;\r\n    out.ray_dir = pos - out.transformed_eye;\r\n    return out;\r\n};\r\n\r\nfn intersect_box(orig: float3, dir: float3) -> float2 {\r\n\tvar box_min = float3(0.0);\r\n\tvar box_max = float3(1.0);\r\n\tvar inv_dir = 1.0 / dir;\r\n\tvar tmin_tmp = (box_min - orig) * inv_dir;\r\n\tvar tmax_tmp = (box_max - orig) * inv_dir;\r\n\tvar tmin = min(tmin_tmp, tmax_tmp);\r\n\tvar tmax = max(tmin_tmp, tmax_tmp);\r\n\tvar t0 = max(tmin.x, max(tmin.y, tmin.z));\r\n\tvar t1 = min(tmax.x, min(tmax.y, tmax.z));\r\n\treturn float2(t0, t1);\r\n}\r\n\r\nfn linear_to_srgb(x: f32) -> f32 {\r\n\tif (x <= 0.0031308) {\r\n\t\treturn 12.92 * x;\r\n\t}\r\n\treturn 1.055 * pow(x, 1.0 / 2.4) - 0.055;\r\n}\r\n\r\n[[stage(fragment)]]\r\nfn fragment_main(in: VertexOutput) -> [[location(0)]] float4 {\r\n    var ray_dir = normalize(in.ray_dir);\r\n\r\n\tvar t_hit = intersect_box(in.transformed_eye, ray_dir);\r\n\tif (t_hit.x > t_hit.y) {\r\n\t\tdiscard;\r\n\t}\r\n\tt_hit.x = max(t_hit.x, 0.0);\r\n\r\n    var color = float4(0.0);\r\n\tvar dt_vec = 1.0 / (float3(256.0) * abs(ray_dir));\r\n    var dt_scale = 1.0;\r\n\tvar dt = dt_scale * min(dt_vec.x, min(dt_vec.y, dt_vec.z));\r\n\tvar p = in.transformed_eye + t_hit.x * ray_dir;\r\n\tfor (var t = t_hit.x; t < t_hit.y; t = t + dt) {\r\n\t\tvar val = textureSampleLevel(volume, tex_sampler, p, 0.0).r;\r\n\t\tvar val_color = float4(textureSampleLevel(colormap, tex_sampler, float2(val, 0.5), 0.0).rgb, val);\r\n\t\t// Opacity correction\r\n\t\tval_color.a = 1.0 - pow(1.0 - val_color.a, dt_scale);\r\n        // WGSL can't do left hand size swizzling!?!?\r\n        // https://github.com/gpuweb/gpuweb/issues/737 \r\n        // That's ridiculous for a shader language.\r\n        var tmp = color.rgb + (1.0 - color.a) * val_color.a * val_color.xyz; \r\n\t\tcolor.r = tmp.r;\r\n\t\tcolor.g = tmp.g;\r\n\t\tcolor.b = tmp.b;\r\n\t\tcolor.a = color.a + (1.0 - color.a) * val_color.a;\r\n\t\tif (color.a >= 0.95) {\r\n\t\t\tbreak;\r\n\t\t}\r\n\t\tp = p + ray_dir * dt;\r\n\t}\r\n\r\n    color.r = linear_to_srgb(color.r);\r\n    color.g = linear_to_srgb(color.g);\r\n    color.b = linear_to_srgb(color.b);\r\n    return color;\r\n}\r\n\r\n"}},e={};function r(n){var a=e[n];if(void 0!==a)return a.exports;var i=e[n]={exports:{}};return t[n](i,i.exports,r),i.exports}r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),(()=>{var t;r.g.importScripts&&(t=r.g.location+"");var e=r.g.document;if(!t&&e&&(e.currentScript&&(t=e.currentScript.src),!t)){var n=e.getElementsByTagName("script");n.length&&(t=n[n.length-1].src)}if(!t)throw new Error("Automatic publicPath is not supported in this browser");t=t.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),r.p=t})(),(()=>{var t="undefined"!=typeof Float32Array?Float32Array:Array;function e(){var e=new t(2);return t!=Float32Array&&(e[0]=0,e[1]=0),e}function n(t,e,r){return t[0]=e,t[1]=r,t}function a(){var e=new t(3);return t!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function i(e,r,n){var a=new t(3);return a[0]=e,a[1]=r,a[2]=n,a}function o(t,e,r,n){return t[0]=e,t[1]=r,t[2]=n,t}function s(t,e){var r=e[0],n=e[1],a=e[2],i=r*r+n*n+a*a;return i>0&&(i=1/Math.sqrt(i)),t[0]=e[0]*i,t[1]=e[1]*i,t[2]=e[2]*i,t}function u(t,e,r){var n=e[0],a=e[1],i=e[2],o=r[0],s=r[1],u=r[2];return t[0]=a*u-i*s,t[1]=i*o-n*u,t[2]=n*s-a*o,t}Math.random,Math.PI,Math.hypot||(Math.hypot=function(){for(var t=0,e=arguments.length;e--;)t+=arguments[e]*arguments[e];return Math.sqrt(t)}),e();function c(){var e=new t(4);return t!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0,e[3]=0),e}function l(t,e,r,n,a){return t[0]=e,t[1]=r,t[2]=n,t[3]=a,t}function v(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],o=r*r+n*n+a*a+i*i;return o>0&&(o=1/Math.sqrt(o)),t[0]=r*o,t[1]=n*o,t[2]=a*o,t[3]=i*o,t}function f(t,e,r){var n=e[0],a=e[1],i=e[2],o=e[3];return t[0]=r[0]*n+r[4]*a+r[8]*i+r[12]*o,t[1]=r[1]*n+r[5]*a+r[9]*i+r[13]*o,t[2]=r[2]*n+r[6]*a+r[10]*i+r[14]*o,t[3]=r[3]*n+r[7]*a+r[11]*i+r[15]*o,t}function d(){var e=new t(4);return t!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e[3]=1,e}a(),c();var m,p=l,h=function(t,e,r){var n=e[0],a=e[1],i=e[2],o=e[3],s=r[0],u=r[1],c=r[2],l=r[3];return t[0]=n*l+o*s+a*c-i*u,t[1]=a*l+o*u+i*s-n*c,t[2]=i*l+o*c+n*u-a*s,t[3]=o*l-n*s-a*u-i*c,t},g=v;function x(){var e=new t(16);return t!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function _(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],o=e[4],s=e[5],u=e[6],c=e[7],l=e[8],v=e[9],f=e[10],d=e[11],m=e[12],p=e[13],h=e[14],g=e[15],x=r*s-n*o,_=r*u-a*o,w=r*c-i*o,b=n*u-a*s,y=n*c-i*s,T=a*c-i*u,M=l*p-v*m,P=l*h-f*m,C=l*g-d*m,S=v*h-f*p,A=v*g-d*p,B=f*g-d*h,E=x*B-_*A+w*S+b*C-y*P+T*M;return E?(E=1/E,t[0]=(s*B-u*A+c*S)*E,t[1]=(a*A-n*B-i*S)*E,t[2]=(p*T-h*y+g*b)*E,t[3]=(f*y-v*T-d*b)*E,t[4]=(u*C-o*B-c*P)*E,t[5]=(r*B-a*C+i*P)*E,t[6]=(h*w-m*T-g*_)*E,t[7]=(l*T-f*w+d*_)*E,t[8]=(o*A-s*C+c*M)*E,t[9]=(n*C-r*A-i*M)*E,t[10]=(m*y-p*w+g*x)*E,t[11]=(v*w-l*y-d*x)*E,t[12]=(s*P-o*S-u*M)*E,t[13]=(r*S-n*P+a*M)*E,t[14]=(p*_-m*b-h*x)*E,t[15]=(l*b-v*_+f*x)*E,t):null}function w(t,e){return t[0]=1,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=1,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[10]=1,t[11]=0,t[12]=e[0],t[13]=e[1],t[14]=e[2],t[15]=1,t}a(),i(1,0,0),i(0,1,0),d(),d(),m=new t(9),t!=Float32Array&&(m[1]=0,m[2]=0,m[3]=0,m[5]=0,m[6]=0,m[7]=0),m[0]=1,m[4]=1,m[8]=1;var b=function(t,e,r){var n=e[0],a=e[1],i=e[2],o=e[3],s=e[4],u=e[5],c=e[6],l=e[7],v=e[8],f=e[9],d=e[10],m=e[11],p=e[12],h=e[13],g=e[14],x=e[15],_=r[0],w=r[1],b=r[2],y=r[3];return t[0]=_*n+w*s+b*v+y*p,t[1]=_*a+w*u+b*f+y*h,t[2]=_*i+w*c+b*d+y*g,t[3]=_*o+w*l+b*m+y*x,_=r[4],w=r[5],b=r[6],y=r[7],t[4]=_*n+w*s+b*v+y*p,t[5]=_*a+w*u+b*f+y*h,t[6]=_*i+w*c+b*d+y*g,t[7]=_*o+w*l+b*m+y*x,_=r[8],w=r[9],b=r[10],y=r[11],t[8]=_*n+w*s+b*v+y*p,t[9]=_*a+w*u+b*f+y*h,t[10]=_*i+w*c+b*d+y*g,t[11]=_*o+w*l+b*m+y*x,_=r[12],w=r[13],b=r[14],y=r[15],t[12]=_*n+w*s+b*v+y*p,t[13]=_*a+w*u+b*f+y*h,t[14]=_*i+w*c+b*d+y*g,t[15]=_*o+w*l+b*m+y*x,t};function y(t){var r,n,a=(n=t,(r=t)[0]*n[0]+r[1]*n[1]);if(a<=1)return p(d(),t[0],t[1],Math.sqrt(1-a),0);var i=function(t,e){var r=e[0],n=e[1],a=r*r+n*n;return a>0&&(a=1/Math.sqrt(a)),t[0]=e[0]*a,t[1]=e[1]*a,t}(e(),t);return p(d(),i[0],i[1],0,0)}function T(t,e,r){return t<e?e:t>r?r:t}class M{constructor(e,r,n,i,c){var l=o(a(),e[0],e[1],e[2]),v=o(a(),r[0],r[1],r[2]),f=o(a(),n[0],n[1],n[2]);s(f,f);var m,p,h,b,y=function(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t}(a(),v,l),T=(p=(m=y)[0],h=m[1],b=m[2],Math.hypot(p,h,b));s(y,y);var M=u(a(),y,f);s(M,M);var P=u(a(),M,y);s(P,P),u(M,y,P),s(M,M),this.zoomSpeed=i,this.invScreen=[1/c[0],1/c[1]],this.centerTranslation=w(x(),r),_(this.centerTranslation,this.centerTranslation);var C=o(a(),0,0,-1*T);this.translation=w(x(),C);var S=function(e,r,n,a,i,o,s,u,c){var l=new t(9);return l[0]=e,l[1]=r,l[2]=n,l[3]=a,l[4]=i,l[5]=o,l[6]=s,l[7]=u,l[8]=c,l}(M[0],M[1],M[2],P[0],P[1],P[2],-y[0],-y[1],-y[2]);!function(t,e){if(t===e){var r=e[1],n=e[2],a=e[5];t[1]=e[3],t[2]=e[6],t[3]=r,t[5]=e[7],t[6]=n,t[7]=a}else t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8]}(S,S),this.rotation=function(t,e){var r,n=e[0]+e[4]+e[8];if(n>0)r=Math.sqrt(n+1),t[3]=.5*r,r=.5/r,t[0]=(e[5]-e[7])*r,t[1]=(e[6]-e[2])*r,t[2]=(e[1]-e[3])*r;else{var a=0;e[4]>e[0]&&(a=1),e[8]>e[3*a+a]&&(a=2);var i=(a+1)%3,o=(a+2)%3;r=Math.sqrt(e[3*a+a]-e[3*i+i]-e[3*o+o]+1),t[a]=.5*r,r=.5/r,t[3]=(e[3*i+o]-e[3*o+i])*r,t[i]=(e[3*i+a]+e[3*a+i])*r,t[o]=(e[3*o+a]+e[3*a+o])*r}return t}(d(),S),g(this.rotation,this.rotation),this.camera=x(),this.invCamera=x(),this.updateCameraMatrix()}rotate(t,r){var a=n(e(),T(2*t[0]*this.invScreen[0]-1,-1,1),T(1-2*t[1]*this.invScreen[1],-1,1)),i=n(e(),T(2*r[0]*this.invScreen[0]-1,-1,1),T(1-2*r[1]*this.invScreen[1],-1,1)),o=y(a),s=y(i);this.rotation=h(this.rotation,o,this.rotation),this.rotation=h(this.rotation,s,this.rotation),this.updateCameraMatrix()}zoom(t){var e=o(a(),0,0,t*this.invScreen[1]*this.zoomSpeed),r=w(x(),e);this.translation=b(this.translation,r,this.translation),this.translation[14]>=-.2&&(this.translation[14]=-.2),this.updateCameraMatrix()}pan(t){var e=l(c(),t[0]*this.invScreen[0]*Math.abs(this.translation[14]),t[1]*this.invScreen[1]*Math.abs(this.translation[14]),0,0),r=f(c(),e,this.invCamera),n=w(x(),r);this.centerTranslation=b(this.centerTranslation,n,this.centerTranslation),this.updateCameraMatrix()}updateCameraMatrix(){var t=function(t,e){var r=e[0],n=e[1],a=e[2],i=e[3],o=r+r,s=n+n,u=a+a,c=r*o,l=n*o,v=n*s,f=a*o,d=a*s,m=a*u,p=i*o,h=i*s,g=i*u;return t[0]=1-v-m,t[1]=l+g,t[2]=f-h,t[3]=0,t[4]=l-g,t[5]=1-c-m,t[6]=d+p,t[7]=0,t[8]=f+h,t[9]=d-p,t[10]=1-c-v,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,t}(x(),this.rotation);this.camera=b(this.camera,t,this.centerTranslation),this.camera=b(this.camera,this.translation,this.camera),this.invCamera=_(this.invCamera,this.camera)}eyePos(){return[this.invCamera[12],this.invCamera[13],this.invCamera[14]]}eyeDir(){var t=l(c(),0,0,-1,0);return[(t=v(t=f(t,t,this.invCamera),t))[0],t[1],t[2]]}upDir(){var t=l(c(),0,1,0,0);return[(t=v(t=f(t,t,this.invCamera),t))[0],t[1],t[2]]}}function P(t,e){var r=[e[0]-t[0],e[1]-t[1]];return Math.sqrt(Math.pow(r[0],2)+Math.pow(r[1],2))}class C{constructor(){this.mousemove=null,this.press=null,this.wheel=null,this.twoFingerDrag=null,this.pinch=null}registerForCanvas(t){var e=null,r=this;t.addEventListener("mousemove",(function(n){n.preventDefault();var a=t.getBoundingClientRect(),i=[n.clientX-a.left,n.clientY-a.top];e?r.mousemove&&r.mousemove(e,i,n):e=[n.clientX-a.left,n.clientY-a.top],e=i})),t.addEventListener("mousedown",(function(e){e.preventDefault();var n=t.getBoundingClientRect(),a=[e.clientX-n.left,e.clientY-n.top];r.press&&r.press(a,e)})),t.addEventListener("wheel",(function(t){t.preventDefault(),r.wheel&&r.wheel(-t.deltaY)})),t.oncontextmenu=function(t){t.preventDefault()};var n={};t.addEventListener("touchstart",(function(e){var a=t.getBoundingClientRect();e.preventDefault();for(var i=0;i<e.changedTouches.length;++i){var o=e.changedTouches[i];n[o.identifier]=[o.clientX-a.left,o.clientY-a.top],1==e.changedTouches.length&&r.press&&r.press(n[o.identifier],e)}})),t.addEventListener("touchmove",(function(e){e.preventDefault();var a=t.getBoundingClientRect();if(1==Object.keys(n).length){if(r.mousemove){var i=e.changedTouches[0],o=n[i.identifier],s=[i.clientX-a.left,i.clientY-a.top];e.buttons=1,r.mousemove(o,s,e)}}else{for(var u={},c=0;c<e.changedTouches.length;++c)u[(i=e.changedTouches[c]).identifier]=[i.clientX-a.left,i.clientY-a.top];var l=[];for(i in n)i in u||(u[i]=n[i]),l.push(n[i]);var v=[];for(i in u)v.push(u[i]);var f=[vec2.set(vec2.create(),v[0][0]-l[0][0],v[0][1]-l[0][1]),vec2.set(vec2.create(),v[1][0]-l[1][0],v[1][1]-l[1][1])],d=[vec2.create(),vec2.create()];vec2.normalize(d[0],f[0]),vec2.normalize(d[1],f[1]);var m=vec2.set(vec2.create(),l[1][0]-l[0][0],l[1][1]-l[0][1]);vec2.normalize(m,m);var p=vec2.lerp(vec2.create(),f[0],f[1],.5);vec2.normalize(p,p);var h=[vec2.dot(m,d[0]),vec2.dot(m,d[1])],g=[vec2.dot(p,d[0]),vec2.dot(p,d[1])];if(r.pinch&&Math.abs(h[0])>.5&&Math.abs(h[1])>.5&&Math.sign(h[0])!=Math.sign(h[1])){var x=P(l[0],l[1]),_=P(v[0],v[1]);r.pinch(_-x)}else if(r.twoFingerDrag&&Math.abs(g[0])>.5&&Math.abs(g[1])>.5&&Math.sign(g[0])==Math.sign(g[1])){var w=vec2.lerp(vec2.create(),f[0],f[1],.5);w[1]=-w[1],r.twoFingerDrag(w)}}for(c=0;c<e.changedTouches.length;++c)i=e.changedTouches[c],n[i.identifier]=[i.clientX-a.left,i.clientY-a.top]}));var a=function(t){t.preventDefault();for(var e=0;e<t.changedTouches.length;++e){var r=t.changedTouches[e];delete n[r.identifier]}};t.addEventListener("touchcancel",a),t.addEventListener("touchend",a)}}var S=r(574),A=r(163),B=r(902),E=r(745),U=r(426),F=r(296),G=r(790);const z={Fuel:"7d87jcsh0qodk78/fuel_64x64x64_uint8.raw",Neghip:"zgocya7h33nltu9/neghip_64x64x64_uint8.raw","Hydrogen Atom":"jwbav8s3wmmxd5x/hydrogen_atom_128x128x128_uint8.raw","Boston Teapot":"w4y88hlf2nbduiv/boston_teapot_256x256x178_uint8.raw",Engine:"ld2sqwwd3vaq4zf/engine_256x256x128_uint8.raw",Bonsai:"rdnhdxmxtfxe0sa/bonsai_256x256x256_uint8.raw",Foot:"ic0mik3qv4vqacm/foot_256x256x256_uint8.raw",Skull:"5rfjobn0lvb7tmo/skull_256x256x256_uint8.raw",Aneurysm:"3ykigaiym8uiwbp/aneurism_256x256x256_uint8.raw"},I={"Cool Warm":A,"Matplotlib Plasma":B,"Matplotlib Virdis":E,Rainbow:U,"Samsel Linear Green":F,"Samsel Linear YGB 1211G":G};(async()=>{if(void 0===navigator.gpu)return document.getElementById("webgpu-canvas").setAttribute("style","display:none;"),void document.getElementById("no-webgpu").setAttribute("style","display:block;");var t=await navigator.gpu.requestAdapter();if(!t)return document.getElementById("webgpu-canvas").setAttribute("style","display:none;"),void document.getElementById("no-webgpu").setAttribute("style","display:block;");var e=await t.requestDevice(),r=document.getElementById("webgpu-canvas"),n=r.getContext("webgpu"),i=e.createShaderModule({code:S}),s=await i.compilationInfo();if(s.messages.length>0){var u=!1;console.log("Shader compilation log:");for(var c=0;c<s.messages.length;++c){var l=s.messages[c];console.log(`${l.lineNum}:${l.linePos} - ${l.message}`),u=u||"error"==l.type}if(u)return void console.log("Shader failed to compile")}const v=o(a(),.5,.5,2.5),f=o(a(),.5,.5,.5),d=o(a(),0,1,0),m=function(){for(var t=[1,1,0,0,1,0,1,1,1,0,1,1,0,0,1,0,1,0,0,0,0,1,1,0,1,0,0,1,1,1,1,0,1,0,0,1,1,0,0,0,0,0],e=[],r=0;r<t.length;++r)e.push(r);return{vertices:t,indices:e}}();var p=e.createBuffer({size:4*m.vertices.length,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});new Float32Array(p.getMappedRange()).set(m.vertices),p.unmap();var h=e.createBuffer({size:4*m.indices.length,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0});new Uint16Array(h.getMappedRange()).set(m.indices),h.unmap();var g=e.createBuffer({size:80,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),_=e.createSampler({magFilter:"linear",minFilter:"linear"}),w=null,y=new Image;y.src=I["Cool Warm"],await y.decode();var T=await createImageBitmap(y),P={source:T},A={texture:w=e.createTexture({size:[T.width,T.height,1],format:"rgba8unorm",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT})};e.queue.copyExternalImageToTexture(P,A,[T.width,T.height]);var B,E=(B=z.Foot.match(/.*\/(\w+)_(\d+)x(\d+)x(\d+)_(\w+)\.*/),[parseInt(B[2]),parseInt(B[3]),parseInt(B[4])]),U=e.createTexture({size:E,format:"r8unorm",dimension:"3d",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST}),F=await async function(t){var e="https://www.dl.dropboxusercontent.com/s/"+t+"?dl=1",r=await fetch(e).then((t=>t.arrayBuffer().then((function(t){return new Uint8Array(t)}))));return document.getElementById("loadingText").innerHTML=r?"Volume Loaded":"Error loading volume",r}(z.Foot),G=e.createBuffer({size:F.length,usage:GPUBufferUsage.COPY_SRC,mappedAtCreation:!0});new Uint8Array(G.getMappedRange()).set(F),G.unmap();var R=e.createCommandEncoder();P={buffer:G,bytesPerRow:E[0],rowsPerImage:E[1]},A={texture:U},R.copyBufferToTexture(P,A,E),await e.queue.submit([R.finish()]);var D="bgra8unorm";n.configure({device:e,format:D,usage:GPUTextureUsage.OUTPUT_ATTACHMENT});var q=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}},{binding:1,visibility:GPUShaderStage.FRAGMENT,texture:{viewDimension:"3d"}},{binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{viewDimension:"2d"}},{binding:3,visibility:GPUShaderStage.FRAGMENT,sampler:{type:"filtering"}}]}),L=e.createBindGroup({layout:q,entries:[{binding:0,resource:{buffer:g}},{binding:1,resource:U.createView()},{binding:2,resource:w.createView()},{binding:3,resource:_}]}),V=e.createPipelineLayout({bindGroupLayouts:[q]}),N={module:i,entryPoint:"vertex_main",buffers:[{arrayStride:12,attributes:[{format:"float32x3",offset:0,shaderLocation:0}]}]},Y={module:i,entryPoint:"fragment_main",targets:[{format:D,blend:{color:{srcFactor:"one",dstFactor:"one-minus-src-alpha"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha"}}}]},O=e.createRenderPipeline({layout:V,vertex:N,fragment:Y,primitive:{topology:"triangle-strip",stripIndexFormat:"uint16",cullMode:"front"}}),k={colorAttachments:[{view:void 0,loadValue:[.3,.3,.3,1]}]},X=new M(v,f,d,2,[r.width,r.height]),j=function(t,e,r,n,a){var i,o=1/Math.tan(e/2);return t[0]=o/r,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=o,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,i=1/-99.9,t[10]=100.1*i,t[14]=20*i,t}(x(),50*Math.PI/180,r.width/r.height),$=x(),H=new C;H.mousemove=function(t,e,r){1==r.buttons?X.rotate(t,e):2==r.buttons&&X.pan([e[0]-t[0],t[1]-e[1]])},H.wheel=function(t){X.zoom(t)},H.pinch=H.wheel,H.twoFingerDrag=function(t){X.pan(t)},H.registerForCanvas(r);var W=function(){var t=null,e=new Promise((e=>t=e));return window.requestAnimationFrame(t),e};for(requestAnimationFrame(W);;)if(await W(),!document.hidden){$=b($,j,X.camera);var J=e.createBuffer({size:80,usage:GPUBufferUsage.COPY_SRC,mappedAtCreation:!0}),K=X.eyePos(),Q=new Float32Array(J.getMappedRange());Q.set($),Q.set(K,$.length),J.unmap(),(R=e.createCommandEncoder()).copyBufferToBuffer(J,0,g,0,80),k.colorAttachments[0].view=n.getCurrentTexture().createView();var Z=R.beginRenderPass(k);Z.setPipeline(O),Z.setBindGroup(0,L),Z.setVertexBuffer(0,p),Z.setIndexBuffer(h,"uint16"),Z.draw(m.vertices.length/3,1,0,0),Z.endPass(),e.queue.submit([R.finish()]),J.destroy()}})()})()})();