class Show{
	constructor(canvas){
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
	}
	init(){
		let width = Math.floor(window.innerWidth / 1.5);
		let height = Math.floor(window.innerHeight / 1.5);
		this.canvas.width = width;
		this.canvas.height = height;
		game.width = width;
		game.height = height;
	}
	clear(){
		this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
	}
	rect(options, blur = false){ // x, y, w, h, color
		this.ctx.beginPath();
			this.ctx.rect(options.x, options.y, options.w, options.h);
			this.ctx.fillStyle = options.color;
			this.ctx.fill();
		this.ctx.closePath();
	}
	circle(options){ // x, y, radius, color
		this.ctx.beginPath();
			this.ctx.arc(options.x, options.y, options.radius, 0, 2 * Math.PI, true);
			this.ctx.fillStyle = options.color;
			this.ctx.fill();
		this.ctx.closePath();
	}
}

class Config{
	constructor(){
		// характеристики змейки
		this.x              = 100;
		this.y              = 100;
		this.speed          = 2;
		this.colorSnake     = '#0a6e23';
		this.colorHeadSnake = 'lime';
		this.widthSnake     = 10;
		this.initialLength  = 64;
		// настройки ягод
		this.berryWidth       = 20;
		this.pointsForBerries = 10;
		this.numbersOfBerrys  = 25;
		this.colorBerrys      = '#f2073a';
		// настройки препятствий
		this.numberOfObstacles = 30;
		this.obstacleWidth     = 10;
		this.maxObsatcleLength = 200;
		this.colorObstacle     = '#4aac8a';
		// прочие настройки
		this.speedIncrease  = 0.05;
	}
}

class Game{
	constructor(){
		this.points = 0;
		this.pause = true;
		this.newGame = false;
		this.berries = [];
		this.width = 0;
		this.height = 0;
	}
	stopGame(){
		if(this.newGame) return;
		if(!this.pause){
			this.pause = true;
		}else{
			this.pause = false;
			loop();
		}
	}
	intersects(a, b){
		// нашел это решение в Интернете, работает отлично
		// проверяем два прямоугольника на пересечение
		return ( ((( a.x>=b.x && a.x<=b.x1 )||( a.x1>=b.x && a.x1<=b.x1  )) && (( a.y>=b.y && a.y<=b.y1 )||( a.y1>=b.y && a.y1<=b.y1 )))||((( b.x>=a.x && b.x<=a.x1 )||( b.x1>=a.x && b.x1<=a.x1  )) && (( b.y>=a.y && b.y<=a.y1 )||( b.y1>=a.y && b.y1<=a.y1 ))) )||(((( a.x>=b.x && a.x<=b.x1 )||( a.x1>=b.x && a.x1<=b.x1  )) && (( b.y>=a.y && b.y<=a.y1 )||( b.y1>=a.y && b.y1<=a.y1 ) ) )||((( b.x>=a.x && b.x<=a.x1 )||( b.x1>=a.x && b.x1<=a.x1  )) && (( a.y>=b.y && a.y<=b.y1 )||( a.y1>=b.y && a.y1<=b.y1 ))));
	}
	checkForIntersection(elem, array, returnIndex){
		if(!array.length) return false;
		for(let i = 0; i < array.length; i++){
			let item = array[i];
			if(this.intersects(elem, item)){
				if(returnIndex) return i; // возвращаем индекс ягоды
				return true;
			}
		}
		return false;
	}
	headCrossesBody(){ // проверяем, не врезалась ли змейка в себя
		if(snake.canСhecked){
			let head = snake.rects[snake.rects.length - 1];

			// появляется ошибка: змейка вдруг останавливается
			// зная, что змейка не сможет врезаться в пару сегментов
			// перед головой, чуть ниже добавляем -3

			for(let i = 0; i < snake.rects.length - 3; i++){ // не используем метод checkForIntersection, потомучто голова включена в 
				let item  = snake.rects[i];					 // массив rects
				if(this.intersects(item, head)){
					this.newGame = true;
					return true;
				}
			}
		}
	}
	headCrossesObstacles(){
		if(snake.canСhecked){
			let head = snake.rects[snake.rects.length - 1];

			for(let i = 0; i < obstacles.rects.length; i++){
				let item  = obstacles.rects[i];
				if(this.intersects(item, head)){
					this.newGame = true;
					return true;
				}
			}
		}
	}
	startANewGame(){
		this.points = 0;
		this.pause = false; // при запуске новой игры пауза снята
		this.newGame = false;
		this.berries = [];

		show.clear();

		snake.rects = [];
		snake.direction = 'right';
		snake.init(config, show);

		snake.draw(show);

		obstacles.rects = [];
		obstacles.generate();
	}
	generateBerries(){
		if(this.berries.length < config.numbersOfBerrys){
			let x = this.randomInt(0, this.width - config.berryWidth);
			let y = this.randomInt(0, this.height - config.berryWidth);
	
			let berry = new Berry({
				x: x,
				y: y,
				w: config.berryWidth,
				h: config.berryWidth,
				color: config.colorBerrys
			});
			
			// проверяем ягоду на пересечение со змейкой и с препятствиями
			if(!this.checkForIntersection(berry, snake.rects, false) && !this.checkForIntersection(berry, obstacles.rects, false)){
				this.berries.push(berry);
			}
		}
	}
	drawBerry(){
		this.berries.forEach(item => {
			item.draw(show);
		});
	}
	randomInt(min, max){
		let rand = min - 0.5 + Math.random() * (max - min + 1);
		return Math.round(rand);
	}
}

