(()=>{"use strict";var e={};e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),(()=>{var t;e.g.importScripts&&(t=e.g.location+"");var r=e.g.document;if(!t&&r&&(r.currentScript&&(t=r.currentScript.src),!t)){var n=r.getElementsByTagName("script");n.length&&(t=n[n.length-1].src)}if(!t)throw new Error("Automatic publicPath is not supported in this browser");t=t.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),e.p=t})();var t="undefined"!=typeof Float32Array?Float32Array:Array;function r(){var e=new t(16);return t!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function n(e,t){var r=t[0],n=t[1],i=t[2],a=t[3],s=t[4],o=t[5],u=t[6],c=t[7],h=t[8],l=t[9],d=t[10],f=t[11],v=t[12],p=t[13],g=t[14],m=t[15],w=r*o-n*s,y=r*u-i*s,b=r*c-a*s,T=n*u-i*o,E=n*c-a*o,M=i*c-a*u,A=h*p-l*v,C=h*g-d*v,B=h*m-f*v,P=l*g-d*p,x=l*m-f*p,S=d*m-f*g,U=w*S-y*x+b*P+T*B-E*C+M*A;return U?(U=1/U,e[0]=(o*S-u*x+c*P)*U,e[1]=(i*x-n*S-a*P)*U,e[2]=(p*M-g*E+m*T)*U,e[3]=(d*E-l*M-f*T)*U,e[4]=(u*B-s*S-c*C)*U,e[5]=(r*S-i*B+a*C)*U,e[6]=(g*b-v*M-m*y)*U,e[7]=(h*M-d*b+f*y)*U,e[8]=(s*x-o*B+c*A)*U,e[9]=(n*B-r*x-a*A)*U,e[10]=(v*E-p*b+m*w)*U,e[11]=(l*b-h*E-f*w)*U,e[12]=(o*C-s*P-u*A)*U,e[13]=(r*P-n*C+i*A)*U,e[14]=(p*y-v*T-g*w)*U,e[15]=(h*T-l*y+d*w)*U,e):null}function i(e,t){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=t[0],e[13]=t[1],e[14]=t[2],e[15]=1,e}Math.random,Math.PI,Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)});var a=function(e,t,r){var n=t[0],i=t[1],a=t[2],s=t[3],o=t[4],u=t[5],c=t[6],h=t[7],l=t[8],d=t[9],f=t[10],v=t[11],p=t[12],g=t[13],m=t[14],w=t[15],y=r[0],b=r[1],T=r[2],E=r[3];return e[0]=y*n+b*o+T*l+E*p,e[1]=y*i+b*u+T*d+E*g,e[2]=y*a+b*c+T*f+E*m,e[3]=y*s+b*h+T*v+E*w,y=r[4],b=r[5],T=r[6],E=r[7],e[4]=y*n+b*o+T*l+E*p,e[5]=y*i+b*u+T*d+E*g,e[6]=y*a+b*c+T*f+E*m,e[7]=y*s+b*h+T*v+E*w,y=r[8],b=r[9],T=r[10],E=r[11],e[8]=y*n+b*o+T*l+E*p,e[9]=y*i+b*u+T*d+E*g,e[10]=y*a+b*c+T*f+E*m,e[11]=y*s+b*h+T*v+E*w,y=r[12],b=r[13],T=r[14],E=r[15],e[12]=y*n+b*o+T*l+E*p,e[13]=y*i+b*u+T*d+E*g,e[14]=y*a+b*c+T*f+E*m,e[15]=y*s+b*h+T*v+E*w,e};function s(){var e=new t(2);return t!=Float32Array&&(e[0]=0,e[1]=0),e}function o(e,t,r){return e[0]=t,e[1]=r,e}function u(){var e=new t(3);return t!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function c(e,r,n){var i=new t(3);return i[0]=e,i[1]=r,i[2]=n,i}function h(e,t,r,n){return e[0]=t,e[1]=r,e[2]=n,e}function l(e,t){var r=t[0],n=t[1],i=t[2],a=r*r+n*n+i*i;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e[2]=t[2]*a,e}function d(e,t,r){var n=t[0],i=t[1],a=t[2],s=r[0],o=r[1],u=r[2];return e[0]=i*u-a*o,e[1]=a*s-n*u,e[2]=n*o-i*s,e}s();function f(){var e=new t(4);return t!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0,e[3]=0),e}function v(e,t,r,n,i){return e[0]=t,e[1]=r,e[2]=n,e[3]=i,e}function p(e,t){var r=t[0],n=t[1],i=t[2],a=t[3],s=r*r+n*n+i*i+a*a;return s>0&&(s=1/Math.sqrt(s)),e[0]=r*s,e[1]=n*s,e[2]=i*s,e[3]=a*s,e}function g(e,t,r){var n=t[0],i=t[1],a=t[2],s=t[3];return e[0]=r[0]*n+r[4]*i+r[8]*a+r[12]*s,e[1]=r[1]*n+r[5]*i+r[9]*a+r[13]*s,e[2]=r[2]*n+r[6]*i+r[10]*a+r[14]*s,e[3]=r[3]*n+r[7]*i+r[11]*a+r[15]*s,e}function m(){var e=new t(4);return t!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e[3]=1,e}u(),f();var w,y=v,b=function(e,t,r){var n=t[0],i=t[1],a=t[2],s=t[3],o=r[0],u=r[1],c=r[2],h=r[3];return e[0]=n*h+s*o+i*c-a*u,e[1]=i*h+s*u+a*o-n*c,e[2]=a*h+s*c+n*u-i*o,e[3]=s*h-n*o-i*u-a*c,e},T=p;function E(e){var t,r,n=(r=e,(t=e)[0]*r[0]+t[1]*r[1]);if(n<=1)return y(m(),e[0],e[1],Math.sqrt(1-n),0);var i=function(e,t){var r=t[0],n=t[1],i=r*r+n*n;return i>0&&(i=1/Math.sqrt(i)),e[0]=t[0]*i,e[1]=t[1]*i,e}(s(),e);return y(m(),i[0],i[1],0,0)}function M(e,t,r){return e<t?t:e>r?r:e}u(),c(1,0,0),c(0,1,0),m(),m(),w=new t(9),t!=Float32Array&&(w[1]=0,w[2]=0,w[3]=0,w[5]=0,w[6]=0,w[7]=0),w[0]=1,w[4]=1,w[8]=1;class A{constructor(e,a,s,o,c){var f=h(u(),e[0],e[1],e[2]),v=h(u(),a[0],a[1],a[2]),p=h(u(),s[0],s[1],s[2]);l(p,p);var g,w,y,b,E=function(e,t,r){return e[0]=t[0]-r[0],e[1]=t[1]-r[1],e[2]=t[2]-r[2],e}(u(),v,f),M=(w=(g=E)[0],y=g[1],b=g[2],Math.hypot(w,y,b));l(E,E);var A=d(u(),E,p);l(A,A);var C=d(u(),A,E);l(C,C),d(A,E,C),l(A,A),this.zoomSpeed=o,this.invScreen=[1/c[0],1/c[1]],this.centerTranslation=i(r(),a),n(this.centerTranslation,this.centerTranslation);var B=h(u(),0,0,-1*M);this.translation=i(r(),B);var P=function(e,r,n,i,a,s,o,u,c){var h=new t(9);return h[0]=e,h[1]=r,h[2]=n,h[3]=i,h[4]=a,h[5]=s,h[6]=o,h[7]=u,h[8]=c,h}(A[0],A[1],A[2],C[0],C[1],C[2],-E[0],-E[1],-E[2]);!function(e,t){if(e===t){var r=t[1],n=t[2],i=t[5];e[1]=t[3],e[2]=t[6],e[3]=r,e[5]=t[7],e[6]=n,e[7]=i}else e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8]}(P,P),this.rotation=function(e,t){var r,n=t[0]+t[4]+t[8];if(n>0)r=Math.sqrt(n+1),e[3]=.5*r,r=.5/r,e[0]=(t[5]-t[7])*r,e[1]=(t[6]-t[2])*r,e[2]=(t[1]-t[3])*r;else{var i=0;t[4]>t[0]&&(i=1),t[8]>t[3*i+i]&&(i=2);var a=(i+1)%3,s=(i+2)%3;r=Math.sqrt(t[3*i+i]-t[3*a+a]-t[3*s+s]+1),e[i]=.5*r,r=.5/r,e[3]=(t[3*a+s]-t[3*s+a])*r,e[a]=(t[3*a+i]+t[3*i+a])*r,e[s]=(t[3*s+i]+t[3*i+s])*r}return e}(m(),P),T(this.rotation,this.rotation),this.camera=r(),this.invCamera=r(),this.updateCameraMatrix()}rotate(e,t){var r=o(s(),M(2*e[0]*this.invScreen[0]-1,-1,1),M(1-2*e[1]*this.invScreen[1],-1,1)),n=o(s(),M(2*t[0]*this.invScreen[0]-1,-1,1),M(1-2*t[1]*this.invScreen[1],-1,1)),i=E(r),a=E(n);this.rotation=b(this.rotation,i,this.rotation),this.rotation=b(this.rotation,a,this.rotation),this.updateCameraMatrix()}zoom(e){var t=h(u(),0,0,e*this.invScreen[1]*this.zoomSpeed),n=i(r(),t);this.translation=a(this.translation,n,this.translation),this.translation[14]>=-.2&&(this.translation[14]=-.2),this.updateCameraMatrix()}pan(e){var t=v(f(),e[0]*this.invScreen[0]*Math.abs(this.translation[14]),e[1]*this.invScreen[1]*Math.abs(this.translation[14]),0,0),n=g(f(),t,this.invCamera),s=i(r(),n);this.centerTranslation=a(this.centerTranslation,s,this.centerTranslation),this.updateCameraMatrix()}updateCameraMatrix(){var e=function(e,t){var r=t[0],n=t[1],i=t[2],a=t[3],s=r+r,o=n+n,u=i+i,c=r*s,h=n*s,l=n*o,d=i*s,f=i*o,v=i*u,p=a*s,g=a*o,m=a*u;return e[0]=1-l-v,e[1]=h+m,e[2]=d-g,e[3]=0,e[4]=h-m,e[5]=1-c-v,e[6]=f+p,e[7]=0,e[8]=d+g,e[9]=f-p,e[10]=1-c-l,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}(r(),this.rotation);this.camera=a(this.camera,e,this.centerTranslation),this.camera=a(this.camera,this.translation,this.camera),this.invCamera=n(this.invCamera,this.camera)}eyePos(){return[this.invCamera[12],this.invCamera[13],this.invCamera[14]]}eyeDir(){var e=v(f(),0,0,-1,0);return[(e=p(e=g(e,e,this.invCamera),e))[0],e[1],e[2]]}upDir(){var e=v(f(),0,1,0,0);return[(e=p(e=g(e,e,this.invCamera),e))[0],e[1],e[2]]}}function C(e,t){var r=[t[0]-e[0],t[1]-e[1]];return Math.sqrt(Math.pow(r[0],2)+Math.pow(r[1],2))}class B{constructor(){this.mousemove=null,this.press=null,this.wheel=null,this.twoFingerDrag=null,this.pinch=null}registerForCanvas(e){var t=null,r=this;e.addEventListener("mousemove",(function(n){n.preventDefault();var i=e.getBoundingClientRect(),a=[n.clientX-i.left,n.clientY-i.top];t?r.mousemove&&r.mousemove(t,a,n):t=[n.clientX-i.left,n.clientY-i.top],t=a})),e.addEventListener("mousedown",(function(t){t.preventDefault();var n=e.getBoundingClientRect(),i=[t.clientX-n.left,t.clientY-n.top];r.press&&r.press(i,t)})),e.addEventListener("wheel",(function(e){e.preventDefault(),r.wheel&&r.wheel(-e.deltaY)})),e.oncontextmenu=function(e){e.preventDefault()};var n={};e.addEventListener("touchstart",(function(t){var i=e.getBoundingClientRect();t.preventDefault();for(var a=0;a<t.changedTouches.length;++a){var s=t.changedTouches[a];n[s.identifier]=[s.clientX-i.left,s.clientY-i.top],1==t.changedTouches.length&&r.press&&r.press(n[s.identifier],t)}})),e.addEventListener("touchmove",(function(t){t.preventDefault();var i=e.getBoundingClientRect();if(1==Object.keys(n).length){if(r.mousemove){var a=t.changedTouches[0],s=n[a.identifier],o=[a.clientX-i.left,a.clientY-i.top];t.buttons=1,r.mousemove(s,o,t)}}else{for(var u={},c=0;c<t.changedTouches.length;++c)u[(a=t.changedTouches[c]).identifier]=[a.clientX-i.left,a.clientY-i.top];var h=[];for(a in n)a in u||(u[a]=n[a]),h.push(n[a]);var l=[];for(a in u)l.push(u[a]);var d=[vec2.set(vec2.create(),l[0][0]-h[0][0],l[0][1]-h[0][1]),vec2.set(vec2.create(),l[1][0]-h[1][0],l[1][1]-h[1][1])],f=[vec2.create(),vec2.create()];vec2.normalize(f[0],d[0]),vec2.normalize(f[1],d[1]);var v=vec2.set(vec2.create(),h[1][0]-h[0][0],h[1][1]-h[0][1]);vec2.normalize(v,v);var p=vec2.lerp(vec2.create(),d[0],d[1],.5);vec2.normalize(p,p);var g=[vec2.dot(v,f[0]),vec2.dot(v,f[1])],m=[vec2.dot(p,f[0]),vec2.dot(p,f[1])];if(r.pinch&&Math.abs(g[0])>.5&&Math.abs(g[1])>.5&&Math.sign(g[0])!=Math.sign(g[1])){var w=C(h[0],h[1]),y=C(l[0],l[1]);r.pinch(y-w)}else if(r.twoFingerDrag&&Math.abs(m[0])>.5&&Math.abs(m[1])>.5&&Math.sign(m[0])==Math.sign(m[1])){var b=vec2.lerp(vec2.create(),d[0],d[1],.5);b[1]=-b[1],r.twoFingerDrag(b)}}for(c=0;c<t.changedTouches.length;++c)a=t.changedTouches[c],n[a.identifier]=[a.clientX-i.left,a.clientY-i.top]}));var i=function(e){e.preventDefault();for(var t=0;t<e.changedTouches.length;++t){var r=e.changedTouches[t];delete n[r.identifier]}};e.addEventListener("touchcancel",i),e.addEventListener("touchend",i)}}const P=e.p+"e14ddfc9a42583013a55.glb",x={SCALAR:0,VEC2:1,VEC3:2,VEC4:3,MAT2:4,MAT3:5,MAT5:6};function S(e){switch(e){case x.SCALAR:return 1;case x.VEC2:return 2;case x.VEC3:return 3;case x.VEC4:case x.MAT2:return 4;case x.MAT3:return 9;case x.MAT4:return 16;default:throw Error(`Invalid glTF Type ${e}`)}}class U{constructor(e,t,r){this.buffer=new Uint8Array(e,t,r)}}class R{constructor(e,t){this.length=t.byteLength,this.byteStride=0,void 0!==t.byteStride&&(this.byteStride=t.byteStride);var r=0;void 0!==t.byteOffset&&(r=t.byteOffset),this.view=e.buffer.subarray(r,r+this.length),this.needsUpload=!1,this.gpuBuffer=null,this.usage=0}addUsage(e){this.usage=this.usage|e}upload(e){var t,r=e.createBuffer({size:(t=this.view.byteLength,4,4*Math.floor((t+4-1)/4)),usage:this.usage,mappedAtCreation:!0});new this.view.constructor(r.getMappedRange()).set(this.view),r.unmap(),this.gpuBuffer=r,this.needsUpload=!1}}class V{constructor(e,t){this.count=t.count,this.componentType=t.componentType,this.gltfType=function(e){switch(e){case"SCALAR":return x.SCALAR;case"VEC2":return x.VEC2;case"VEC3":return x.VEC3;case"VEC4":return x.VEC4;case"MAT2":return x.MAT2;case"MAT3":return x.MAT3;case"MAT4":return x.MAT4;default:throw Error(`Unhandled glTF Type ${e}`)}}(t.type),this.view=e,this.byteOffset=0,void 0!==t.byteOffset&&(this.byteOffset=t.byteOffset)}get byteStride(){var e=function(e,t){var r=0;switch(e){case 5120:case 5121:r=1;break;case 5122:case 5123:r=2;break;case 5124:case 5125:case 5126:r=4;break;case 5130:r=8;break;default:throw Error("Unrecognized GLTF Component Type?")}return S(t)*r}(this.componentType,this.gltfType);return Math.max(e,this.view.byteStride)}get vertexType(){return function(e,t){var r=null;switch(e){case 5120:r="sint8";break;case 5121:r="uint8";break;case 5122:r="sint16";break;case 5123:r="uint16";break;case 5124:r="int32";break;case 5125:r="uint32";break;case 5126:r="float32";break;default:throw Error(`Unrecognized or unsupported glTF type ${e}`)}switch(S(t)){case 1:return r;case 2:return r+"x2";case 3:return r+"x3";case 4:return r+"x4";default:throw Error(`Invalid number of components for gltfType: ${t}`)}}(this.componentType,this.gltfType)}}class F{constructor(e,t,r){this.positions=e,this.indices=t,this.topology=r,this.renderPipeline=null,this.positions.view.needsUpload=!0,this.positions.view.addUsage(GPUBufferUsage.VERTEX),this.indices&&(this.indices.view.needsUpload=!0,this.indices.view.addUsage(GPUBufferUsage.INDEX))}buildRenderPipeline(e,t,r,n,i,a){var s={module:t,entryPoint:"vertex_main",buffers:[{arrayStride:this.positions.byteStride,attributes:[{format:this.positions.vertexType,offset:0,shaderLocation:0}]}]},o={module:t,entryPoint:"fragment_main",targets:[{format:r}]},u={topology:"triangle-list"};5==this.topology&&(u.topology="triangle-strip",u.stripIndexFormat=this.indices.vertexType);var c=e.createPipelineLayout({bindGroupLayouts:[i,a]});this.renderPipeline=e.createRenderPipeline({layout:c,vertex:s,fragment:o,primitive:u,depthStencil:{format:n,depthWriteEnabled:!0,depthCompare:"less"}})}render(e){e.setPipeline(this.renderPipeline),e.setVertexBuffer(0,this.positions.view.gpuBuffer,this.positions.byteOffset,this.positions.length),this.indices?(e.setIndexBuffer(this.indices.view.gpuBuffer,this.indices.vertexType,this.indices.byteOffset,this.indices.length),e.drawIndexed(this.indices.count)):e.draw(this.positions.count)}}class O{constructor(e,t){this.name=e,this.primitives=t}buildRenderPipeline(e,t,r,n,i,a){for(var s=0;s<this.primitives.length;++s)this.primitives[s].buildRenderPipeline(e,t,r,n,i,a)}render(e){for(var t=0;t<this.primitives.length;++t)this.primitives[t].render(e)}}class I{constructor(e,t,r){this.name=e,this.transform=t,this.mesh=r}buildRenderPipeline(e,t,r,n,i){this.nodeParamsBuf=e.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST,mappedAtCreation:!0}),new Float32Array(this.nodeParamsBuf.getMappedRange()).set(this.transform),this.nodeParamsBuf.unmap();var a=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}}]});this.nodeParamsBG=e.createBindGroup({layout:a,entries:[{binding:0,resource:{buffer:this.nodeParamsBuf}}]}),this.mesh.buildRenderPipeline(e,t,r,n,i,a)}render(e){e.setBindGroup(1,this.nodeParamsBG),this.mesh.render(e)}}class G{constructor(e){this.nodes=e}buildRenderPipeline(e,t,r,n,i){for(var a=0;a<this.nodes.length;++a)this.nodes[a].buildRenderPipeline(e,t,r,n,i)}render(e,t){e.setBindGroup(0,t);for(var r=0;r<this.nodes.length;++r)this.nodes[r].render(e)}}function L(e,t,r){var n=[],i=D(t),s={matrix:i=a(i,r,i),mesh:t.mesh,camera:t.camera};if(n.push(s),t.children)for(var o=0;o<t.children.length;++o)n.push(...L(e,e[t.children[o]],i));return n}function D(e){if(e.matrix)return function(e,r,n,i,a,s,o,u,c,h,l,d,f,v,p,g){var m=new t(16);return m[0]=e,m[1]=r,m[2]=n,m[3]=i,m[4]=a,m[5]=s,m[6]=o,m[7]=u,m[8]=c,m[9]=h,m[10]=l,m[11]=d,m[12]=f,m[13]=v,m[14]=p,m[15]=g,m}((n=e.matrix)[0],n[1],n[2],n[3],n[4],n[5],n[6],n[7],n[8],n[9],n[10],n[11],n[12],n[13],n[14],n[15]);var n,i=[1,1,1],a=[0,0,0,1],s=[0,0,0];return e.scale&&(i=e.scale),e.rotation&&(a=e.rotation),e.translation&&(s=e.translation),function(e,t,r,n){var i=t[0],a=t[1],s=t[2],o=t[3],u=i+i,c=a+a,h=s+s,l=i*u,d=i*c,f=i*h,v=a*c,p=a*h,g=s*h,m=o*u,w=o*c,y=o*h,b=n[0],T=n[1],E=n[2];return e[0]=(1-(v+g))*b,e[1]=(d+y)*b,e[2]=(f-w)*b,e[3]=0,e[4]=(d-y)*T,e[5]=(1-(l+g))*T,e[6]=(p+m)*T,e[7]=0,e[8]=(f+w)*E,e[9]=(p-m)*E,e[10]=(1-(l+v))*E,e[11]=0,e[12]=r[0],e[13]=r[1],e[14]=r[2],e[15]=1,e}(n=r(),a,s,i)}function _(e,t){document.getElementById("loading-text").hidden=!1;var r=new Uint32Array(e,0,5);if(1179937895!=r[0])throw Error("Provided file is not a glB file");if(2!=r[1])throw Error("Provided file is glTF 2.0 file");if(1313821514!=r[4])throw Error("Invalid glB: The first chunk of the glB file is not a JSON chunk!");var n=JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(e,20,r[3]))),i=new Uint32Array(e,20+r[3],2);if(5130562!=i[1])throw Error("Invalid glB: The second chunk of the glB file is not a binary chunk!");for(var a=new U(e,28+r[3],i[0]),s=[],o=0;o<n.bufferViews.length;++o)s.push(new R(a,n.bufferViews[o]));var u=[];for(o=0;o<n.accessors.length;++o){var c=n.accessors[o],h=c.bufferView;u.push(new V(s[h],c))}var l=[];console.log(`glTF file has ${n.meshes.length} meshes`);for(var d=0;d<n.meshes.length;++d){var f=n.meshes[d],v=[];for(o=0;o<f.primitives.length;++o){var p=f.primitives[o],g=p.mode;if(void 0===g&&(g=4),4!=g&&5!=g)throw Error(`Unsupported primitive mode ${p.mode}`);var m=null;void 0!==n.accessors[p.indices]&&(m=u[p.indices]);var w=null;for(var y in p.attributes){var b=u[p.attributes[y]];"POSITION"==y&&(w=b)}v.push(new F(w,m,g))}l.push(new O(f.name,v))}for(o=0;o<s.length;++o)s[o].needsUpload&&s[o].upload(t);var T=n.scenes[0].nodes;n.scenes&&(T=n.scenes[n.scene].nodes);var E=[];for(o=0;o<T.length;++o){var M=n.nodes[T[o]],A=D(M),C=L(n.nodes,M,A);for(d=0;d<C.length;++d){var B=C[d];B.mesh&&E.push(new I(M.name,B.matrix,l[B.mesh]))}}return document.getElementById("loading-text").hidden=!0,new G(E)}(async()=>{if(void 0===navigator.gpu)return document.getElementById("webgpu-canvas").setAttribute("style","display:none;"),void document.getElementById("no-webgpu").setAttribute("style","display:block;");var e=await navigator.gpu.requestAdapter(),t=await e.requestDevice(),n=document.getElementById("webgpu-canvas"),i=n.getContext("webgpu"),s=t.createShaderModule({code:"alias float4 = vec4<f32>;\nalias float3 = vec3<f32>;\n\nstruct VertexInput {\n    @location(0) position: float3,\n};\n\nstruct VertexOutput {\n    @builtin(position) position: float4,\n    @location(0) world_pos: float3,\n};\n\nstruct ViewParams {\n    view_proj: mat4x4<f32>,\n};\n\nstruct NodeParams {\n    transform: mat4x4<f32>,\n};\n\n@group(0) @binding(0)\nvar<uniform> view_params: ViewParams;\n\n@group(1) @binding(0)\nvar<uniform> node_params: NodeParams;\n\n@vertex\nfn vertex_main(vert: VertexInput) -> VertexOutput {\n    var out: VertexOutput;\n    out.position = view_params.view_proj * node_params.transform * float4(vert.position, 1.0);\n    out.world_pos = vert.position.xyz;\n    return out;\n};\n\n@fragment\nfn fragment_main(in: VertexOutput) -> @location(0) float4 {\n    let dx = dpdx(in.world_pos);\n    let dy = dpdy(in.world_pos);\n    let n = normalize(cross(dx, dy));\n    return float4((n + 1.0) * 0.5, 1.0);\n}\n"}),o=await s.getCompilationInfo();if(o.messages.length>0){var u=!1;console.log("Shader compilation log:");for(var c=0;c<o.messages.length;++c){var h=o.messages[c];console.log(`${h.lineNum}:${h.linePos} - ${h.message}`),u=u||"error"==h.type}if(u)return void console.log("Shader failed to compile")}var l="bgra8unorm";i.configure({device:t,format:l,usage:GPUTextureUsage.RENDER_ATTACHMENT});var d="depth24plus-stencil8",f=t.createTexture({size:{width:n.width,height:n.height,depth:1},format:d,usage:GPUTextureUsage.RENDER_ATTACHMENT}),v=t.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}}]}),p=t.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),g=t.createBindGroup({layout:v,entries:[{binding:0,resource:{buffer:p}}]}),m=await fetch(P).then((e=>e.arrayBuffer())).then((e=>_(e,t)));m.buildRenderPipeline(t,s,l,d,v),console.log(m),document.getElementById("uploadGLB").onchange=function(){document.getElementById("loading-text").hidden=!1;var e=new FileReader;e.onerror=function(){throw Error("Error reading GLB file")},e.onload=function(){(m=_(e.result,t)).buildRenderPipeline(t,s,l,d,v),console.log(m)},this.files[0]&&e.readAsArrayBuffer(this.files[0])};var w=new A([0,0,700],[0,0,0],[0,1,0],.5,[n.width,n.height]),y=function(e,t,r,n,i){var a,s=1/Math.tan(t/2);return e[0]=s/r,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,null!=i&&i!==1/0?(a=1/(n-i),e[10]=(i+n)*a,e[14]=2*i*n*a):(e[10]=-1,e[14]=-2*n),e}(r(),50*Math.PI/180,n.width/n.height,.01,1e3),b=r(),T=new B;T.mousemove=function(e,t,r){1==r.buttons?w.rotate(e,t):2==r.buttons&&w.pan([t[0]-e[0],e[1]-t[1]])},T.wheel=function(e){w.zoom(e)},T.pinch=T.wheel,T.twoFingerDrag=function(e){w.pan(e)},T.registerForCanvas(n);var E=function(){var e=null,t=new Promise((t=>e=t));return window.requestAnimationFrame(e),t};requestAnimationFrame(E);for(var M={colorAttachments:[{view:void 0,loadOp:"clear",clearValue:[.3,.3,.3,1],storeOp:"store"}],depthStencilAttachment:{view:f.createView(),depthLoadOp:"clear",depthClearValue:1,depthStoreOp:"store",stencilLoadOp:"clear",stencilClearValue:0,stencilStoreOp:"store"}};;){await E(),b=a(b,y,w.camera);var C=t.createBuffer({size:64,usage:GPUBufferUsage.COPY_SRC,mappedAtCreation:!0});new Float32Array(C.getMappedRange()).set(b),C.unmap(),M.colorAttachments[0].view=i.getCurrentTexture().createView();var x=t.createCommandEncoder();x.copyBufferToBuffer(C,0,p,0,64);var S=x.beginRenderPass(M);m.render(S,g),S.end(),t.queue.submit([x.finish()])}})()})();