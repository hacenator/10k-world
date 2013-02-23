/*
	Copyright (c) 2010, Mikheev Rostislav and The eCator Team	
*/

var w;
var canv; 

var fps = 10;

var todeg = 180/Math.PI;
var torad = Math.PI/180;

function d(x1, y1, x2, y2) {
	return Math.sqrt(Math.abs(Math.pow((x2-x1),2)+Math.pow((y2-y1),2)));
}

function Time() {
	return new Date().getTime();
} 

function isObject(val) {
	return (typeof(val)=='object');
}

function Floor(val) {
	return Math.floor(val);
}

function Random(max) {
	return Floor(Math.random()*max);	
}

function Message(msg) {
	document.getElementById('history').value = msg;	
}

function timer(ms) {
	function two(x) {return ((x>9)?"":"0")+x;}
	function three(x) {return ((x>99)?"":"0")+((x>9)?"":"0")+x;}
	
	var sec = Floor(ms/1000);
	ms = ms % 1000;
	t = three(ms);

	var min = Floor(sec/60);
	sec = sec % 60;
	t = two(sec) + ":" + t;

	var hr = Floor(min/60);
	min = min % 60;
	t = two(min) + ":" + t;

	var day = Floor(hr/60);
	hr = hr % 60;
	t = two(hr) + ":" + t;
	
	t = day + ":" + t;

	return t;
}

function GenName() {
	var sy = {
		'W' : ["%C%%F%","%C%%F%","%C%%D%%F%","%C%%D%%F%","%I%%F%","%I%%C%%F%"],
		'I' : ["mi","jo","bo","st","ol"],
		'C' : ["ch","d","f","g","h","j","k","l","m","n","p","qu","r","s","sh","t","th","v","w","y"],
		'F' : ["ob","el","on","an","av","eg","y","en","ei","etr","ery"],
		'D' : ["aw","ei","ow","ou","ie","ea","ai","oy"]
	};
	
	var str = "%W%";
	var p = str.search(/%(\w+)%/);	
	while(p != -1) {
		var c = str.charAt(p+1);
		str = str.replace('%'+c+'%', sy[c][Floor(Random(sy[c].length))]);		
		p = str.search(/%(\w+)%/);
	}
	
	return str[0].toUpperCase() + str.substring(1);
}


function World() {
	var _thing;
	var _count;
	var _num;
	var _start;
	var _max;
	
	this.Init = function() {
		_num = _count = _max = 0;
		_thing = [];
		_start = Time();

		for (i=0; i < 10; i++)
			this.AddThing(Random(20)+300, Random(20)+220);
		
		return this;
	};
	
	this.GetThing = function(id) {
		return _thing[id];
	}
	
	this.InfectAll = function() {
		for (i = 0; i < _thing.length; i++)			
			if (_thing[i] !=null)
				_thing[i].Infect(true);
	}

	this.CureAll = function() {
		for (i = 0; i < _thing.length; i++)			
			if (_thing[i] !=null)
				_thing[i].Infect(false);
	}
	
	this.KillAll = function() {
		for (i = 0; i < _thing.length; i++)			
			if (_thing[i] !=null)
				_thing[i].Kill();
	}
		
	this.AddThing = function(x, y) {
		if (x == undefined) x = Random(620) + 10;
		if (y == undefined) y = Random(460) + 10;
		_thing[_count] =  (new Creature().Init(_count, x, y, new Generator().Generate(0.5, 0.5)));
		this.LinkThing(_count);
		_count++;		
		_num++;
		if (_num > _max) 
			_max = _num;
		return _count - 1;
	};
	
	this.DelThing = function(id) {
		_thing[id] = null;
		_num--;
	}
	
	this.LinkThing = function(id) {
		for (i = 0; i < _thing.length; i++) {			
			if (_thing[i])
				_thing[i].Link(id);
			if (_thing[id])
				_thing[id].Link(i);
		}
	}
	
	this.Draw = function() {
		document.getElementById('count').innerHTML = _num + " creatures";
		document.getElementById('born').innerHTML = _thing.length + " born";
		document.getElementById('max').innerHTML = _max + " maximum";
		if (_num) {
			var _left = Time() - _start;		
			document.getElementById('time').innerHTML = timer(_left);			
			for (var i = 0; i < _thing.length; i++) {			
				if (_thing[i] != null) _thing[i].Draw();
			}
		}
	};
	
	this.Logic = function() {
		for (i = 0; i < _thing.length; i++)			
			if (_thing[i]) _thing[i].Logic();
	}
}

