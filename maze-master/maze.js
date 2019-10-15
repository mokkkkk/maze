var ctxs, wid, hei, cols, rows, mazes, stacks = [], start = [{x:-1, y:-1}, {x:-1, y:-1}], end = [{x:-1, y:-1}, {x:-1, y:-1}],grid = 8, padding = 16, s, density=0.5, count=2;
function node(sx, sy, sw, sg) {
    this.x=sx;
    this.y=sy;
    this.w=sw;
    this.g=sg;
}
var Minheap=function(capacity = 200) {
    this.heap=[];
    for(var i = 0; i < capacity ; i++) {
        this.heap[i]= new node();
    }
    this.currentSize= 0;
}
Minheap.prototype = {
    Isempty: function() {
        return this.currentSize==0;
    },
    push: function(sx, sy, sw, sg) {
        var i = this.currentSize;
        while( i > 0 ) {
            var p = Math.floor(( i - 1 ) / 2 );
            if( this.heap[p].w <= sw) {
                break;
            }
            this.heap[i].x = this.heap[p].x;
            this.heap[i].y = this.heap[p].y;
            this.heap[i].w = this.heap[p].w;
            this.heap[i].g = this.heap[p].g;//为什么不能直接一整个赋值
            i=p;
        }
        this.heap[i].w = sw;//为什么this.heap[i].w = sw;会出现问题
        this.heap[i].x = sx;
        this.heap[i].y = sy;
        this.heap[i].g = sg;
        this.currentSize++;
    },
    pop: function() {
        if(this.currentSize <= 0) return undefined;
        var ret = new node();
        ret.x = this.heap[0].x;
        ret.y = this.heap[0].y;
        ret.w = this.heap[0].w;
        ret.g = this.heap[0].g;
        var tmp = this.heap[--this.currentSize];
        var i = 0; 
        while(i*2 + 1 < this.currentSize) {
            var a=i*2+1;
            var b=i*2+2;
            if(b < this.currentSize && this.heap[b].w < this.heap[a].w) {
                a = b;
            }
            if(this.heap[a].w >= tmp.w) break;
            this.heap[i].x = this.heap[a].x;
            this.heap[i].y = this.heap[a].y;
            this.heap[i].w = this.heap[a].w;
            this.heap[i].g = this.heap[a].g;
            i = a;
        }
        this.heap[i].x = tmp.x;
        this.heap[i].y = tmp.y;
        this.heap[i].w = tmp.w;
        this.heap[i].g = tmp.g;
        return ret;
    }
}

function drawMaze(index) {
    for( var i = 0; i < cols; i++ ) {
        for( var j = 0; j < rows; j++ ) {
            switch( mazes[index][i][j] ) {
                case 0: ctxs[index].fillStyle = "black"; break;
                case 1: ctxs[index].fillStyle = "gray"; break;
                case 2: ctxs[index].fillStyle = "red"; break;
                case 3: ctxs[index].fillStyle = "yellow"; break;
                case 4: ctxs[index].fillStyle = "#500000"; break;
                case 5: ctxs[index].fillStyle = "black"; break;
                case 8: ctxs[index].fillStyle = "blue"; break;
                case 9: ctxs[index].fillStyle = "gold"; break;
            }
            ctxs[index].fillRect( grid * i, grid * j, grid, grid  );
        }
    }
}

function drawBlock(ctx, sx, sy, a) {
    switch( a ) {
        case 0: ctx.fillStyle = "black"; break;
        case 1: ctx.fillStyle = "gray"; break;
        case 2: ctx.fillStyle = "red"; break;
        case 3: ctx.fillStyle = "yellow"; break;
        case 4: ctx.fillStyle = "#500000"; break;
        case 8: ctx.fillStyle = "blue"; break;
        case 9: ctxs[index].fillStyle = "gold"; break;
    }
    ctx.fillRect( grid * sx, grid * sy, grid, grid  );
}

