(()=>{"use strict";var e="undefined"!=typeof Float32Array?Float32Array:Array;function t(){var t=new e(2);return e!=Float32Array&&(t[0]=0,t[1]=0),t}function r(e,t,r){return e[0]=t,e[1]=r,e}function n(){var t=new e(3);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function a(t,r,n){var a=new e(3);return a[0]=t,a[1]=r,a[2]=n,a}function i(e,t,r,n){return e[0]=t,e[1]=r,e[2]=n,e}function s(e,t){var r=t[0],n=t[1],a=t[2],i=r*r+n*n+a*a;return i>0&&(i=1/Math.sqrt(i)),e[0]=t[0]*i,e[1]=t[1]*i,e[2]=t[2]*i,e}function o(e,t,r){var n=t[0],a=t[1],i=t[2],s=r[0],o=r[1],u=r[2];return e[0]=a*u-i*o,e[1]=i*s-n*u,e[2]=n*o-a*s,e}Math.random,Math.PI,Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)}),t();function u(){var t=new e(4);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[3]=0),t}function l(e,t,r,n,a){return e[0]=t,e[1]=r,e[2]=n,e[3]=a,e}function c(e,t){var r=t[0],n=t[1],a=t[2],i=t[3],s=r*r+n*n+a*a+i*i;return s>0&&(s=1/Math.sqrt(s)),e[0]=r*s,e[1]=n*s,e[2]=a*s,e[3]=i*s,e}function h(e,t,r){var n=t[0],a=t[1],i=t[2],s=t[3];return e[0]=r[0]*n+r[4]*a+r[8]*i+r[12]*s,e[1]=r[1]*n+r[5]*a+r[9]*i+r[13]*s,e[2]=r[2]*n+r[6]*a+r[10]*i+r[14]*s,e[3]=r[3]*n+r[7]*a+r[11]*i+r[15]*s,e}function f(){var t=new e(4);return e!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t[3]=1,t}n(),u();var d,v=l,p=function(e,t,r){var n=t[0],a=t[1],i=t[2],s=t[3],o=r[0],u=r[1],l=r[2],c=r[3];return e[0]=n*c+s*o+a*l-i*u,e[1]=a*c+s*u+i*o-n*l,e[2]=i*c+s*l+n*u-a*o,e[3]=s*c-n*o-a*u-i*l,e},m=c;function g(){var t=new e(16);return e!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}function b(e,t){var r=t[0],n=t[1],a=t[2],i=t[3],s=t[4],o=t[5],u=t[6],l=t[7],c=t[8],h=t[9],f=t[10],d=t[11],v=t[12],p=t[13],m=t[14],g=t[15],b=r*o-n*s,y=r*u-a*s,w=r*l-i*s,T=n*u-a*o,x=n*l-i*o,M=a*l-i*u,B=c*p-h*v,E=c*m-f*v,A=c*g-d*v,F=h*m-f*p,C=h*g-d*p,S=f*g-d*m,U=b*S-y*C+w*F+T*A-x*E+M*B;return U?(U=1/U,e[0]=(o*S-u*C+l*F)*U,e[1]=(a*C-n*S-i*F)*U,e[2]=(p*M-m*x+g*T)*U,e[3]=(f*x-h*M-d*T)*U,e[4]=(u*A-s*S-l*E)*U,e[5]=(r*S-a*A+i*E)*U,e[6]=(m*w-v*M-g*y)*U,e[7]=(c*M-f*w+d*y)*U,e[8]=(s*C-o*A+l*B)*U,e[9]=(n*A-r*C-i*B)*U,e[10]=(v*x-p*w+g*b)*U,e[11]=(h*w-c*x-d*b)*U,e[12]=(o*E-s*F-u*B)*U,e[13]=(r*F-n*E+a*B)*U,e[14]=(p*y-v*T-m*b)*U,e[15]=(c*T-h*y+f*b)*U,e):null}function y(e,t){return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=t[0],e[13]=t[1],e[14]=t[2],e[15]=1,e}n(),a(1,0,0),a(0,1,0),f(),f(),d=new e(9),e!=Float32Array&&(d[1]=0,d[2]=0,d[3]=0,d[5]=0,d[6]=0,d[7]=0),d[0]=1,d[4]=1,d[8]=1;var w=function(e,t,r){var n=t[0],a=t[1],i=t[2],s=t[3],o=t[4],u=t[5],l=t[6],c=t[7],h=t[8],f=t[9],d=t[10],v=t[11],p=t[12],m=t[13],g=t[14],b=t[15],y=r[0],w=r[1],T=r[2],x=r[3];return e[0]=y*n+w*o+T*h+x*p,e[1]=y*a+w*u+T*f+x*m,e[2]=y*i+w*l+T*d+x*g,e[3]=y*s+w*c+T*v+x*b,y=r[4],w=r[5],T=r[6],x=r[7],e[4]=y*n+w*o+T*h+x*p,e[5]=y*a+w*u+T*f+x*m,e[6]=y*i+w*l+T*d+x*g,e[7]=y*s+w*c+T*v+x*b,y=r[8],w=r[9],T=r[10],x=r[11],e[8]=y*n+w*o+T*h+x*p,e[9]=y*a+w*u+T*f+x*m,e[10]=y*i+w*l+T*d+x*g,e[11]=y*s+w*c+T*v+x*b,y=r[12],w=r[13],T=r[14],x=r[15],e[12]=y*n+w*o+T*h+x*p,e[13]=y*a+w*u+T*f+x*m,e[14]=y*i+w*l+T*d+x*g,e[15]=y*s+w*c+T*v+x*b,e};function T(e){var r,n,a=(n=e,(r=e)[0]*n[0]+r[1]*n[1]);if(a<=1)return v(f(),e[0],e[1],Math.sqrt(1-a),0);var i=function(e,t){var r=t[0],n=t[1],a=r*r+n*n;return a>0&&(a=1/Math.sqrt(a)),e[0]=t[0]*a,e[1]=t[1]*a,e}(t(),e);return v(f(),i[0],i[1],0,0)}function x(e,t,r){return e<t?t:e>r?r:e}class M{constructor(t,r,a,u,l){var c=i(n(),t[0],t[1],t[2]),h=i(n(),r[0],r[1],r[2]),d=i(n(),a[0],a[1],a[2]);s(d,d);var v,p,w,T,x=function(e,t,r){return e[0]=t[0]-r[0],e[1]=t[1]-r[1],e[2]=t[2]-r[2],e}(n(),h,c),M=(p=(v=x)[0],w=v[1],T=v[2],Math.hypot(p,w,T));s(x,x);var B=o(n(),x,d);s(B,B);var E=o(n(),B,x);s(E,E),o(B,x,E),s(B,B),this.zoomSpeed=u,this.invScreen=[1/l[0],1/l[1]],this.centerTranslation=y(g(),r),b(this.centerTranslation,this.centerTranslation);var A=i(n(),0,0,-1*M);this.translation=y(g(),A);var F=function(t,r,n,a,i,s,o,u,l){var c=new e(9);return c[0]=t,c[1]=r,c[2]=n,c[3]=a,c[4]=i,c[5]=s,c[6]=o,c[7]=u,c[8]=l,c}(B[0],B[1],B[2],E[0],E[1],E[2],-x[0],-x[1],-x[2]);!function(e,t){if(e===t){var r=t[1],n=t[2],a=t[5];e[1]=t[3],e[2]=t[6],e[3]=r,e[5]=t[7],e[6]=n,e[7]=a}else e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8]}(F,F),this.rotation=function(e,t){var r,n=t[0]+t[4]+t[8];if(n>0)r=Math.sqrt(n+1),e[3]=.5*r,r=.5/r,e[0]=(t[5]-t[7])*r,e[1]=(t[6]-t[2])*r,e[2]=(t[1]-t[3])*r;else{var a=0;t[4]>t[0]&&(a=1),t[8]>t[3*a+a]&&(a=2);var i=(a+1)%3,s=(a+2)%3;r=Math.sqrt(t[3*a+a]-t[3*i+i]-t[3*s+s]+1),e[a]=.5*r,r=.5/r,e[3]=(t[3*i+s]-t[3*s+i])*r,e[i]=(t[3*i+a]+t[3*a+i])*r,e[s]=(t[3*s+a]+t[3*a+s])*r}return e}(f(),F),m(this.rotation,this.rotation),this.camera=g(),this.invCamera=g(),this.updateCameraMatrix()}rotate(e,n){var a=r(t(),x(2*e[0]*this.invScreen[0]-1,-1,1),x(1-2*e[1]*this.invScreen[1],-1,1)),i=r(t(),x(2*n[0]*this.invScreen[0]-1,-1,1),x(1-2*n[1]*this.invScreen[1],-1,1)),s=T(a),o=T(i);this.rotation=p(this.rotation,s,this.rotation),this.rotation=p(this.rotation,o,this.rotation),this.updateCameraMatrix()}zoom(e){var t=i(n(),0,0,e*this.invScreen[1]*this.zoomSpeed),r=y(g(),t);this.translation=w(this.translation,r,this.translation),this.translation[14]>=-.2&&(this.translation[14]=-.2),this.updateCameraMatrix()}pan(e){var t=l(u(),e[0]*this.invScreen[0]*Math.abs(this.translation[14]),e[1]*this.invScreen[1]*Math.abs(this.translation[14]),0,0),r=h(u(),t,this.invCamera),n=y(g(),r);this.centerTranslation=w(this.centerTranslation,n,this.centerTranslation),this.updateCameraMatrix()}updateCameraMatrix(){var e=function(e,t){var r=t[0],n=t[1],a=t[2],i=t[3],s=r+r,o=n+n,u=a+a,l=r*s,c=n*s,h=n*o,f=a*s,d=a*o,v=a*u,p=i*s,m=i*o,g=i*u;return e[0]=1-h-v,e[1]=c+g,e[2]=f-m,e[3]=0,e[4]=c-g,e[5]=1-l-v,e[6]=d+p,e[7]=0,e[8]=f+m,e[9]=d-p,e[10]=1-l-h,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}(g(),this.rotation);this.camera=w(this.camera,e,this.centerTranslation),this.camera=w(this.camera,this.translation,this.camera),this.invCamera=b(this.invCamera,this.camera)}eyePos(){return[this.invCamera[12],this.invCamera[13],this.invCamera[14]]}eyeDir(){var e=l(u(),0,0,-1,0);return[(e=c(e=h(e,e,this.invCamera),e))[0],e[1],e[2]]}upDir(){var e=l(u(),0,1,0,0);return[(e=c(e=h(e,e,this.invCamera),e))[0],e[1],e[2]]}}function B(e,t){var r=[t[0]-e[0],t[1]-e[1]];return Math.sqrt(Math.pow(r[0],2)+Math.pow(r[1],2))}class E{constructor(){this.mousemove=null,this.press=null,this.wheel=null,this.twoFingerDrag=null,this.pinch=null}registerForCanvas(e){var t=null,r=this;e.addEventListener("mousemove",(function(n){n.preventDefault();var a=e.getBoundingClientRect(),i=[n.clientX-a.left,n.clientY-a.top];t?r.mousemove&&r.mousemove(t,i,n):t=[n.clientX-a.left,n.clientY-a.top],t=i})),e.addEventListener("mousedown",(function(t){t.preventDefault();var n=e.getBoundingClientRect(),a=[t.clientX-n.left,t.clientY-n.top];r.press&&r.press(a,t)})),e.addEventListener("wheel",(function(e){e.preventDefault(),r.wheel&&r.wheel(-e.deltaY)})),e.oncontextmenu=function(e){e.preventDefault()};var n={};e.addEventListener("touchstart",(function(t){var a=e.getBoundingClientRect();t.preventDefault();for(var i=0;i<t.changedTouches.length;++i){var s=t.changedTouches[i];n[s.identifier]=[s.clientX-a.left,s.clientY-a.top],1==t.changedTouches.length&&r.press&&r.press(n[s.identifier],t)}})),e.addEventListener("touchmove",(function(t){t.preventDefault();var a=e.getBoundingClientRect();if(1==Object.keys(n).length){if(r.mousemove){var i=t.changedTouches[0],s=n[i.identifier],o=[i.clientX-a.left,i.clientY-a.top];t.buttons=1,r.mousemove(s,o,t)}}else{for(var u={},l=0;l<t.changedTouches.length;++l)u[(i=t.changedTouches[l]).identifier]=[i.clientX-a.left,i.clientY-a.top];var c=[];for(i in n)i in u||(u[i]=n[i]),c.push(n[i]);var h=[];for(i in u)h.push(u[i]);var f=[vec2.set(vec2.create(),h[0][0]-c[0][0],h[0][1]-c[0][1]),vec2.set(vec2.create(),h[1][0]-c[1][0],h[1][1]-c[1][1])],d=[vec2.create(),vec2.create()];vec2.normalize(d[0],f[0]),vec2.normalize(d[1],f[1]);var v=vec2.set(vec2.create(),c[1][0]-c[0][0],c[1][1]-c[0][1]);vec2.normalize(v,v);var p=vec2.lerp(vec2.create(),f[0],f[1],.5);vec2.normalize(p,p);var m=[vec2.dot(v,d[0]),vec2.dot(v,d[1])],g=[vec2.dot(p,d[0]),vec2.dot(p,d[1])];if(r.pinch&&Math.abs(m[0])>.5&&Math.abs(m[1])>.5&&Math.sign(m[0])!=Math.sign(m[1])){var b=B(c[0],c[1]),y=B(h[0],h[1]);r.pinch(y-b)}else if(r.twoFingerDrag&&Math.abs(g[0])>.5&&Math.abs(g[1])>.5&&Math.sign(g[0])==Math.sign(g[1])){var w=vec2.lerp(vec2.create(),f[0],f[1],.5);w[1]=-w[1],r.twoFingerDrag(w)}}for(l=0;l<t.changedTouches.length;++l)i=t.changedTouches[l],n[i.identifier]=[i.clientX-a.left,i.clientY-a.top]}));var a=function(e){e.preventDefault();for(var t=0;t<e.changedTouches.length;++t){var r=e.changedTouches[t];delete n[r.identifier]}};e.addEventListener("touchcancel",a),e.addEventListener("touchend",a)}}const A=5123,F={NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987};function C(e){switch(e){case"SCALAR":return 1;case"VEC2":return 2;case"VEC3":return 3;case"VEC4":return 4;default:return alert("Unhandled glTF Type "+e),null}}class S{constructor(e,t,r){this.arrayBuffer=e,this.size=t,this.byteOffset=r}}class U{constructor(e,t){this.length=t.byteLength,this.byteOffset=e.byteOffset,void 0!==t.byteOffset&&(this.byteOffset+=t.byteOffset),this.byteStride=0,void 0!==t.byteStride&&(this.byteStride=t.byteStride),this.buffer=new Uint8Array(e.arrayBuffer,this.byteOffset,this.length),this.needsUpload=!1,this.gpuBuffer=null,this.usage=0}addUsage(e){this.usage=this.usage|e}upload(e){var t,r=e.createBuffer({size:(t=this.buffer.byteLength,4,4*Math.floor((t+4-1)/4)),usage:this.usage,mappedAtCreation:!0});new this.buffer.constructor(r.getMappedRange()).set(this.buffer),r.unmap(),this.gpuBuffer=r}}class _{constructor(e,t){this.count=t.count,this.componentType=t.componentType,this.gltfType=t.type,this.webGPUType=function(e,t){var r=null;switch(e){case 5120:r="char";break;case 5121:r="uchar";break;case 5122:r="short";break;case A:r="ushort";break;case 5124:r="int";break;case 5125:r="uint";break;case 5126:r="float";break;case 5130:r="double";break;default:alert("Unrecognized GLTF Component Type?")}switch(C(t)){case 1:return r;case 2:return r+"2";case 3:return r+"3";case 4:return r+"4";default:alert("Too many components!")}}(this.componentType,t.type),this.numComponents=C(t.type),this.numScalars=this.count*this.numComponents,this.view=e,this.byteOffset=0,void 0!==t.byteOffset&&(this.byteOffset=t.byteOffset)}get byteStride(){var e=function(e,t){var r=0;switch(e){case 5120:case 5121:r=1;break;case 5122:case A:r=2;break;case 5124:case 5125:case 5126:case 5130:r=4;break;default:alert("Unrecognized GLTF Component Type?")}return C(t)*r}(this.componentType,this.gltfType);return Math.max(e,this.view.byteStride)}}class R{constructor(e,t,r,n,a,i){this.indices=e,this.positions=t,this.normals=r,this.texcoords=n,this.material=a,this.topology=i}buildRenderBundle(e,t,r,n,a){var i=function(e,t,r){var n="\n    struct VertexInput {\n        [[location(0)]] position: float3;\n    ",a="\n    struct VertexOutput {\n        [[builtin(position)]] position: float4;\n    ";e&&(n+="\n        [[location(1)]] normal: float3;\n        ",a+="\n        [[location(1)]] normal: float3;\n        "),t&&(n+="\n        [[location(2)]] uv: float2;\n        ",a+="\n        [[location(2)]] uv: float2;\n        ");var i=(n+="};")+(a+="};")+"\n    [[block]]\n    struct Mat4Uniform {\n        m: mat4x4<f32>;\n    };\n\n    [[group(0), binding(0)]]\n    var<uniform> view_proj: Mat4Uniform;\n    [[group(1), binding(0)]]\n    var<uniform> node_transform: Mat4Uniform;\n    \n    [[stage(vertex)]]\n    fn vertex_main(vin: VertexInput) -> VertexOutput {\n        var vout: VertexOutput;\n        vout.position = view_proj.m * node_transform.m * float4(vin.position, 1.0);\n    ";e&&(i+="\n        vout.normal = vin.normal;\n        "),t&&(i+="\n        vout.uv = vin.uv;\n        ");var s="\n    [[block]]\n    struct MaterialParams {\n        base_color_factor: float4;\n        emissive_factor: float4;\n        metallic_factor: f32;\n        roughness_factor: f32;\n    };\n\n    [[group(2), binding(0)]]\n    var<uniform> material: MaterialParams;\n    ";r&&(s+="\n        [[group(2), binding(1)]]\n        var base_color_sampler: sampler;\n        [[group(2), binding(2)]]\n        var base_color_texture: texture_2d<f32>;\n        ");var o=s+"\n    fn linear_to_srgb(x: f32) -> f32 {\n        if (x <= 0.0031308) {\n            return 12.92 * x;\n        }\n        return 1.055 * pow(x, 1.0 / 2.4) - 0.055;\n    }\n\n    [[stage(fragment)]]\n    fn fragment_main(fin: VertexOutput) -> [[location(0)]] float4 {\n        var color = float4(material.base_color_factor.xyz, 1.0);\n    ";return t&&r&&(o+="\n        var texture_color = textureSample(base_color_texture, base_color_sampler, fin.uv);\n        if (texture_color.a < 0.001) {\n            discard;\n        }\n        color = float4(material.base_color_factor.xyz * texture_color.xyz, 1.0);\n        "),"\n    type float2 = vec2<f32>;\n    type float3 = vec3<f32>;\n    type float4 = vec4<f32>;\n    "+(i+="\n        return vout;\n    }")+o+"\n        color.x = linear_to_srgb(color.x);\n        color.y = linear_to_srgb(color.y);\n        color.z = linear_to_srgb(color.z);\n        color.w = 1.0;\n        return color;\n    }\n    "}(this.normals,this.texcoords.length>0,this.material.baseColorTexture),s=[{arrayStride:this.positions.byteStride,attributes:[{format:"float32x3",offset:0,shaderLocation:0}]}];this.normals&&s.push({arrayStride:this.normals.byteStride,attributes:[{format:"float32x3",offset:0,shaderLocation:1}]}),this.texcoords.length>0&&s.push({arrayStride:this.texcoords[0].byteStride,attributes:[{format:"float32x2",offset:0,shaderLocation:2}]});var o=e.createPipelineLayout({bindGroupLayouts:[t[0],t[1],this.material.bindGroupLayout]}),u=e.createShaderModule({code:i}),l={module:u,entryPoint:"vertex_main",buffers:s},c={module:u,entryPoint:"fragment_main",targets:[{format:n}]},h={topology:"triangle-list"};5==this.topology&&(h.topology="triangle-strip",h.stripIndexFormat=this.indices.componentType==A?"uint16":"uint32");var f={layout:o,vertex:l,fragment:c,primitive:h,depthStencil:{format:a,depthWriteEnabled:!0,depthCompare:"less"}},d=e.createRenderPipeline(f);if(r.setBindGroup(2,this.material.bindGroup),r.setPipeline(d),r.setVertexBuffer(0,this.positions.view.gpuBuffer,this.positions.byteOffset,0),this.normals&&r.setVertexBuffer(1,this.normals.view.gpuBuffer,this.normals.byteOffset,0),this.texcoords.length>0&&r.setVertexBuffer(2,this.texcoords[0].view.gpuBuffer,this.texcoords[0].byteOffset,0),this.indices){var v=this.indices.componentType==A?"uint16":"uint32";r.setIndexBuffer(this.indices.view.gpuBuffer,v,this.indices.byteOffset,0),r.drawIndexed(this.indices.count)}else r.draw(this.positions.count)}}class G{constructor(e,t){this.name=e,this.primitives=t}}class P{constructor(e,t,r){this.name=e,this.mesh=t,this.transform=r,this.gpuUniforms=null,this.bindGroup=null}upload(e){var t=e.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM,mappedAtCreation:!0});new Float32Array(t.getMappedRange()).set(this.transform),t.unmap(),this.gpuUniforms=t}buildRenderBundle(e,t,r,n,a){var i=e.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}}]});this.bindGroup=e.createBindGroup({layout:i,entries:[{binding:0,resource:{buffer:this.gpuUniforms}}]});var s=[t,i],o=e.createRenderBundleEncoder({colorFormats:[n],depthStencilFormat:a});o.setBindGroup(0,r),o.setBindGroup(1,this.bindGroup);for(var u=0;u<this.mesh.primitives.length;++u)this.mesh.primitives[u].buildRenderBundle(e,s,o,n,a);return this.renderBundle=o.finish(),this.renderBundle}}function L(t){if(t.matrix)return function(t,r,n,a,i,s,o,u,l,c,h,f,d,v,p,m){var g=new e(16);return g[0]=t,g[1]=r,g[2]=n,g[3]=a,g[4]=i,g[5]=s,g[6]=o,g[7]=u,g[8]=l,g[9]=c,g[10]=h,g[11]=f,g[12]=d,g[13]=v,g[14]=p,g[15]=m,g}((r=t.matrix)[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[8],r[9],r[10],r[11],r[12],r[13],r[14],r[15]);var r,n=[1,1,1],a=[0,0,0,1],i=[0,0,0];return t.scale&&(n=t.scale),t.rotation&&(a=t.rotation),t.translation&&(i=t.translation),function(e,t,r,n){var a=t[0],i=t[1],s=t[2],o=t[3],u=a+a,l=i+i,c=s+s,h=a*u,f=a*l,d=a*c,v=i*l,p=i*c,m=s*c,g=o*u,b=o*l,y=o*c,w=n[0],T=n[1],x=n[2];return e[0]=(1-(v+m))*w,e[1]=(f+y)*w,e[2]=(d-b)*w,e[3]=0,e[4]=(f-y)*T,e[5]=(1-(h+m))*T,e[6]=(p+g)*T,e[7]=0,e[8]=(d+b)*x,e[9]=(p-g)*x,e[10]=(1-(h+v))*x,e[11]=0,e[12]=r[0],e[13]=r[1],e[14]=r[2],e[15]=1,e}(r=g(),a,i,n)}function O(e,t,r){var n=L(t);if(n=w(n,r,n),t.matrix=n,t.scale=void 0,t.rotation=void 0,t.translation=void 0,t.children){for(var a=0;a<t.children.length;++a)O(e,e[t.children[a]],n);t.children=[]}}class I{constructor(e,t){if(this.baseColorFactor=[1,1,1,1],this.baseColorTexture=null,this.emissiveFactor=[0,0,0,1],this.metallicFactor=1,this.roughnessFactor=1,void 0!==e.pbrMetallicRoughness){var r=e.pbrMetallicRoughness;void 0!==r.baseColorFactor&&(this.baseColorFactor=r.baseColorFactor),void 0!==r.baseColorTexture&&(this.baseColorTexture=t[r.baseColorTexture.index]),void 0!==r.metallicFactor&&(this.metallicFactor=r.metallicFactor),void 0!==r.roughnessFactor&&(this.roughnessFactor=r.roughnessFactor)}void 0!==e.emissiveFactor&&(this.emissiveFactor[0]=e.emissiveFactor[0],this.emissiveFactor[1]=e.emissiveFactor[1],this.emissiveFactor[2]=e.emissiveFactor[2]),this.gpuBuffer=null,this.bindGroupLayout=null,this.bindGroup=null}upload(e){var t=e.createBuffer({size:40,usage:GPUBufferUsage.UNIFORM,mappedAtCreation:!0}),r=new Float32Array(t.getMappedRange());r.set(this.baseColorFactor),r.set(this.emissiveFactor,4),r.set([this.metallicFactor,this.roughnessFactor],8),t.unmap(),this.gpuBuffer=t;var n=[{binding:0,visibility:GPUShaderStage.FRAGMENT,buffer:{type:"uniform"}}],a=[{binding:0,resource:{buffer:this.gpuBuffer}}];this.baseColorTexture&&(n.push({binding:1,visibility:GPUShaderStage.FRAGMENT,sampler:{}}),n.push({binding:2,visibility:GPUShaderStage.FRAGMENT,texture:{}}),a.push({binding:1,resource:this.baseColorTexture.sampler}),a.push({binding:2,resource:this.baseColorTexture.imageView})),this.bindGroupLayout=e.createBindGroupLayout({entries:n}),this.bindGroup=e.createBindGroup({layout:this.bindGroupLayout,entries:a})}}class N{constructor(e,t){var r=void 0===e.magFilter||e.magFilter==F.LINEAR?"linear":"nearest",n=void 0===e.minFilter||e.minFilter==F.LINEAR?"linear":"nearest",a="repeat";void 0!==e.wrapS&&(a=e.wrapS==F.REPEAT?"repeat":e.wrapS==F.CLAMP_TO_EDGE?"clamp-to-edge":"mirror-repeat");var i="repeat";void 0!==e.wrapT&&(i=e.wrapT==F.REPEAT?"repeat":e.wrapT==F.CLAMP_TO_EDGE?"clamp-to-edge":"mirror-repeat"),this.sampler=t.createSampler({magFilter:r,minFilter:n,addressModeU:a,addressModeV:i})}}class V{constructor(e,t){this.gltfsampler=e,this.sampler=e.sampler,this.image=t,this.imageView=t.createView()}}class D{constructor(e){this.nodes=e}buildRenderBundles(e,t,r,n){for(var a=[],i=0;i<this.nodes.length;++i){var s=this.nodes[i].buildRenderBundle(e,t,r,n,"depth24plus-stencil8");a.push(s)}return a}}async function z(e,t){var r=new Uint32Array(e,0,5);if(1179937895==r[0]){console.log(`GLB Version ${r[1]}, file length ${r[2]}`),console.log(`JSON chunk length ${r[3]}, type ${r[4]}`);var n=JSON.parse(new TextDecoder("utf-8").decode(new Uint8Array(e,20,r[3])));console.log(n);var a=new Uint32Array(e,20+r[3],2),i=new S(e,a[0],28+r[3]);28+r[3]+a[0]!=e.byteLength&&console.log("TODO: Multiple binary chunks in file");for(var s=[],o=0;o<n.bufferViews.length;++o)s.push(new U(i,n.bufferViews[o]));var u=[];if(void 0!==n.images)for(o=0;o<n.images.length;++o){var l=n.images[o],c=new U(i,n.bufferViews[l.bufferView]),h=new Blob([c.buffer],{type:l["mime/type"]}),f=await createImageBitmap(h),d=t.createTexture({size:[f.width,f.height,1],format:"rgba8unorm-srgb",usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST|GPUTextureUsage.RENDER_ATTACHMENT}),v={source:f},p={texture:d};t.queue.copyExternalImageToTexture(v,p,[f.width,f.height,1]),u.push(d)}var m=new N({},t),b=[];if(void 0!==n.samplers)for(o=0;o<n.samplers.length;++o)b.push(new N(n.samplers[o],t));var y=[];if(void 0!==n.textures)for(o=0;o<n.textures.length;++o){var w=n.textures[o],T=void 0!==w.sampler?b[w.sampler]:m;y.push(new V(T,u[w.source]))}var x=new I({}),M=[];for(o=0;o<n.materials.length;++o)M.push(new I(n.materials[o],y));var B=[];for(o=0;o<n.meshes.length;++o){for(var E=n.meshes[o],A=[],F=0;F<E.primitives.length;++F){var C=E.primitives[F],z=C.mode;if(void 0===z&&(z=4),4==z||5==z){var k=null;void 0!==n.accessors[C.indices]&&(s[$=(H=n.accessors[C.indices]).bufferView].needsUpload=!0,s[$].addUsage(GPUBufferUsage.INDEX),k=new _(s[$],H));var q=null,X=null,Y=[];for(var j in C.attributes){var H,$;s[$=(H=n.accessors[C.attributes[j]]).bufferView].needsUpload=!0,s[$].addUsage(GPUBufferUsage.VERTEX),"POSITION"==j?q=new _(s[$],H):"NORMAL"==j?X=new _(s[$],H):j.startsWith("TEXCOORD")&&Y.push(new _(s[$],H))}var W;W=void 0!==C.material?M[C.material]:x;var J=new R(k,q,X,Y,W,z);A.push(J)}else alert("Ignoring primitive with unsupported mode "+C.mode)}B.push(new G(E.name,A))}for(o=0;o<s.length;++o)s[o].needsUpload&&s[o].upload(t);for(x.upload(t),o=0;o<M.length;++o)M[o].upload(t);var K=[],Q=function(e){for(var t=g(),r=0;r<e.length;++r)O(e,e[r],t);return e}(n.nodes);for(o=0;o<Q.length;++o){var Z=Q[o];if(void 0!==Z.mesh){var ee=new P(Z.name,B[Z.mesh],L(Z));ee.upload(t),K.push(ee)}}return new D(K)}alert("This does not appear to be a glb file?")}(async()=>{if(void 0===navigator.gpu)return document.getElementById("webgpu-canvas").setAttribute("style","display:none;"),void document.getElementById("no-webgpu").setAttribute("style","display:block;");var e=await navigator.gpu.requestAdapter(),t=await e.requestDevice(),r=await fetch("https://www.dl.dropboxusercontent.com/s/7ndj8pfjhact7lz/DamagedHelmet.glb?dl=1").then((e=>e.arrayBuffer().then((e=>z(e,t))))),a=document.getElementById("webgpu-canvas"),s=a.getContext("webgpu"),o="bgra8unorm";s.configure({device:t,format:o,usage:GPUTextureUsage.RENDER_ATTACHMENT});var u={colorAttachments:[{view:void 0,loadValue:[.3,.3,.3,1]}],depthStencilAttachment:{view:t.createTexture({size:{width:a.width,height:a.height,depth:1},format:"depth24plus-stencil8",usage:GPUTextureUsage.RENDER_ATTACHMENT}).createView(),depthLoadValue:1,depthStoreOp:"store",stencilLoadValue:0,stencilStoreOp:"store"}},l=t.createBindGroupLayout({entries:[{binding:0,visibility:GPUShaderStage.VERTEX,buffer:{type:"uniform"}}]}),c=t.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),h=t.createBindGroup({layout:l,entries:[{binding:0,resource:{buffer:c}}]}),f=r.buildRenderBundles(t,l,h,o);const d=i(n(),0,0,1),v=i(n(),0,0,0),p=i(n(),0,1,0);var m=new M(d,v,p,2,[a.width,a.height]),b=function(e,t,r,n,a){var i,s=1/Math.tan(t/2);return e[0]=s/r,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,i=1/-999.9,e[10]=1000.1*i,e[14]=200*i,e}(g(),50*Math.PI/180,a.width/a.height),y=g(),T=new E;T.mousemove=function(e,t,r){1==r.buttons?m.rotate(e,t):2==r.buttons&&m.pan([t[0]-e[0],e[1]-t[1]])},T.wheel=function(e){m.zoom(.5*e)},T.pinch=T.wheel,T.twoFingerDrag=function(e){m.pan(e)},T.registerForCanvas(a);var x=function(){var e=null,t=new Promise((t=>e=t));return window.requestAnimationFrame(e),t};requestAnimationFrame(x);var B=null;document.getElementById("uploadGLB").onchange=function(){var e=new FileReader;e.onerror=function(){alert("error reading GLB file")},e.onload=function(){B=e.result},e.readAsArrayBuffer(this.files[0])};for(var A=document.getElementById("fps"),F=0,C=0;;){await x(),null!=B&&(f=(r=await z(B,t)).buildRenderBundles(t,l,h,o),m=new M(d,v,p,2,[a.width,a.height]),B=null);var S=performance.now();u.colorAttachments[0].view=s.getCurrentTexture().createView();var U=t.createCommandEncoder();y=w(y,b,m.camera);var _=t.createBuffer({size:64,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC,mappedAtCreation:!0});new Float32Array(_.getMappedRange()).set(y),_.unmap(),U.copyBufferToBuffer(_,0,c,0,64);var R=U.beginRenderPass(u);R.executeBundles(f),R.endPass(),t.queue.submit([U.finish()]),await t.queue.onSubmittedWorkDone(),F+=1,C+=performance.now()-S,A.innerHTML=`Avg. FPS ${Math.round(1e3*F/C)}`}})()})();