class User{
	constructor(){}
	init(snake, game){
		addEventListener('keydown', (e) => {
			switch(e.code){
				case 'KeyW':
					snake.turn('up');
					break;
				case 'KeyD':
					snake.turn('right');
					break;
				case 'KeyS':
					snake.turn('down');
					break;
				case 'KeyA':
					snake.turn('left');
					break;
				case 'KeyP': // пауза
					game.stopGame();
					break;
				case 'Space': 
				// если змейка во что-то врезалась, то запускается новая игра
				// иначе игра ставится или снимается с паузы		
					if(game.newGame){
						game.startANewGame();
						loop();
					}else{
						game.stopGame();
					}
					break;
			}
		});
	}
}

class Snake{
	constructor(){
		this.rects = [];
		this.direction = 'right';
		this.speed = null;
		this.width = null;
		this.canShorten = true; // можно ли укорачивать змейку
		this.canСhecked = true; // стоит ли проверять, врезалась ли змейка в себя
	}
	init(config, show){
		this.speed = config.speed;
		this.width = config.widthSnake;

		this.rects.push(new Rect({
			x: config.x,
			y: config.y,
			w: config.initialLength - config.widthSnake,
			h: config.widthSnake,
			color: config.colorSnake,
			direction: this.direction
		}))
		this.rects.push(new Rect({
			x: config.x + config.initialLength - config.widthSnake,
			y: config.y,
			w: config.widthSnake,
			h: config.widthSnake,
			color: config.colorHeadSnake,
			direction: this.direction
		}))
	}
	draw(show){
		this.rects.forEach(item => {
			item.draw(show);
		});
	}
	move(){
		this.shortenTail();
		this.lengthen();
		this.moveHead();
		this.removeTail();
	}
	moveHead(){
		let head = this.rects[this.rects.length - 1];
		let dir = head.direction;
		switch(dir){
			case 'right':
				head.x += this.speed;
				head.x1 += this.speed;
				break;
			case 'down':
				head.y += this.speed;
				head.y1 += this.speed;
				break;
			case 'left':
				head.x -= this.speed;
				head.x1 -= this.speed;
				break;
			case 'up':
				head.y -= this.speed;
				head.y1 -= this.speed;
				break;
		}
	}
	shortenTail(){ // укорачиваем хвост в зависимости от его направления
		if(!this.canShorten) return;
		let rect = this.rects[0];
		
		let dir = rect.direction;
		switch(dir){
			case 'right':
				rect.x += this.speed;
				rect.w -= this.speed;
				break;
			case 'down':
				rect.y += this.speed;
				rect.h -= this.speed;
				break;
			case 'left':
				rect.w -= this.speed;
				rect.x1 -= this.speed;
				break;
			case 'up':
				rect.h -= this.speed;
				rect.y1 -= this.speed;
				break;
		}
	}
	lengthen(){
		let i = this.rects.length - 2; // индекс предпоследнего сегмента
		let rect = this.rects[i];
		let dir = rect.direction;
		switch(dir){
			case 'right':
				rect.w += this.speed;
				rect.x1 += this.speed;
				break;
			case 'down':
				rect.h += this.speed;
				rect.y1 += this.speed;
				break;
			case 'left':
				rect.x -= this.speed;
				rect.w += this.speed;
				break;
			case 'up':
				rect.y -= this.speed;
				rect.h += this.speed;
				break;
		}
	}
	turn(newDir){
		if(!this.canTurn(newDir)) return;
		let head = this.rects[this.rects.length - 1];

		this.direction = head.direction = newDir;
		this.moveHead();
		this.shortenTail();
		this.removeTail();

		switch(newDir){
			case 'left':
				this.addRect({
					x: head.x + head.w,
					y: head.y,
					w: this.speed,
					h: head.h,
					direction: newDir
				});
				break;
			case 'right':
				this.addRect({
					x: head.x - this.speed,
					y: head.y,
					w: this.speed,
					h: head.h,
					direction: newDir
				});
				break;
			case 'down':
				this.addRect({
					x: head.x,
					y: head.y - this.speed,
					w: head.w,
					h: this.speed,
					direction: newDir
				});
				break;
			case 'up':
				this.addRect({
					x: head.x,
					y: head.y + head.h,
					w: head.w,
					h: this.speed,
					direction: newDir
				});
				break;
		}
	}
	canTurn(newDir){
		return (this.direction == 'left' && newDir == 'right' 
			|| this.direction == 'down' && newDir == 'up'
			|| this.direction == 'right' && newDir == 'left'
			|| this.direction == 'up' && newDir == 'down'
			|| this.direction == newDir) ? false : true;
	}
	removeTail(){ // удаляем хвост змейки, если его площадь равна 0
		let rect = this.rects[0];
		let s = rect.w * rect.h;
		if(s <= 0) this.rects.shift();
	}
	addRect(options){ // x, y, w, h, dir
		// добавляем еще один сегмент предпослендним элементом, т.е. перед головой змейки
		let i = this.rects.length - 1;
		let rect = new Rect({
			x: options.x,
			y: options.y,
			w: options.w,
			h: options.h,
			color: this.rects[0].color, // цвет змейки
			direction: options.direction
		});
		this.rects.splice(i, 0, rect);
	}
	eatABerry(){
		let head = this.rects[this.rects.length - 1];
		let i = game.checkForIntersection(head, game.berries, true); // индекс ягоды
		if(typeof i == 'number'){	
			let berry = game.berries[i];

			berry.raiseOfPoints();
			berry.enlargeTail();

			this.speed += config.speedIncrease;
			game.berries.splice(i, 1);
			this.canShorten = false;
			this.canСhecked = false;
		}
	}
}