function getFNeighbours( index, sx, sy, a ) {
    var n = [];
    if( sx - 1 > 0 && mazes[index][sx - 1][sy] % 8 == a ) {
        n.push( { x:sx - 1, y:sy } );
    }
    if( sx + 1 < cols - 1 && mazes[index][sx + 1][sy] % 8 == a ) {
        n.push( { x:sx + 1, y:sy } );
    }
    if( sy - 1 > 0 && mazes[index][sx][sy - 1] % 8 == a ) {
        n.push( { x:sx, y:sy - 1 } );
    }
    if( sy + 1 < rows - 1 && mazes[index][sx][sy + 1] % 8 == a ) {
        n.push( { x:sx, y:sy + 1 } );
    }
    return n;
}

function getFNeighbours2( index, sx, sy, a ) {
    var n=[];
    if( sx - 1 >= 0 && mazes[index][sx - 1][sy] % 8 == a ) {
        n.push( { x:sx - 1, y:sy } );
    }
    if( sx + 1 <= cols - 1 && mazes[index][sx + 1][sy] % 8 == a ) {
        n.push( { x:sx + 1, y:sy } );
    }
    if( sy - 1 >= 0 && mazes[index][sx][sy - 1] % 8 == a ) {
        n.push( { x:sx, y:sy - 1 } );
    }
    if( sy + 1 <= rows - 1 && mazes[index][sx][sy + 1] % 8 == a ) {
        n.push( { x:sx, y:sy + 1 } );
    }
    if( sx - 1 >= 0 && sy - 1 >= 0 && mazes[index][sx - 1][sy - 1] % 8 == a ) {
        n.push( { x:sx - 1, y:sy - 1 } );
    }
    if( sx + 1 <= cols - 1 && sy - 1 >= 0 && mazes[index][sx + 1][sy - 1] % 8 == a ) {
        n.push( { x:sx + 1, y:sy - 1} );
    }
    if( sx - 1 >= 0 && sy + 1 <= rows -1 && mazes[index][sx - 1][sy + 1] % 8 == a ) {
        n.push( { x:sx - 1, y:sy + 1 } );
    }
    if( sx + 1 <= cols - 1 && sy + 1 <= rows - 1 && mazes[index][sx + 1][sy + 1] % 8 == a ) {
        n.push( { x:sx + 1, y:sy + 1 } );
    }
    return n;
}