function Generator() {
	var _depthMax;
	var _dirtyMax;
	var _hardness;
	var _dirty = 0;	
	var _skeleton = {_root: 0, _jCount: 0, _depth: 0};
	
	this.Generate = function(size, hardness) {
		_depthMax = 8 * hardness;
		_dirtyMax = 6 * hardness;
		_hardness = 1 - size;
				
		_skeleton._root = GenLevel(1);
		_skeleton._depth++;
		
		return _skeleton;
	}
	
	function GenLevel(depth) {
		var root = {childs: [0,0,0,0,0], angle: 360};
		
		if (_skeleton._depth < depth) _skeleton._depth = depth;
		
		if ((depth <= _depthMax) && (_dirty <= _dirtyMax))
			for (i=0; i < 5; i++)
				if (Math.random() >= _hardness)	{
					_skeleton._jCount++;
					root.childs[i] = GenLevel(depth + 1);
					_dirty++;
				}
		return root;
	}
}

function Creature() {
	var A_I = 0;
	var A_M = 1;
	var A_A = 3;
	var A_H = 6;	
		
	var _name;
	var _id;
	var _x;
	var _y;
	var _angle;
	
	var _skeleton;
	var _mass;
	
	var _full_age;
	var _age;
	var _health;
	var _hungry;
	var _pregnancy;
	var _danger;
	var _actions;
	var _do;
	var _infected;
	
	var _attitude;
	
	this.Init = function(id, x, y, skeleton) {				
		_id = id;
		_name = GenName();
		
		_hungry = 40;
		_pregnancy = _angle = _danger = _full_age = _age = 0;
		_health = 100;	
		
		_x = x;
		_y = y;
	
		_infected = (Random(10) < 1);
		
		_attitude = [];
		_actions = [];
			
		_do = {type: A_I};	

		_skeleton = skeleton;
		_mass = Math.random() + 0.3;
		
		Message(_name + ' is born! :)');
		
		return this;
	}
	
	this.Alive = function() {
		return (_health > 0);
	}

	this.Infected = function() {
		return _infected;
	}

	this.Infect = function(value) {
		_infected = value;
	}

	this.Kill = function() {
		_health = 0;
	}
	
	this.Nip = function(damage, id) {
		if (id == _id)
			Message(_name + 'bit off a part of himself! 0_0');	
		
		_mass -= damage * 0.05;
	
		if (_health > 0) {
			_health -= damage * 10;
			_attitude[id] -= 1;
			_danger += 100 - _health;
			if (_danger < 80) {
				ClearActions();
				PushAction(A_A, id);
			}
		}
	}
	
	this.SetAttitude = function(id, value) {
		_attitude[id] = value;
	}
	
	this.GetPos = function() {
		return {x: _x, y: _y};
	}
	
	this.Draw = function() {	
		canv.fillStyle = canv.strokeStyle = (_health > 0 ? (_infected ? "#F80" : "#0F0") : "#888");

		canv.save();			
		canv.translate(_x, _y);
		canv.rotate(_angle);		
		DrawBone(_skeleton._root, 1);						
		canv.restore();
	}
		
	function Azimut(x, y) {
		var a = 0;
	
		var ab = d(_x, _y, x, y);
		var bc = d(x, y, _x, _y + 0.1);
		var ac = 0.1;		
			
		if (ab > 0 && bc > 0) {
			a = Math.acos((Math.pow(ab,2) + Math.pow(ac,2) - Math.pow(bc,2)) / (2 * ab * ac));
			if (_x < x)
				a = - a;
		}
		a += 90 * torad;
		return a;
	}
	
	function Speed() {
		return 35 / _mass;	
	}
	
	function LookTo(x, y) {
		var s = (1 / fps) * (Speed() * 0.05) * todeg;
		var rot = Azimut(x, y) * todeg;
		var deltaU = (_angle * todeg - rot);
		var deltaV = (rot - _angle * todeg);
		
		if (deltaV < deltaU)
			delta = -deltaV;
		else
			delta = deltaU;
			
		if (s >= Math.abs(delta)) {
			_angle = rot * torad;
			if (_angle > 360) _angle -= 360;
		
			return true;
		} else {
			if (delta < 0)
				_angle += s * torad;
			else
				_angle -= s * torad;
			if (_angle > 360) _angle -= 360;
			
			return false;
		}
	}
	
	function inPos(x, y) {
		return (_x > x - 10 && _x < x + 10 && _y > y - 10 && _y < y + 10);
	}
	
	function MoveTo(x, y) {		
		var v = {x:0, y:0};
		var e = {x:0, y:0};
		var f = {x:Math.abs(x-_x), y:Math.abs(y-_y)};
		var len = d(_x, _y, x, y);
		
		if (len <= 5)
			return true;
		
		v.x = Math.abs(f.x) / len;
		v.y = Math.abs(f.y) / len;
		
		s = (1 / fps) * Speed();
		
		e.x = v.x * s;
		e.y = v.y * s;
		_x = _x + e.x * (x < _x ? -1 : 1);
		_y = _y + e.y * (y < _y ? -1 : 1);
		
		return false;
	}
	
	this.Link = function(id) {
		_attitude[id] = (id == _id ? 100 : 0);
	}
	
	function DrawBone(root, level) {				
		canv.save();
		Circle(0, 0, _mass * 1.5 * level);
		if (level < 1 - (_full_age + 1) / 20) {
			canv.restore();
			return;			
		}

		for (var i = 0; i < 5; i++) {
			if (root.childs[i] != 0) {
				canv.save();
				Bone(root, i, level, false);
				canv.restore();
				
				canv.save();
				Bone(root, i, level, true);
				canv.restore();
			}
		}
		canv.restore();
	}
	
	function Bone(root, angle, level, negative) {			
		canv.save();	
		ang = (angle * 45) * torad * (negative ? -1 : 1);
		canv.rotate(-ang);
		canv.beginPath();
		canv.lineWidth = _mass * 0.6;
		canv.moveTo(0, 0);
		canv.lineTo(_mass * 4, 0);	
		canv.stroke();
		canv.save();
		canv.translate(_mass * 4, 0);
		canv.rotate(ang);		
		DrawBone(root.childs[angle], level * 0.8);
		canv.restore();												
		canv.restore();
	}
	
	function Circle(x, y, radius) {
		radius = Math.abs(radius);
		canv.beginPath();
		canv.arc(x, y, radius, 0, Math.PI*2, true);
		canv.closePath();
		canv.fill();
	}	
	
	function PopAction() {
		var a = _actions.pop();
		_do = (a ? a : {type: A_I});
	}
	
	function ClearActions() {
		_actions = [];
	}
	
	function PushAction(type, target) {
		_actions.push({type: type, target: target});
	}
	
	this.PushAction = function(type, target) {	
		_actions.push({type: type, target: target});
	}
	
	function LifeCycle() {
		if (_health > 0) {
			if (_pregnancy <= 0 && _mass >= (_full_age + 1) * 1.2) {
				Message(_name + ' acquire offspring!');
				for (var i=0; i < (_full_age + 1) * 2; i++) {
					var id = w.AddThing(_x, _y);
					_attitude[id] = 50;
					if (_infected && (Random(10) < 4))
						w.GetThing(id).Infect(true);
				}
				_pregnancy = 50;
				_mass -= 0.15;
			}
			
			_hungry += _mass * 0.1;
			if (_danger > 0) _danger -= 1;
			_age += 0.005;
			if (Floor(_age) > _full_age) {
				_full_age = Floor(_age);
				Message(_name + ' Happy Birthday! Is ' + _full_age + ' years old!');
				_mass += 0.1; 
			}
			if (_pregnancy > 0) _pregnancy -= 1;
			if (_health < 100) _health += 1 * _full_age / 100;
			if (_hungry > 100) _health = 0;					
			if (_health <=0) Message(_name + ' died :(');
			if (_infected) _mass -= _mass * 0.005;
			Critical();			
		} else {
			_mass -= 0.01;
		}
		
		if (_mass < 0.3) {
			Message(_name + ' died! :(');
			w.DelThing(_id);
			delete this;
		}
	}
	
	function FindNear(maxrelations, onlydead) {
		var id = -1;
		var val = 1000;
		for (i = 0; i < _attitude.length; i++) {
			if (i != _id && _attitude[i] < maxrelations) {
				var thing = w.GetThing(i);
				if (thing) {
					if (onlydead && thing.Alive())
						continue;
					var pos = thing.GetPos();
					var dist = d(_x, _y, pos.x, pos.y); 
					if (dist < val) {
						val = dist;
						id = i;
					}
				}
			}
		}
		return id;	
	}
	
	function FindFood() {
		var food = FindNear(0, true);
		if (food == -1)
			food = FindNear(0, false);
		if (food == -1)
			food = FindNear(100, false);
		
		return food;	
	}
	
	this.Logic = function() {
		LifeCycle();		
		if (_pregnancy <= 0 && _health > 0)
			switch(_do.type) {
				case A_H:
				case A_M:
					var x = 0;
					var y = 0;
					if (isObject(_do.target)){
						x = _do.target.x;
						y = _do.target.y;					
					} else {
						creature = w.GetThing(_do.target);
						if (creature) {
							pos = creature.GetPos();
							x = pos.x;
							y = pos.y;
						} else {
							ClearActions();
							_do = {type: A_I};
						}
					}
					
					if (LookTo(x, y))
						if (MoveTo(x, y))
							PopAction();
					break;				
				case A_A:
					creature = w.GetThing(_do.target);
					if (creature) {
						pos = creature.GetPos();
						if (inPos(pos.x, pos.y)) {
							if (creature != null) {
								var damage = _mass;
								creature.Nip(damage, _id);
								if (!_infected) {
									if (_infected = creature.Infected())
										Message(_name + ' picked infection. X_X');
								}
								_mass += damage * 0.05;
								if (_health < 100) _health += 0.5 * damage;
								if (_hungry > 0) _hungry -= 10;
							} else {
								ClearActions();
								_do = {type: A_I};	
							}
						} else {
							PushAction(A_A,_do.target);
							PushAction(A_H,_do.target);
							PopAction();
						}
					} else {
						ClearActions();
						_do = {type: A_I};	
					}			
					break;
				case A_I:
					PopAction();
					if (_do.type == A_I) {
						PushAction(A_M, {x: Random(640), y: Random(480)});
						PopAction();
					}
					break;				
			}
	}
	
	function Critical() {
		if (_danger > 80) {
			if (_do.type != A_M) {
				ClearActions();
				PushAction(A_M, {x: Random(620) + 10, y: Random(460) + 10});
			}
		}
					
		if (_mass < _full_age / 2 || _health < 51 || _hungry > 51) {			
			if (_do.type != A_H && _do.type != A_A) {
				var food = FindFood();
				if (food > -1) {
					Message(_name + ' wants to eat.');
					PushAction(A_A, food);
				} else {
					Message(_name + ' now is alone, and preparing for death.');
				}
				PopAction();
			}
		}
	}
}

var cont = document.getElementById('canv');
cont.onclick = function(e) { w.AddThing(e.pageX - 200, e.pageY); }
canv = cont.getContext('2d');

w = new World().Init();

function l() {
	w.Logic();
	setTimeout('l()', 100);
}

function r() {
	try {
		canv.clearRect(0, 0, 640, 480);	
		w.Draw();
		setTimeout('r()', 1000/fps);
	} catch(err) {
		alert("Draw error, again.\n Sorry!");
	}
}
r(); l();