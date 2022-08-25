

//class that generates stacks of blocks
//to visualize relative figures in 3D
class stack {
    constructor(volumes, font_size = false, colors = false, origin = new BABYLON.Vector3.Zero()) {
        volumes = volumes.sort((a, b) => b - a);
        this.origin = origin;
        this.chunks = volumes.map(v => dimFromVol(v));
        for (var i = 0; i < this.chunks.length - 1; i++) {
            var this_chunk = this.chunks[i].dim;
            var next_chunk = this.chunks[i + 1].dim;
            //align dimensions
            for (const d of ['x', 'y', 'z']) {
                for (const e of ['x', 'y', 'z']) {
                    if (this_chunk[d] == next_chunk[e]) {
                        var temp = next_chunk[d];
                        next_chunk[d] = next_chunk[e];
                        next_chunk[e] = temp;
                    }

                }
            }

        }
        //for each figure, push object with dimensions into chunk array
        for (const [i, chunk] of this.chunks.entries()) {
            if (colors) {
                chunk.clr = colors[i];
            } else {
                chunk.clr = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
            }
            if(font_size){
                chunk.font_size = font_size[i];
            }
            chunk.nest_volume = chunk.volume; //volume including child chunks
            //get root position for next chunk
            var chunkpos;
            if (i == 0) {
                //initialize at zero
                chunkpos = this.origin;
            } else {
                //add dimensions of last block to position and subtract dimension of current block
                chunkpos = this.chunks[i - 1].blocks[this.chunks[i - 1].blocks.length-1].pos.add(this.chunks[i - 1].blocks[this.chunks[i - 1].blocks.length-1].dim).subtract(chunk.dim);
            }
            //break current chunk into blocks based on size of next chunk
            //(if it's the last/smallest chunk, only one block is needed)
            chunk.blocks = [{ dim: new BABYLON.Vector3(chunk.dim.x, chunk.dim.y, chunk.dim.z), pos: chunkpos }];
            if (i < this.chunks.length - 1) {
                var next_chunk = this.chunks[i + 1];
                for (const d of ['x', 'y', 'z']) {
                    if (next_chunk.dim[d] != chunk.dim[d]) {
                        var last_block = chunk.blocks[chunk.blocks.length-1];
                        var new_block = {
                            dim: new BABYLON.Vector3(last_block.dim.x, last_block.dim.y, last_block.dim.z),
                            pos: new BABYLON.Vector3(last_block.pos.x, last_block.pos.y, last_block.pos.z)
                        }
                        last_block.dim[d] -= next_chunk.dim[d];
                        new_block.dim[d] = next_chunk.dim[d];
                        new_block.pos[d] += last_block.dim[d];
                        chunk.blocks.push(new_block);
                    }
                }

                chunk.volume -= next_chunk.volume;
            }
        }
    }