function getFNeighboursNew(index, sx, sy, a) {

    var n = [];
    var dx = end[index].x - sx;
    var dy = end[index].y - sy;

    if(dx >= 0) {
        if(dy >= 0) {
            if(dy >= dx) {
                if(mazes[index][sx][sy + 1] % 8 == a) {
                    n.push({x:sx, y:sy + 1})
                }
                if(mazes[index][sx + 1][sy] % 8 == a) {
                    n.push({x:sx + 1, y:sy})
                }
                if(mazes[index][sx - 1][sy] % 8 == a) {
                    n.push({x:sx - 1, y:sy})
                }
                if(mazes[index][sx][sy - 1] % 8 == a) {
                    n.push({x:sx, y:sy - 1})
                }
            }
            else {
                if(mazes[index][sx + 1][sy] % 8 == a) {
                    n.push({x:sx + 1, y:sy})
                }
                if(mazes[index][sx][sy + 1] % 8 == a) {
                    n.push({x:sx, y:sy + 1})
                }
                if(mazes[index][sx][sy - 1] % 8 == a) {
                    n.push({x:sx, y:sy - 1})
                }
                if(mazes[index][sx - 1][sy] % 8 == a) {
                    n.push({x:sx - 1, y:sy})
                }
            }
        }
        else {
            if(-1 * dy >= dx) {
                if(mazes[index][sx][sy - 1] % 8 == a) {
                    n.push({x:sx, y:sy - 1})
                }
                if(mazes[index][sx + 1][sy] % 8 == a) {
                    n.push({x:sx + 1, y:sy})
                }
                if(mazes[index][sx - 1][sy] % 8 == a) {
                    n.push({x:sx - 1, y:sy})
                }
                if(mazes[index][sx][sy + 1] % 8 == a) {
                    n.push({x:sx, y:sy + 1})
                }
            }
            else {
                if(mazes[index][sx + 1][sy] % 8 == a) {
                    n.push({x:sx + 1, y:sy})
                }
                if(mazes[index][sx][sy - 1] % 8 == a) {
                    n.push({x:sx, y:sy - 1})
                }
                if(mazes[index][sx][sy + 1] % 8 == a) {
                    n.push({x:sx, y:sy + 1})
                }
                if(mazes[index][sx - 1][sy] % 8 == a) {
                    n.push({x:sx - 1, y:sy})
                }
            }
        }
    }
    else {
        if(dy < 0) {
            if(dy <= dx) {
                if(mazes[index][sx][sy - 1] % 8 == a) {
                    n.push({x:sx, y:sy - 1})
                }
                if(mazes[index][sx - 1][sy] % 8 == a) {
                    n.push({x:sx - 1, y:sy})
                }
                if(mazes[index][sx + 1][sy] % 8 == a) {
                    n.push({x:sx + 1, y:sy})
                }
                if(mazes[index][sx][sy + 1] % 8 == a) {
                    n.push({x:sx, y:sy + 1})
                }
            }
            else {
                if(mazes[index][sx - 1][sy] % 8 == a) {
                    n.push({x:sx - 1, y:sy})
                }
                if(mazes[index][sx][sy - 1] % 8 == a) {
                    n.push({x:sx, y:sy - 1})
                }
                if(mazes[index][sx][sy + 1] % 8 == a) {
                    n.push({x:sx, y:sy + 1})
                }
                if(mazes[index][sx + 1][sy] % 8 == a) {
                    n.push({x:sx + 1, y:sy})
                }
            }
        }
        else {
            if(dy >= dx * -1) {
                if(mazes[index][sx][sy + 1] % 8 == a) {
                    n.push({x:sx, y:sy + 1})
                }
                if(mazes[index][sx - 1][sy] % 8 == a) {
                    n.push({x:sx - 1, y:sy})
                }
                if(mazes[index][sx + 1][sy] % 8 == a) {
                    n.push({x:sx + 1, y:sy})
                }
                if(mazes[index][sx][sy - 1] % 8 == a) {
                    n.push({x:sx, y:sy - 1})
                }
            }
            else {
                if(mazes[index][sx - 1][sy] % 8 == a) {
                    n.push({x:sx - 1, y:sy})
                }
                if(mazes[index][sx][sy + 1] % 8 == a) {
                    n.push({x:sx, y:sy + 1})
                }
                if(mazes[index][sx][sy - 1] % 8 == a) {
                    n.push({x:sx, y:sy - 1})
                }
                if(mazes[index][sx + 1][sy] % 8 == a) {
                    n.push({x:sx + 1, y:sy})
                }
            }
        }
    }

    return n; 
}

function solveMaze1(index) {
    if( start[index].x == end[index].x && start[index].y == end[index].y ) {
        for( var i = 0; i < cols; i++ ) {
            for( var j = 0; j < rows; j++ ) {
                switch( mazes[index][i][j] ) {
                    case 2: mazes[index][i][j] = 3; break;
                }
            }
        }
        drawMaze(index);
        return;
    }
    var neighbours = getFNeighbours( 0, start[index].x, start[index].y, 0 );
    if( neighbours.length ) {
        stacks[index].push( start[index] );
        start[index] = neighbours[0];
        mazes[index][start[index].x][start[index].y] = 2;
    } else {
        mazes[index][start[index].x][start[index].y] = 4;
        start[index] = stacks[index].pop();
    }
 
    drawMaze(index);
    requestAnimationFrame( function() {
        solveMaze1(index);
    } );
}

function solveMaze2(index) {
    if( start[index].x==end[index].x && start[index].y==end[index].y ) {
        mazes[index][end[index].x][end[index].y] = 8;
        for( var i = 0; i < cols; i++ ) {
            for( var j = 0; j < rows; j++ ) {
                switch( mazes[index][i][j] ) {
                    case 2: mazes[index][i][j] = 3; break;
                }
            }
        }
        drawMaze(index);
        return;
    }
    var neighbours = getFNeighbours2( 0, start[index].x, start[index].y, 0 );
    if( neighbours.length ) {
        stacks[index].push( start[index] );
        start[index] = neighbours[0];
        mazes[index][start[index].x][start[index].y] = 2;
    } else {
        mazes[index][start[index].x][start[index].y] = 4;
        if(stacks[index].length > 0)
        start[index] = stacks[index].pop();
    }
 
    drawMaze(index);
    requestAnimationFrame( function() {
        solveMaze2(index);
    } );
}

