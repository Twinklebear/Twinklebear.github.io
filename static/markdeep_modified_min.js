(function(){var _=String.prototype;_.rp=_.replace;_.ss=_.substring;var DEBUG_SHOW_GRID=false;var DEBUG_SHOW_SOURCE=DEBUG_SHOW_GRID;var DEBUG_HIDE_PASSTHROUGH=DEBUG_SHOW_SOURCE;var STROKE_WIDTH=2;var DIAGRAM_MARKER='*';var DIAGRAM_START=Array(5+1).join(DIAGRAM_MARKER);function entag(tag,content){return'<'+tag+'>'+content+'</'+tag+'>';}
var DIAGRAM_STYLESHEET=entag('style','.md svg.diagram{'+
'display:block;'+
'font-family:Menlo,\'Lucida Console\',monospace;'+
'font-size:12px;'+
'text-align:center;'+
'stroke-linecap:round;'+
'stroke-width:'+STROKE_WIDTH+'px;'+
'}');var MARKDEEP_LINE='<!-- Markdeep: --><style class="fallback">body{white-space:pre;font-family:monospace}</style><script src="markdeep.min.js"></script><script src="https://casual-effects.com/markdeep/latest/markdeep.min.js"></script>';var MARKDEEP_FOOTER='<div class="markdeepFooter"><i>formatted by <a href="http://casual-effects.com/markdeep" style="color:#999">Markdeep&nbsp;&nbsp;&nbsp;</a></i><div style="display:inline-block;font-size:13px;font-family:\'Times New Roman\',serif;vertical-align:middle;transform:translate(-3px,-1px)rotate(135deg);">&#x2712;</div></div>';var max=Math.max;var min=Math.min;function escapeHTMLEntities(str){return String(str).rp(/&/g,'&amp;').rp(/</g,'&lt;').rp(/>/g,'&gt;').rp(/"/g,'&quot;');}
function unescapeHTMLEntities(str){return str.rp(/&lt;/g,'<').rp(/&gt;/g,'>').rp(/&quot;/g,'"').rp(/&#39;/g,"'").rp(/&ndash;/g,'--').rp(/&mdash;/g,'---').rp(/&amp;/g,'&');}
function equalizeLineLengths(str){var lineArray=str.split('\n');var longest=0;lineArray.forEach(function(line){longest=max(longest,line.length);});var spaces=Array(longest+1).join(' ');var result='';lineArray.forEach(function(line){result+=line+spaces.ss(line.length)+'\n';});return result;}
function removeLeadingSpace(str){var lineArray=str.split('\n');var minimum=Infinity;lineArray.forEach(function(line){if(line.trim()!==''){var spaceArray=line.match(/^([ \t]*)/);if(spaceArray){minimum=min(minimum,spaceArray[0].length);}}});if(minimum===0){return str;}
var result='';lineArray.forEach(function(line){result+=line.ss(minimum)+'\n';});return result;}
function diagramToSVG(diagramString,alignmentHint){diagramString=equalizeLineLengths(diagramString);var HIDE_O='\ue004';diagramString=diagramString.rp(/([a-z]|[A-Z])o([a-z]|[A-Z])/g,'$1'+HIDE_O+'$2');var SCALE=8;var ASPECT=2;var DIAGONAL_ANGLE=Math.atan(1.0/ASPECT)*180/Math.PI;var EPSILON=1e-6;var ARROW_HEAD_CHARACTERS='>v<^';var POINT_CHARACTERS='o*';var JUMP_CHARACTERS='()';var DECORATION_CHARACTERS=ARROW_HEAD_CHARACTERS+POINT_CHARACTERS+JUMP_CHARACTERS;var UNDIRECTED_VERTEX_CHARACTERS="+";var VERTEX_CHARACTERS=UNDIRECTED_VERTEX_CHARACTERS+".'";function isUndirectedVertex(c){return UNDIRECTED_VERTEX_CHARACTERS.indexOf(c)+1;}
function isVertex(c){return VERTEX_CHARACTERS.indexOf(c)!==-1;}
function isTopVertex(c){return isUndirectedVertex(c)||(c==='.');}
function isBottomVertex(c){return isUndirectedVertex(c)||(c==="'");}
function isVertexOrLeftDecoration(c){return isVertex(c)||(c==='<')||isPoint(c);}
function isVertexOrRightDecoration(c){return isVertex(c)||(c==='>')||isPoint(c);}
function isArrowHead(c){return ARROW_HEAD_CHARACTERS.indexOf(c)+1;}
function isSolidHLine(c){return(c==='-')||isUndirectedVertex(c)||isJump(c);}
function isSolidVLineOrJumpOrPoint(c){return isSolidVLine(c)||isJump(c)||isPoint(c);}
function isSolidVLine(c){return(c==='|')||isUndirectedVertex(c);}
function isSolidDLine(c){return(c==='/')||isUndirectedVertex(c)}
function isSolidBLine(c){return(c==='\\')||isUndirectedVertex(c);}
function isJump(c){return JUMP_CHARACTERS.indexOf(c)+1;}
function isPoint(c){return POINT_CHARACTERS.indexOf(c)+1;}
function isDecoration(c){return DECORATION_CHARACTERS.indexOf(c)+1;}
function isEmpty(c){return c===' ';}
function Vec2(x,y){if(!(this instanceof Vec2)){return new Vec2(x,y);}
if(y===undefined){if(x===undefined){x=y=0;}
else if(x instanceof Vec2){y=x.y;x=x.x;}
else{console.error("Vec2 requires one Vec2 or (x, y) as an argument");}}
this.x=x;this.y=y;Object.seal(this);}
Vec2.prototype.toString=Vec2.prototype.toSVG=function(){return''+(this.x*SCALE)+','+(this.y*SCALE*ASPECT)+' ';};function makeGrid(str){var grid=function(x,y){if(y===undefined){if(x instanceof Vec2){y=x.y;x=x.x;}
else{console.error('grid requires either a Vec2 or (x, y)');}}
return((x>=0)&&(x<grid.width)&&(y>=0)&&(y<grid.height))?str[y*(grid.width+1)+x]:' ';};grid._used=[];grid.width=str.indexOf('\n');grid.height=str.split('\n').length;if(str[str.length-1]==='\n'){--grid.height;}
grid.setUsed=function(x,y){if(y===undefined){if(x instanceof Vec2){y=x.y;x=x.x;}
else{console.error('grid requires either a Vec2 or (x, y)');}}
if((x>=0)&&(x<grid.width)&&(y>=0)&&(y<grid.height)){grid._used[y*(grid.width+1)+x]=true;}};grid.isUsed=function(x,y){if(y===undefined){if(x instanceof Vec2){y=x.y;x=x.x;}
else{console.error('grid requires either a Vec2 or (x, y)');}}
return(this._used[y*(this.width+1)+x]===true);};grid.isSolidVLineAt=function(x,y){if(y===undefined){y=x.x;x=x.x;}
var up=grid(x,y-1);var c=grid(x,y);var dn=grid(x,y+1);var uprt=grid(x+1,y-1);var uplt=grid(x-1,y-1);if(isSolidVLine(c)){return(isTopVertex(up)||(up==='^')||isSolidVLine(up)||isJump(up)||isBottomVertex(dn)||(dn==='v')||isSolidVLine(dn)||isJump(dn)||isPoint(up)||isPoint(dn)||(grid(x,y-1)==='_')||(uplt==='_')||(uprt==='_')||((isTopVertex(uplt)||isTopVertex(uprt))&&(isBottomVertex(grid(x-1,y+1))||isBottomVertex(grid(x+1,y+1)))));}else if(isTopVertex(c)||(c==='^')){return isSolidVLine(dn)||(isJump(dn)&&(c!=='.'));}else if(isBottomVertex(c)||(c==='v')){return isSolidVLine(up)||(isJump(up)&&(c!=="'"));}else if(isPoint(c)){return isSolidVLine(up)||isSolidVLine(dn);}
return false;};grid.isSolidHLineAt=function(x,y){if(y===undefined){y=x.x;x=x.x;}
var ltlt=grid(x-2,y);var lt=grid(x-1,y);var c=grid(x+0,y);var rt=grid(x+1,y);var rtrt=grid(x+2,y);if(isSolidHLine(c)||(isSolidHLine(lt)&&isJump(c))){if(isSolidHLine(lt)){return isSolidHLine(rt)||isVertexOrRightDecoration(rt)||isSolidHLine(ltlt)||isVertexOrLeftDecoration(ltlt);}else if(isVertexOrLeftDecoration(lt)){return isSolidHLine(rt);}else{return isSolidHLine(rt)&&(isSolidHLine(rtrt)||isVertexOrRightDecoration(rtrt));}}else if(c==='<'){return isSolidHLine(rt)&&isSolidHLine(rtrt)}else if(c==='>'){return isSolidHLine(lt)&&isSolidHLine(ltlt);}else if(isVertex(c)){return((isSolidHLine(lt)&&isSolidHLine(ltlt))||(isSolidHLine(rt)&&isSolidHLine(rtrt)));}
return false;};grid.isSolidBLineAt=function(x,y){if(y===undefined){y=x.x;x=x.x;}
var c=grid(x,y);var lt=grid(x-1,y-1);var rt=grid(x+1,y+1);if(c==='\\'){return(isSolidBLine(rt)||isBottomVertex(rt)||isPoint(rt)||(rt==='v')||isSolidBLine(lt)||isTopVertex(lt)||isPoint(lt)||(lt==='^')||(grid(x,y-1)==='/')||(grid(x,y+1)==='/')||(rt==='_')||(lt==='_'));}else if(c==='.'){return(rt==='\\');}else if(c==="'"){return(lt==='\\');}else if(c==='^'){return rt==='\\';}else if(c==='v'){return lt==='\\';}else if(isVertex(c)||isPoint(c)||(c==='|')){return isSolidBLine(lt)||isSolidBLine(rt);}};grid.isSolidDLineAt=function(x,y){if(y===undefined){y=x.x;x=x.x;}
var c=grid(x,y);var lt=grid(x-1,y+1);var rt=grid(x+1,y-1);if(c==='/'&&((grid(x,y-1)==='\\')||(grid(x,y+1)==='\\'))){return true;}else if(isSolidDLine(c)){return(isSolidDLine(rt)||isTopVertex(rt)||isPoint(rt)||(rt==='^')||(rt==='_')||isSolidDLine(lt)||isBottomVertex(lt)||isPoint(lt)||(lt==='v')||(lt==='_'));}else if(c==='.'){return(lt==='/');}else if(c==="'"){return(rt==='/');}else if(c==='^'){return lt==='/';}else if(c==='v'){return rt==='/';}else if(isVertex(c)||isPoint(c)||(c==='|')){return isSolidDLine(lt)||isSolidDLine(rt);}
return false;};grid.toString=function(){return str;};return Object.freeze(grid);}
function Path(A,B,C,D){if(!((A instanceof Vec2)&&(B instanceof Vec2))){console.error('Path constructor requires at least two Vec2s');}
this.A=A;this.B=B;if(C){this.C=C;if(D){this.D=D;}else{this.D=C;}}
Object.freeze(this);}
var _=Path.prototype;_.isVertical=function(){return this.B.x===this.A.x;};_.isHorizontal=function(){return this.B.y===this.A.y;};_.isDiagonal=function(){var dx=this.B.x-this.A.x;var dy=this.B.y-this.A.y;return(Math.abs(dy+dx)<EPSILON);};_.isBackDiagonal=function(){var dx=this.B.x-this.A.x;var dy=this.B.y-this.A.y;return(Math.abs(dy-dx)<EPSILON);};_.isCurved=function(){return this.C!==undefined;};_.endsAt=function(x,y){if(y===undefined){y=x.y;x=x.x;}
return((this.A.x===x)&&(this.A.y===y))||((this.B.x===x)&&(this.B.y===y));};_.upEndsAt=function(x,y){if(y===undefined){y=x.y;x=x.x;}
return this.isVertical()&&(this.A.x===x)&&(min(this.A.y,this.B.y)===y);};_.diagonalUpEndsAt=function(x,y){if(!this.isDiagonal()){return false;}
if(y===undefined){y=x.y;x=x.x;}
if(this.A.y<this.B.y){return(this.A.x===x)&&(this.A.y===y);}else{return(this.B.x===x)&&(this.B.y===y);}};_.diagonalDownEndsAt=function(x,y){if(!this.isDiagonal()){return false;}
if(y===undefined){y=x.y;x=x.x;}
if(this.B.y<this.A.y){return(this.A.x===x)&&(this.A.y===y);}else{return(this.B.x===x)&&(this.B.y===y);}};_.backDiagonalUpEndsAt=function(x,y){if(!this.isBackDiagonal()){return false;}
if(y===undefined){y=x.y;x=x.x;}
if(this.A.y<this.B.y){return(this.A.x===x)&&(this.A.y===y);}else{return(this.B.x===x)&&(this.B.y===y);}};_.backDiagonalDownEndsAt=function(x,y){if(!this.isBackDiagonal()){return false;}
if(y===undefined){y=x.y;x=x.x;}
if(this.B.y<this.A.y){return(this.A.x===x)&&(this.A.y===y);}else{return(this.B.x===x)&&(this.B.y===y);}};_.downEndsAt=function(x,y){if(y===undefined){y=x.y;x=x.x;}
return this.isVertical()&&(this.A.x===x)&&(max(this.A.y,this.B.y)===y);};_.leftEndsAt=function(x,y){if(y===undefined){y=x.y;x=x.x;}
return this.isHorizontal()&&(this.A.y===y)&&(min(this.A.x,this.B.x)===x);};_.rightEndsAt=function(x,y){if(y===undefined){y=x.y;x=x.x;}
return this.isHorizontal()&&(this.A.y===y)&&(max(this.A.x,this.B.x)===x);};_.verticalPassesThrough=function(x,y){if(y===undefined){y=x.y;x=x.x;}
return this.isVertical()&&(this.A.x===x)&&(min(this.A.y,this.B.y)<=y)&&(max(this.A.y,this.B.y)>=y);}
_.horizontalPassesThrough=function(x,y){if(y===undefined){y=x.y;x=x.x;}
return this.isHorizontal()&&(this.A.y===y)&&(min(this.A.x,this.B.x)<=x)&&(max(this.A.x,this.B.x)>=x);}
_.toSVG=function(){var svg='<path d="M '+this.A;if(this.isCurved()){svg+='C '+this.C+this.D+this.B;}else{svg+='L '+this.B;}
svg+='" style="fill:none;stroke:#000;"';svg+='/>';return svg;}; function PathSet(){this._pathArray=[];}
var PS=PathSet.prototype;PS.insert=function(path){this._pathArray.push(path);};function makeFilterAny(method){return function(x,y){for(var i=0;i<this._pathArray.length;++i){if(method.call(this._pathArray[i],x,y)){return true;}}
return false;}}
PS.upEndsAt=makeFilterAny(_.upEndsAt);PS.diagonalUpEndsAt=makeFilterAny(_.diagonalUpEndsAt);PS.backDiagonalUpEndsAt=makeFilterAny(_.backDiagonalUpEndsAt);PS.diagonalDownEndsAt=makeFilterAny(_.diagonalDownEndsAt);PS.backDiagonalDownEndsAt=makeFilterAny(_.backDiagonalDownEndsAt);PS.downEndsAt=makeFilterAny(_.downEndsAt);PS.leftEndsAt=makeFilterAny(_.leftEndsAt);PS.rightEndsAt=makeFilterAny(_.rightEndsAt);PS.endsAt=makeFilterAny(_.endsAt);PS.verticalPassesThrough=makeFilterAny(_.verticalPassesThrough);PS.horizontalPassesThrough=makeFilterAny(_.horizontalPassesThrough);PS.toSVG=function(){var svg='';for(var i=0;i<this._pathArray.length;++i){svg+=this._pathArray[i].toSVG()+'\n';}
return svg;};function DecorationSet(){this._decorationArray=[];}
var DS=DecorationSet.prototype;DS.insert=function(x,y,type,angle){if(type===undefined){type=y;y=x.y;x=x.x;}
if(!isDecoration(type)){console.error('Illegal decoration character: '+type);}
var d={C:Vec2(x,y),type:type,angle:angle||0};if(isPoint(type)){this._decorationArray.push(d);}else{this._decorationArray.unshift(d);}};DS.toSVG=function(){var svg='';for(var i=0;i<this._decorationArray.length;++i){var decoration=this._decorationArray[i];var C=decoration.C;if(isJump(decoration.type)){var dx=(decoration.type===')')?+0.75:-0.75;var up=Vec2(C.x,C.y-0.5);var dn=Vec2(C.x,C.y+0.5);var cup=Vec2(C.x+dx,C.y-0.5);var cdn=Vec2(C.x+dx,C.y+0.5);svg+='<path d="M '+dn+' C '+cdn+cup+up+'" style="fill:none;stroke:#000;"/>';}else if(isPoint(decoration.type)){svg+='<circle cx="'+(C.x*SCALE)+'" cy="'+(C.y*SCALE*ASPECT)+
'" r="'+(SCALE-STROKE_WIDTH)+'" style="fill:'+
((decoration.type==='*')?'#000':'#FFF')+
';stroke:#000;"/>';}else{var tip=Vec2(C.x+1,C.y);var up=Vec2(C.x-0.5,C.y-0.35);var dn=Vec2(C.x-0.5,C.y+0.35);svg+='<polygon points="'+tip+up+dn+
'" style="fill:#000" transform="rotate('+decoration.angle+','+C+')"/>\n';}}
return svg;}; function findPaths(grid,pathSet){for(var x=0;x<grid.width;++x){for(var y=0;y<grid.height;++y){if(grid.isSolidVLineAt(x,y)){var A=Vec2(x,y);do{grid.setUsed(x,y);++y;}while(grid.isSolidVLineAt(x,y));var B=Vec2(x,y-1);var up=grid(A);var upup=grid(A.x,A.y-1);if(!isVertex(up)&&((upup==='-')||(upup==='_')||(grid(A.x-1,A.y-1)==='_')||(grid(A.x+1,A.y-1)==='_')||isBottomVertex(upup))||isJump(upup)){A.y-=0.5;}
var dn=grid(B);var dndn=grid(B.x,B.y+1);if(!isVertex(dn)&&((dndn==='-')||isTopVertex(dndn))||isJump(dndn)||(grid(B.x-1,B.y)==='_')||(grid(B.x+1,B.y)==='_')){B.y+=0.5;}
if((A.x!==B.x)||(A.y!==B.y)){pathSet.insert(new Path(A,B));}
}
else if((grid(x,y)==="'")&&(((grid(x-1,y)==='-')&&(grid(x+1,y-1)==='_')&&!isSolidVLineOrJumpOrPoint(grid(x-1,y-1)))||((grid(x-1,y-1)==='_')&&(grid(x+1,y)==='-')&&!isSolidVLineOrJumpOrPoint(grid(x+1,y-1))))){pathSet.insert(new Path(Vec2(x,y-0.5),Vec2(x,y)));}
else if((grid(x,y)==='.')&&(((grid(x-1,y)==='_')&&(grid(x+1,y)==='-')&&!isSolidVLineOrJumpOrPoint(grid(x+1,y+1)))||((grid(x-1,y)==='-')&&(grid(x+1,y)==='_')&&!isSolidVLineOrJumpOrPoint(grid(x-1,y+1))))){pathSet.insert(new Path(Vec2(x,y),Vec2(x,y+0.5)));}}}
for(var y=0;y<grid.height;++y){for(var x=0;x<grid.width;++x){if(grid.isSolidHLineAt(x,y)){var A=Vec2(x,y);do{grid.setUsed(x,y);++x;}while(grid.isSolidHLineAt(x,y));var B=Vec2(x-1,y);if(!isVertex(grid(A.x-1,A.y))&&((isTopVertex(grid(A))&&isSolidVLineOrJumpOrPoint(grid(A.x-1,A.y+1)))||(isBottomVertex(grid(A))&&isSolidVLineOrJumpOrPoint(grid(A.x-1,A.y-1))))){++A.x;}
if(!isVertex(grid(B.x+1,B.y))&&((isTopVertex(grid(B))&&isSolidVLineOrJumpOrPoint(grid(B.x+1,B.y+1)))||(isBottomVertex(grid(B))&&isSolidVLineOrJumpOrPoint(grid(B.x+1,B.y-1))))){--B.x;}
if((A.x!==B.x)||(A.y!==B.y)){pathSet.insert(new Path(A,B));}
}}}
for(var i=-grid.height;i<grid.width;++i){for(var x=i,y=0;y<grid.height;++y,++x){if(grid.isSolidBLineAt(x,y)){var A=Vec2(x,y);do{grid.setUsed(x,y);++x;++y;}while(grid.isSolidBLineAt(x,y));var B=Vec2(x-1,y-1);var top=grid(A);var up=grid(A.x,A.y-1);var uplt=grid(A.x-1,A.y-1);if((up==='/')||(uplt==='_')||(up==='_')||(!isVertex(top)&&((top==='\\')||(top==='^'))&&(isSolidHLine(uplt)||isSolidVLine(uplt)))){A.x-=0.5;A.y-=0.5;}else if(isPoint(uplt)){A.x-=0.25;A.y-=0.25;}
var dnrt=grid(B.x+1,B.y+1);if((grid(B.x,B.y+1)==='/')||(grid(B.x+1,B.y)==='_')||(grid(B.x-1,B.y)==='_')||(!isVertex(grid(B))&&(isSolidHLine(dnrt)||isSolidVLine(dnrt)))){B.x+=0.5;B.y+=0.5;}else if(isPoint(dnrt)){B.x+=0.25;B.y+=0.25;}
pathSet.insert(new Path(A,B));}}}
for(var i=-grid.height;i<grid.width;++i){for(var x=i,y=grid.height-1;y>=0;--y,++x){if(grid.isSolidDLineAt(x,y)){var A=Vec2(x,y);do{grid.setUsed(x,y);++x;--y;}while(grid.isSolidDLineAt(x,y));var B=Vec2(x-1,y+1);var up=grid(B.x,B.y-1);var uprt=grid(B.x+1,B.y-1);if((up==='\\')||(up==='_')||(uprt==='_')||(!isVertex(grid(B))&&(isSolidHLine(uprt)||isSolidVLine(uprt)))){B.x+=0.5;B.y-=0.5;}else if(isPoint(uprt)){B.x+=0.25;B.y-=0.25;}
var dnlt=grid(A.x-1,A.y+1);if((grid(A.x,A.y+1)==='\\')||(grid(A.x-1,A.y)==='_')||(grid(A.x+1,A.y)==='_')||(!isVertex(grid(A))&&(isSolidHLine(dnlt)||isSolidVLine(dnlt)))){A.x-=0.5;A.y+=0.5;}else if(isPoint(dnlt)){A.x-=0.25;A.y+=0.25;}
pathSet.insert(new Path(A,B));}}}
for(var y=0;y<grid.height;++y){for(var x=0;x<grid.width;++x){var c=grid(x,y);if(isTopVertex(c)){if(isSolidHLine(grid(x-1,y))&&isSolidVLine(grid(x+1,y+1))){grid.setUsed(x-1,y);grid.setUsed(x,y);grid.setUsed(x+1,y+1);pathSet.insert(new Path(Vec2(x-1,y),Vec2(x+1,y+1),Vec2(x+1.1,y),Vec2(x+1,y+1)));}
if(isSolidHLine(grid(x+1,y))&&isSolidVLine(grid(x-1,y+1))){grid.setUsed(x-1,y+1);grid.setUsed(x,y);grid.setUsed(x+1,y);pathSet.insert(new Path(Vec2(x+1,y),Vec2(x-1,y+1),Vec2(x-1.1,y),Vec2(x-1,y+1)));}}
if(((c===')')||isPoint(c))&&(grid(x-1,y-1)==='.')&&(grid(x-1,y+1)==="\'")){grid.setUsed(x,y);grid.setUsed(x-1,y-1);grid.setUsed(x-1,y+1);pathSet.insert(new Path(Vec2(x-2,y-1),Vec2(x-2,y+1),Vec2(x+0.6,y-1),Vec2(x+0.6,y+1)));}
if(((c==='(')||isPoint(c))&&(grid(x+1,y-1)==='.')&&(grid(x+1,y+1)==="\'")){grid.setUsed(x,y);grid.setUsed(x+1,y-1);grid.setUsed(x+1,y+1);pathSet.insert(new Path(Vec2(x+2,y-1),Vec2(x+2,y+1),Vec2(x-0.6,y-1),Vec2(x-0.6,y+1)));}
if(isBottomVertex(c)){if(isSolidHLine(grid(x-1,y))&&isSolidVLine(grid(x+1,y-1))){grid.setUsed(x-1,y);grid.setUsed(x,y);grid.setUsed(x+1,y-1);pathSet.insert(new Path(Vec2(x-1,y),Vec2(x+1,y-1),Vec2(x+1.1,y),Vec2(x+1,y-1)));}
if(isSolidHLine(grid(x+1,y))&&isSolidVLine(grid(x-1,y-1))){grid.setUsed(x-1,y-1);grid.setUsed(x,y);grid.setUsed(x+1,y);pathSet.insert(new Path(Vec2(x+1,y),Vec2(x-1,y-1),Vec2(x-1.1,y),Vec2(x-1,y-1)));}}}}
for(var y=0;y<grid.height;++y){for(var x=0;x<grid.width-2;++x){if((grid(x,y)==='_')&&(grid(x+1,y)==='_')){var A=Vec2(x-0.5,y+0.5);var lt=grid(x-1,y);var ltlt=grid(x-2,y);if((lt==='|')||(grid(x-1,y+1)==='|')||(lt==='.')||(grid(x-1,y+1)==="'")){A.x-=0.5;if((lt==='.')&&((ltlt==='-')||(ltlt==='.'))&&(grid(x-2,y+1)==='(')){A.x-=0.5;}}else if(lt==='/'){A.x-=1.0;}
if((lt==='(')&&(ltlt==='(')&&(grid(x,y+1)==="'")&&(grid(x,y-1)==='.')){A.x+=0.5;}
lt=ltlt=undefined;do{grid.setUsed(x,y);++x;}while(grid(x,y)==='_');var B=Vec2(x-0.5,y+0.5);var c=grid(x,y);var rt=grid(x+1,y);var dn=grid(x,y+1);if((c==='|')||(dn==='|')||(c==='.')||(dn==="'")){B.x+=0.5;if((c==='.')&&((rt==='-')||(rt==='.'))&&(grid(x+1,y+1)===')')){B.x+=0.5;}}else if((c==='\\')){B.x+=1.0;}
if((c===')')&&(rt===')')&&(grid(x-1,y+1)==="'")&&(grid(x-1,y-1)==='.')){B.x+=-0.5;}
pathSet.insert(new Path(A,B));}}}}
function findDecorations(grid,pathSet,decorationSet){function isEmptyOrVertex(c,k){return isEmpty(c)||isVertex(c)||(c==k);}
function onLine(up,dn,lt,rt){return(isEmptyOrVertex(dn,'|')&&isEmptyOrVertex(up,'|')&&isEmptyOrVertex(rt,'-')&&isEmptyOrVertex(lt,'-'));}
for(var x=0;x<grid.width;++x){for(var j=0;j<grid.height;++j){var c=grid(x,j);var y=j;if(isJump(c)){if(pathSet.downEndsAt(x,y-0.5)&&pathSet.upEndsAt(x,y+0.5)){decorationSet.insert(x,y,c);grid.setUsed(x,y);}}else if(isPoint(c)){var up=grid(x,y-1);var dn=grid(x,y+1);var lt=grid(x-1,y);var rt=grid(x+1,y);if(pathSet.rightEndsAt(x-1,y)||pathSet.leftEndsAt(x+1,y)||pathSet.downEndsAt(x,y-1)||pathSet.upEndsAt(x,y+1)||pathSet.upEndsAt(x,y)||pathSet.downEndsAt(x,y)||onLine(up,dn,lt,rt)){decorationSet.insert(x,y,c);grid.setUsed(x,y);}}else{var dx=0;if((c==='>')&&(pathSet.rightEndsAt(x,y)||pathSet.horizontalPassesThrough(x,y))){if(isPoint(grid(x+1,y))){dx=-0.5;}
decorationSet.insert(x+dx,y,'>',0);grid.setUsed(x,y);}else if((c==='<')&&(pathSet.leftEndsAt(x,y)||pathSet.horizontalPassesThrough(x,y))){if(isPoint(grid(x-1,y))){dx=0.5;}
decorationSet.insert(x+dx,y,'>',180);grid.setUsed(x,y);}else if(c==='^'){if(pathSet.upEndsAt(x,y-0.5)){decorationSet.insert(x,y-0.5,'>',270);grid.setUsed(x,y);}else if(pathSet.upEndsAt(x,y)){decorationSet.insert(x,y,'>',270);grid.setUsed(x,y);}else if(pathSet.diagonalUpEndsAt(x+0.5,y-0.5)){decorationSet.insert(x+0.5,y-0.5,'>',270+DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.diagonalUpEndsAt(x+0.25,y-0.25)){decorationSet.insert(x+0.25,y-0.25,'>',270+DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.diagonalUpEndsAt(x,y)){decorationSet.insert(x,y,'>',270+DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.backDiagonalUpEndsAt(x,y)){decorationSet.insert(x,y,c,270-DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.backDiagonalUpEndsAt(x-0.5,y-0.5)){decorationSet.insert(x-0.5,y-0.5,c,270-DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.backDiagonalUpEndsAt(x-0.25,y-0.25)){decorationSet.insert(x-0.25,y-0.25,c,270-DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.verticalPassesThrough(x,y)){decorationSet.insert(x,y-0.5,'>',270);grid.setUsed(x,y);}}else if(c==='v'){if(pathSet.downEndsAt(x,y+0.5)){decorationSet.insert(x,y+0.5,'>',90);grid.setUsed(x,y);}else if(pathSet.downEndsAt(x,y)){decorationSet.insert(x,y,'>',90);grid.setUsed(x,y);}else if(pathSet.diagonalDownEndsAt(x,y)){decorationSet.insert(x,y,'>',90+DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.diagonalDownEndsAt(x-0.5,y+0.5)){decorationSet.insert(x-0.5,y+0.5,'>',90+DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.diagonalDownEndsAt(x-0.25,y+0.25)){decorationSet.insert(x-0.25,y+0.25,'>',90+DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.backDiagonalDownEndsAt(x,y)){decorationSet.insert(x,y,'>',90-DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.backDiagonalDownEndsAt(x+0.5,y+0.5)){decorationSet.insert(x+0.5,y+0.5,'>',90-DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.backDiagonalDownEndsAt(x+0.25,y+0.25)){decorationSet.insert(x+0.25,y+0.25,'>',90-DIAGONAL_ANGLE);grid.setUsed(x,y);}else if(pathSet.verticalPassesThrough(x,y)){decorationSet.insert(x,y+0.5,'>',90);grid.setUsed(x,y);}}}}}}
var grid=makeGrid(diagramString);var pathSet=new PathSet();var decorationSet=new DecorationSet();findPaths(grid,pathSet);findDecorations(grid,pathSet,decorationSet);var svg='<svg class="diagram" xmlns="http://www.w3.org/2000/svg" version="1.1" height="'+
((grid.height+1)*SCALE*ASPECT)+'" width="'+((grid.width+1)*SCALE)+'"';if(alignmentHint==='floatleft'){svg+=' style="float:left;margin: 15px 30px 15px 0px;"';}else if(alignmentHint==='floatright'){svg+=' style="float:right;margin: 15px 0px 15px 30px;"';}else if(alignmentHint==='center'){svg+=' style="margin: 0px auto 0px auto;"';}
svg+='><g transform="translate('+Vec2(1,1)+')">\n';if(DEBUG_SHOW_GRID){svg+='<g style="opacity:0.1">\n';for(var x=0;x<grid.width;++x){for(var y=0;y<grid.height;++y){svg+='<rect x="'+((x-0.5)*SCALE+1)+'" + y="'+((y-0.5)*SCALE*ASPECT+2)+'" width="'+(SCALE-2)+'" height="'+(SCALE*ASPECT-2)+'" style="fill:';if(grid.isUsed(x,y)){svg+='red;';}else if(grid(x,y)===' '){svg+='gray; opacity:0.05';}else{svg+='blue;';}
svg+='"/>\n';}}
svg+='</g>\n';}
svg+=pathSet.toSVG();svg+=decorationSet.toSVG();if(!DEBUG_HIDE_PASSTHROUGH){svg+='<g transform="translate(0,0)">';for(var x=0;x<grid.width;++x){for(var y=0;y<grid.height;++y){var c=grid(x,y);if((c!==' ')&&!grid.isUsed(x,y)){svg+='<text text-anchor="middle" x="'+(x*SCALE)+'" y="'+(4+y*SCALE*ASPECT)+'" style="fill:#000;">'+escapeHTMLEntities(c)+'</text>';}}}
svg+='</g>';}
if(DEBUG_SHOW_SOURCE){svg+='<g transform="translate(2, 2)">\n';for(var x=0;x<grid.width;++x){for(var y=0;y<grid.height;++y){var c=grid(x,y);if(c!==' '){svg+='<text text-anchor="middle" x="'+(x*SCALE)+'" y="'+(4+y*SCALE*ASPECT)+'" style="fill:#F00;font-family:Menlo,monospace;font-size:12px;text-align:center">'+escapeHTMLEntities(c)+'</text>';}}}
svg+='</g>';}
svg+='</g></svg>';svg=svg.rp(new RegExp(HIDE_O,'g'),'o');return svg;}
if(!window.alreadyProcessedMarkdeep){window.alreadyProcessedMarkdeep=true;window.markdeep=Object.freeze({formatDiagram:diagramToSVG,stylesheet:DIAGRAM_STYLESHEET,});function toArray(list){return Array.prototype.slice.call(list);}
toArray(document.getElementsByClassName('diagram')).concat(toArray(document.getElementsByTagName('diagram'))).forEach(function(element){var src=unescapeHTMLEntities(element.innerHTML);src=src.rp(/(:?^[ \t]*\n)|(:?\n[ \t]*)$/g,'');element.outerHTML='<center class="md">'+diagramToSVG(removeLeadingSpace(src),'')+'</center>';});document.head.innerHTML=window.markdeep.stylesheet+document.head.innerHTML;}})();