    //place Blocks with instructions for how to label faces
    placeBlocks(i = false, faces = [2], wrap = true, font_size) { //optional index variable for chunk and block index
        //i parameter: optional index
        //faces parameter: array of arrays of block faces to be shown on each chunk
        //wrap: either boolean or array of booleans on whether to wrap each chunk
        this.root = new BABYLON.TransformNode(); //root for transformations
        this.root.setPivotPoint(this.chunks[0].dim.multiply(new BABYLON.Vector3(0.5, 0.5, 0.5)));
        if (i) {
            var chunk = this.chunks[i[0]];
            var blck = chunk.blocks[i[1]];
            chunk.boxes = [placeBlock(blck.dim, blck.pos, chunk.clr)];
            chunk.boxes[chunk.boxes.length-1].parent = this.root;

        } else {
            for (const [k, chunk] of this.chunks.entries()) {
                //var chunk = this.chunks[0];
                chunk.boxes = [];
                var wrp;
                if (Array.isArray(wrap)) {
                    wrp = wrap[k];
                } else {
                    wrp = wrap;
                }

                for (const [j, blck] of chunk.blocks.entries()) {
                    if ((j < chunk.blocks.length - 1) | (chunk.blocks.length == 1)) {
                        var areas = [blck.dim.x * blck.dim.y, blck.dim.x * blck.dim.z, blck.dim.z * blck.dim.x];
                        var max_area = areas.indexOf(Math.max(...areas));
                        var wp;
                        if (Array.isArray(wrp)) {
                            wp = wrp[j];
                        } else {
                            wp = wrp;
                            if(wp.ref){ //generate texture wrap coordinates based on wrap object
                                var tot_w = 0;
                                let faceUV = new Array(6);
                                faceUV = faceUV.fill(new BABYLON.Vector4(0, 0, 0, 0));
                                //get y reference
                                var these_blocks = chunk.blocks.filter((b, k) => wp.ref.map(x => x.i).indexOf(k)>0);
                                var max_y = Math.max(...these_blocks.map(b => b.dim.y));
                                wp.ref.map(ref => tot_w += chunk.blocks[ref.i].dim[ref.d]);
                                var pos = 0
                                for(let ref of wp.ref){
                                    if(ref.i == j){ //if current block
                                        var leftpos = pos/tot_w;
                                        var map_ref = (max_y - blck.dim.y)/max_y
                                        var bot = 0.45 + (0.025 - 0.05)*map_ref;
                                        var top = 0.55 - (0.025 + 0.05)*map_ref;
                                        var rightpos = (pos + chunk.blocks[ref.i].dim[ref.d])/tot_w;
                                        faceUV[ref.UV] = new BABYLON.Vector4(leftpos, bot, rightpos, top);
                                    }
                                    pos += chunk.blocks[ref.i].dim[ref.d];
                                }
                                wp = {UV: faceUV};
                                // console.log(tot_w);

                            }
                        }
                        try {
                            chunk.boxes.push(placeBlock(blck.dim, blck.pos, chunk.clr, faces[k][j], wp, font_size));
                        } catch {
                            chunk.boxes.push(placeBlock(blck.dim, blck.pos, chunk.clr, [], wp, font_size));

                        }
                        chunk.boxes[chunk.boxes.length-1].parent = this.root;
                    }
                }

            }
        }

    }
}
function getExp(n) { //get exponent value from scientific notation
    var sn = n.toExponential();
    return parseFloat(sn.slice(sn.indexOf('e') + 1));
}

//generate dimensions from volume
//so that chunks can be nested to optimal visual effect
function dimFromVol(volume) {
    var props = { volume: volume }; //initialize properties object
    //JS scientific notation
    props.sciNot = volume.toExponential();
    //coefficient and exponent from scientific notation
    props.coeff = parseFloat(props.sciNot.slice(0, props.sciNot.indexOf('e')));
    props.exp = parseFloat(props.sciNot.slice(props.sciNot.indexOf('e') + 1));

    //generate dimensions
    var a = Math.round(props.exp / 3);
    var b = a;
    var c = props.exp - a - b;
    a = Math.abs(Math.pow(10, a));
    b = Math.abs(Math.pow(10, b));
    c = Math.abs(Math.pow(10, c));
    //apply coefficent to smaller piece (so sides are as close together as possible
    //GIVEN two sides are divisible by highest possible exponents of ten)
    if (a > c) {
        c *= props.coeff;
    } else {
        a *= props.coeff;
    }
    //sort dimensions
    var ds = [a, b, c].sort((a, b) => (a - b));
    props.dim = new BABYLON.Vector3(ds[0], ds[1], ds[2]);
    return props;
}




//places block given dimensions, position, color, and (if applicable) faces to display labels
function placeBlock(dim, pos, clr = new BABYLON.Color3(Math.random(), Math.random(), Math.random()), text_face = [0, 1, 2, 3, 4, 5], wrap = true) {
    //text on cube reference: https://doc.babylonjs.com/divingDeeper/materials/using/texturePerBoxFace
    const mat = new BABYLON.StandardMaterial("mat", scene);
    //mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    try {
        clr = new BABYLON.Color3.FromHexString(clr);
    } catch { }

    mat.diffuseColor = clr;

    let boxOption = {

        width: dim.x, height: dim.y, depth: dim.z,
        wrap: wrap
    }
    const box = BABYLON.MeshBuilder.CreateBox("box", boxOption);

    box.material = mat;
    box.position = new BABYLON.Vector3(pos.x + dim.x / 2, pos.y + dim.y / 2, pos.z + dim.z / 2);

    return box;

}