function solveMaze2New(index) {
    var roadx =new Array(cols);
    var roady =new Array(cols);
    var openList = new Minheap(rows * cols);
    for(var i = 0 ; i < cols ; i++) {
        roadx[i] = new Array(rows);
        roady[i] =new Array(rows);
    }
    roadx[start[index].x][start[index].y]= -1;
    roady[start[index].x][start[index].y]= -1;
    addOpenList(index,start[index].x ,start[index].y, 0 , 0 ,roadx,roady,openList);
    while (!openList.Isempty()) {
        var tmp = openList.pop();
        mazes[index][tmp.x][tmp.y] = 2;
        drawMaze(index);
        if(tmp.x == end[index].x && tmp.y == end[index].y) {
            var tmpx = end[index].x;
            var tmpy = end[index].y;
            mazes[index][tmpx][tmpy] = 8;
            while(roadx[tmpx][tmpy]!=-1) {
                var tmpx2 = tmpx;
                tmpx=roadx[tmpx][tmpy];
                tmpy=roady[tmpx2][tmpy];
                mazes[index][tmpx][tmpy] = 3;
            }
            for( var i = 0; i < cols; i++ ) {
                for( var j = 0; j < rows; j++ ) {
                    switch( mazes[index][i][j] ) {
                        case 2: mazes[index][i][j] = 4; break;
                    }
                }
            }
            drawMaze(index);
            break;
        }
        addOpenList(index, tmp.x, tmp.y, tmp.g, 0 ,roadx,roady,openList);
    }
    drawMaze(index);
    console.log("cannot find the road");
    return;
}

function addOpenList (index, sx, sy, sg, a, roadx, roady,openList) {
    var x = end[index].x;
    var y = end[index].y;
    if(sx - 1 >= 0 && mazes[index][sx - 1][sy] % 8 == a) {
        openList.push(sx - 1, sy ,Math.abs(sx - 1 -x)*10+Math.abs(sy - y)*10 + sg + 10, sg + 10);
        roadx[sx - 1][sy]= sx;
        roady[sx - 1][sy]= sy;
        mazes[index][sx - 1][sy] = 5;
    }
    if(sx + 1 <= cols - 1 && mazes[index][sx + 1][sy] % 8 == a) {
        openList.push(sx + 1, sy ,Math.abs(sx + 1 -x)*10+Math.abs(sy - y)*10 + sg + 10, sg + 10);
        roadx[sx + 1][sy] = sx;
        roady[sx + 1][sy] = sy;
        mazes[index][sx + 1][sy] = 5;
    }
    if(sy - 1 >= 0 && mazes[index][sx][sy - 1] % 8 == a) {
        openList.push(sx, sy - 1 ,Math.abs(sx - x)*10+Math.abs(sy - 1 - y)*10 + sg + 10, sg + 10);
        roadx[sx][sy - 1] = sx;
        roady[sx][sy - 1] = sy;
        mazes[index][sx][sy - 1] = 5;
    }
    if(sy + 1 <= rows - 1 && mazes[index][sx][sy + 1] % 8 == a) {
        openList.push(sx, sy + 1 ,Math.abs(sx - x)*10+Math.abs(sy + 1 - y)*10 + sg + 10, sg + 10);
        roadx[sx][sy + 1] = sx;
        roady[sx][sy + 1] = sy;
        mazes[index][sx][sy + 1] = 5;
    }
    if(sx - 1 >= 0 && sy - 1 >= 0 && mazes[index][sx - 1][sy - 1] % 8 == a) {
        openList.push(sx - 1, sy - 1 ,Math.abs(sx - 1 -x)*10+Math.abs(sy - 1 - y)*10 + sg + 14, sg + 14);
        roadx[sx - 1][sy - 1] = sx;
        roady[sx - 1][sy - 1] = sy;
        mazes[index][sx - 1][sy - 1] = 5;
    }
    if(sx - 1 >= 0 && sy + 1 <= rows - 1 && mazes[index][sx - 1][sy + 1] % 8 == a) {
        openList.push(sx - 1, sy + 1,Math.abs(sx - 1 -x)*10+Math.abs(sy + 1 - y)*10 + sg + 14, sg + 14);
        roadx[sx - 1][sy + 1] = sx;
        roady[sx - 1][sy + 1] = sy;
        mazes[index][sx - 1][sy + 1] = 5;
    }
    if(sx + 1 <= cols - 1  && sy - 1 >= 0 && mazes[index][sx + 1][sy - 1] % 8 == a) {
        openList.push(sx + 1, sy - 1,Math.abs(sx + 1 -x)*10+Math.abs(sy - 1 - y)*10 + sg + 14, sg + 14);
        roadx[sx + 1][sy - 1] = sx;
        roady[sx + 1][sy - 1] = sy;
        mazes[index][sx + 1][sy - 1] = 5;
    }
    if(sx + 1 <= cols - 1 && sy + 1 <= rows - 1 && mazes[index][sx + 1][sy + 1] % 8 == a) {
        openList.push(sx + 1, sy + 1,Math.abs(sx + 1 -x)*10+Math.abs(sy + 1 - y)*10 + sg + 14, sg + 14);
        roadx[sx + 1][sy + 1] = sx;
        roady[sx + 1][sy + 1] = sy;
        mazes[index][sx + 1][sy + 1] = 5;
    }
}