class Obstacles{
	constructor(){
		this.rects = [];
	}
	generate(){
		for(let i = 0; i < config.numberOfObstacles;){
			let rect = this.createRect();

			// проверяем блок препятствий на пересечение со змейкой и с ягодами
			if(!game.checkForIntersection(rect, snake.rects, false) && !game.checkForIntersection(rect, game.berries, false)){
				this.rects.push(rect);
				i++;
			}			
		}
	}
	createRect(){
		let dir = game.randomInt(0, 1); // 0 - горизонтальный блок, 1 - вертикальный блок
		let x = game.randomInt(0, game.width - config.obstacleWidth);
		let y = game.randomInt(0, game.height - config.obstacleWidth);
		let w, h;
		if(dir){
			h = game.randomInt(config.maxObsatcleLength / 4, config.maxObsatcleLength);
			w = config.obstacleWidth;
			if(y + h > game.height) h = game.height - y;
		}else{
			h = config.obstacleWidth;
			w = game.randomInt(config.maxObsatcleLength / 4, config.maxObsatcleLength);
			if(x + w > game.width) w = game.width - x;
		}
		let rect = new Rect({
			x: x,
			y: y,
			w: w,
			h: h,
			color: config.colorObstacle
		});
		return rect;
	}
	draw(){
		this.rects.forEach(item => {
			item.draw(show);
		});
	}
}

class Rect{
	constructor(options){ // x, y, w, h, color, // direction
		this.x = options.x;
		this.y = options.y;
		this.w = options.w;
		this.h = options.h;
		this.x1 = options.x + options.w;
		this.y1 = options.y + options.h;
		this.color = options.color;
		this.direction = options.direction;
	}
	draw(show, blur = false){
		show.rect(this, blur);
	}
}

class Berry extends Rect{
	constructor(options){
		super(options);
	}
	raiseOfPoints(){
		game.points += config.pointsForBerries;
	}
	enlargeTail(){
		snake.canShorten = false; // на один кадр будем запрещать укорачивать хвост, так он увеличиться
	}
}

let config = new Config();

let game = new Game();

let show = new Show(document.querySelector('canvas'));
show.init();

let snake = new Snake();
snake.init(config, show);

let user = new User();
user.init(snake, game);

let obstacles = new Obstacles();
obstacles.generate();

snake.draw(show);

let lastLoop = new Date();
findFPS = () => { 
    let thisLoop = new Date();
    fps = 1000 / (thisLoop - lastLoop);
    fps = fps.toFixed(1);
    lastLoop = thisLoop;
    drawText1(fps, 100, 20);
}
function drawText1(string, x, y){
	show.ctx.fillStyle = "red";
	show.ctx.font = "20px Verdana";
	show.ctx.textBaseline = "middle";
	show.ctx.textAlign = "center";

	show.ctx.fillText(string, x, y);
}

loop = () => {
	if(game.pause) return;
	show.clear();
	snake.move();
	snake.draw(show);

	game.generateBerries();
	game.drawBerry();
	
	snake.canShorten = true;
	snake.canСhecked = true;
	snake.eatABerry();
	obstacles.draw();
	findFPS();

	if(game.headCrossesBody()) return;
	if(game.headCrossesObstacles()) return;
	requestAnimationFrame(loop);
}