function solveMaze1New(index) {

    if( start[index].x == end[index].x && start[index].y == end[index].y ) {
        for( var i = 0; i < cols; i++ ) {
            for( var j = 0; j < rows; j++ ) {
                switch( mazes[index][i][j] ) {
                    case 2: mazes[index][i][j] = 3; break;
                }
            }
        }
        drawMaze(index);
        return;
    }
    var neighbours = getFNeighboursNew( 1, start[index].x, start[index].y, 0 );
    if( neighbours.length ) {
        stacks[index].push( start[index] );
        start[index] = neighbours[0];
        mazes[index][start[index].x][start[index].y] = 2;
    } else {
        mazes[index][start[index].x][start[index].y] = 4;
        start[index] = stacks[index].pop();
    }
 
    drawMaze(index);
    requestAnimationFrame( function() {
        solveMaze1New(index);
    } );
}

function getCursorPos( event ) {
    var rect = this.getBoundingClientRect();
    var x = Math.floor( ( event.clientX - rect.left ) / grid / s), 
        y = Math.floor( ( event.clientY - rect.top  ) / grid / s);
    
    if(end[0].x != -1) {
        onClear();
        return;
    }
    if( mazes[0][x][y] ) return;
    if( start[0].x == -1 ) {
        start[0] = { x: x, y: y };
        start[1] = { x: x, y: y };
        mazes[0][start[0].x][start[0].y] = 9;
        mazes[1][start[1].x][start[1].y] = 9;
        
        for(var i = 0; i < count; i++) {
            drawMaze(i); 
        }
    } else {
        end[0] = { x: x, y: y };
        end[1] = { x: x, y: y };
        mazes[0][end[0].x][end[0].y] = 8;
        mazes[1][end[1].x][end[1].y] = 8;
        drawMaze(0);
        drawMaze(1);
        var mazeType = document.getElementById("sltType").value;
        if(mazeType == "Maze1" ) {
            solveMaze1(0);
            solveMaze1New(1);
        }
        else {
            solveMaze2(0);
            solveMaze2New(1);
        }
    }
}

function getNeighbours( index, sx, sy, a ) {
    var n = [];
    if( sx - 1 > 0 && mazes[index][sx - 1][sy] == a && sx - 2 > 0 && mazes[index][sx - 2][sy] == a ) {
        n.push( { x:sx - 1, y:sy } ); n.push( { x:sx - 2, y:sy } );
    }
    if( sx + 1 < cols - 1 && mazes[index][sx + 1][sy] == a && sx + 2 < cols - 1 && mazes[index][sx + 2][sy] == a ) {
        n.push( { x:sx + 1, y:sy } ); n.push( { x:sx + 2, y:sy } );
    }
    if( sy - 1 > 0 && mazes[index][sx][sy - 1] == a && sy - 2 > 0 && mazes[index][sx][sy - 2] == a ) {
        n.push( { x:sx, y:sy - 1 } ); n.push( { x:sx, y:sy - 2 } );
    }
    if( sy + 1 < rows - 1 && mazes[index][sx][sy + 1] == a && sy + 2 < rows - 1 && mazes[index][sx][sy + 2] == a ) {
        n.push( { x:sx, y:sy + 1 } ); n.push( { x:sx, y:sy + 2 } );
    }
    return n;
}

function createArray( c, r ) {
    var m = new Array( count );
    for( var i = 0; i < count; i++ ) {
        m[i] = new Array( c );
        for( var j = 0; j < c; j++ ) {
            m[i][j] = new Array(r);
            for(var k = 0; k < r; k++) {
                m[i][j][k] = 1;
            }
        }
    }
    return m;
}

function createMaze1() {
    var neighbours = getNeighbours( 0, start[0].x, start[0].y, 1 ), l;
    if( neighbours.length < 1 ) {
        if( stacks[0].length < 1 ) {

            for(var i = 0; i < count; i++) {
                drawMaze(i); 
            }

            stacks = new Array(count);
            stacks[0] = []
            stacks[1] = [];
            
            start[0].x = start[0].y = -1;
            document.getElementById( "canvas1" ).addEventListener( "mousedown", getCursorPos, false );
            document.getElementById("btnCreateMaze").removeAttribute("disabled");

            return;
        }
        start[0] = stacks[0].pop();
    } else {
        var i = 2 * Math.floor( Math.random() * ( neighbours.length / 2 ) )
        l = neighbours[i]; 
        mazes[0][l.x][l.y] = 0;
        mazes[1][l.x][l.y] = 0;

        l = neighbours[i + 1]; 
        mazes[0][l.x][l.y] = 0;
        mazes[1][l.x][l.y] = 0;

        start[0] = l

        stacks[0].push( start[0] )
    }
    for(var i = 0; i < count; i++) {
        drawMaze(i); 
    }
    
    requestAnimationFrame( createMaze1 );
}

function createMaze1NonAni(ctx) {

    while(true) {

        var neighbours = getNeighbours( 0, start[0].x, start[0].y, 1 ), l;
        if( neighbours.length < 1 ) {
            if( stacks[0].length < 1 ) {
                for(var i = 0; i < count; i++) {
                    drawMaze(i); 
                    drawMaze(i);    
                }
    
                for(var i = 0; i < count; i++) {
                    drawMaze(i); 
                    drawMaze(i);    
                }
    
                stacks = new Array(count);
                stacks[0] = []
                stacks[1] = [];
                
                start[0].x = start[0].y = -1;
                document.getElementById( "canvas1" ).addEventListener( "mousedown", getCursorPos, false );
                document.getElementById("btnCreateMaze").removeAttribute("disabled");
    
                return;
            }
            start[0] = stacks[0].pop();
        } else {
            var i = 2 * Math.floor( Math.random() * ( neighbours.length / 2 ) )
            l = neighbours[i]; 
            mazes[0][l.x][l.y] = 0;    
            mazes[1][l.x][l.y] = 0;

            l = neighbours[i + 1]; 
            mazes[0][l.x][l.y] = 0;
            mazes[1][l.x][l.y] = 0;
    
            start[0] = l
            stacks[0].push( start[0] )
        }    
    }
    document.getElementById("btnCreateMaze").removeAttribute("disabled");
}

function createMaze2(ctx) {

    var r = Math.random();

    mazes[0][start[0].x][start[0].y] = r < density ? 0 : 1;
    mazes[1][start[0].x][start[0].y] = r < density ? 0 : 1;
    
    drawMaze(0);
    drawMaze(1);

    if(start[0].x == (cols - 1) && start[0].y == (rows - 1)){
        start[0].x = start[0].y = -1;
        document.getElementById( "canvas1" ).addEventListener( "mousedown", getCursorPos, false );
        document.getElementById("btnCreateMaze").removeAttribute("disabled");
        return;
    }

    start[0].x = start[0].x + 1;
    if(start[0].x == cols){
        start[0].x = 0;
        start[0].y = start[0].y + 1;
    }

    requestAnimationFrame(createMaze2);
}

function createMaze2NonAni() {

    for(var i = 0; i < cols; i++){
        for(var j = 0; j < rows; j++){
            flag = Math.random();
            mazes[0][i][j] = flag < density ? 0 : 1;    
            mazes[1][i][j] = flag < density ? 0 : 1;    
        }
    }

    drawMaze(0);
    drawMaze(1);
    start[0].x = start[0].y = -1;
    document.getElementById( "canvas1" ).addEventListener( "mousedown", getCursorPos, false );
    document.getElementById("btnCreateMaze").removeAttribute("disabled");
}

function createCanvas(count) {

    ctxs = new Array(count);
    mazes = new Array(count);

    for(var i = 0; i < count; i++) {
        var canvas = document.createElement( "canvas" );
        wid = document.getElementById("maze" + (i + 1)).offsetWidth - padding; 
        hei = 400;
        
        canvas.width = wid; canvas.height = 400;
        canvas.id = "canvas" + (i + 1);
        ctxs[i] = canvas.getContext( "2d" );
        ctxs[i].fillStyle = "gray"; 
        var div = document.getElementById("maze" + (i + 1))
        div.appendChild( canvas );    
    }
    
    for(var i = 0; i < count; i++) {
        ctxs[i].fillRect( 0, 0, wid, hei );
    }
}

function init() {
    createCanvas(count);
}

function onCreate() {

    stacks = new Array(count);
    stacks[0] = []
    stacks[1] = [];

    document.getElementById("btnCreateMaze").setAttribute("disabled", "disabled");

    wid = document.getElementById("maze1").offsetWidth - padding; 
    hei = 400;

    cols = eval(document.getElementById("cols").value); 
    rows = eval(document.getElementById("rows").value);

    var mazeType = document.getElementById("sltType").value;

    if(mazeType == "Maze1") {
        cols = cols + 1 - cols % 2;
        rows = rows + 1 - rows % 2;    
    }

    mazes = createArray( cols, rows );

    for(var i = 0; i < count; i++) {

        var canvas = document.getElementById("canvas" + (i + 1));
        canvas.width = wid;
        canvas.height = hei;
        s = canvas.width / (grid * cols);
        canvas.height = s * grid * rows;
        ctxs[i].scale(s, s);
    }

    if(mazeType == "Maze1") {

        start[0].x = Math.floor( Math.random() * ( cols / 2 ) );
        start[0].y = Math.floor( Math.random() * ( rows / 2 ) );
        if( !( start[0].x & 1 ) ) start[0].x++; if( !( start[0].y & 1 ) ) start[0].y++;
        
        for(var i = 0; i < count; i++) {

            mazes[i][start[0].x][start[0].y] = 0;
        }

        if(document.getElementById("chkAnimated").checked) {

            createMaze1();
        }
        else {

            createMaze1NonAni();
        }
    }
    else {

        density = document.getElementById("density").value / 100;
        start[0].x = 0;
        start[0].x = 0;

        if(document.getElementById("chkAnimated").checked) {

            createMaze2();
        }
        else {

            createMaze2NonAni();
        }
    }
}

function onSltType() {
    if(document.getElementById("sltType").value == "Maze2") {
        document.getElementById("density").removeAttribute("disabled");
    }
    else {
        document.getElementById("density").setAttribute("disabled", "disabled");
    }
}

function onClear() {
    
    for(var i = 0; i < count; i++){
        for(var j = 0; j < cols; j++){
            for( var k = 0; k < rows; k++) {
                if(mazes[i][j][k] == 5 || mazes[i][j][k] == 2 || mazes[i][j][k] == 3 || mazes[i][j][k] == 4 || mazes[i][j][k] == 8 || mazes[i][j][k] == 9) {
                    mazes[i][j][k] = 0;
                }    
            }
        }
    }

    for(var i = 0; i < count; i++) {
        drawMaze(i); 
    }
    for(var i = 0; i < count; i++) {
        drawMaze(i); 
    }

    stacks = new Array(count);
    stacks[0] = []
    stacks[1] = [];

    start[0].x = start[0].y = -1;
    start[1].x = start[1].y = -1;

    end[0].x = end[0].y = -1;
    end[0].x = end[0].y = -1;

}