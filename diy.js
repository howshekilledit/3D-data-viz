
//https://doc.babylonjs.com/divingDeeper/scene/renderToPNG <- screenshot
//https://playground.babylonjs.com/#A9MWZ9#1 <-input text
var canvas = document.getElementById("renderCanvas");
let scale = 2;
var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, disableWebGL2Support: false }); };

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // GUI
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    //redo viz based on user inputs
    scene.registerBeforeRender(function () {
        var val1 = inputVal(v1);
        var val2 = inputVal(v2);
        if ((vs.indexOf(val1) == -1) | (vs.indexOf(val2) == -1)) {
            vs = [val1, val2];
            if ((v1.text.length>0) & (v1.text.length>0)) {
                for (var chunk of t.chunks) {
                    for (var box of chunk.boxes) {
                        box.dispose();
                    }
                }

                t = placeStack(vs, colors);
            }
        }

    });


    //define colors for legend abd block
    var colors = ['#348888', '#FA7F08']

    //add inputs
    var v1 = addInput(10, 40, colors[1]);
    var v2 = addInput(100, 80, colors[0]);
    var vs = [10, 100]; //initialize value
    //camera
    var camera = new BABYLON.FreeCamera("camera1", BABYLON.Vector3.Zero(), scene);;

    //lights
    hem_light = new BABYLON.HemisphericLight("light", BABYLON.Vector3.Zero(), scene);
    hem_light.intensity = 0.3;
    pt_light = new BABYLON.PointLight("pointLight", BABYLON.Vector3.Zero(), scene);
    pt_light.intensity = 1.5;


    scene.clearColor = BABYLON.Color3.White(); //white background

    var t = placeStack(vs, colors);

    scene.executeWhenReady(function () {
        var lb = 0;
        //t.chunks[1].boxes[lb].material = t.chunks[1].materials[lb];
        document.getElementById('rt').addEventListener('click', function () {
            t.root.rotation.y += 0.1
        });
        document.getElementById('lft').addEventListener('click', function () {
            t.root.rotation.y -= 0.1
        });




    });

    function placeStack(vs, colors) {
        var max = Math.max(...vs);
        var min = Math.min(...vs);
        if (max > Math.pow(10, 9)) {
            var exp = getExp(max) - getExp(min);
            vs = vs.map(x => x / Math.pow(10, exp));
        }

        var t = new stack(vs, false, colors);

        var campos = t.chunks[0].dim.multiply(new BABYLON.Vector3(2, 2.1, 2));


        camera.position = campos;

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        pt_light.position = campos.multiply(new BABYLON.Vector3(1.2, 1, 2));
        hem_light.position = campos;
        t.placeBlocks();
        if (campos.z > campos.x) {
            t.root.rotation.y -= Math.PI/4;
        //     campos.x *= (campos.z / campos.x);
        }
        if (inputVal(v1) > inputVal(v2)) {
            v1.color= colors[0];
            v1.shadowColor = colors[0];
            v2.color = colors[1];
            v2.shadowColor = colors[1];
        } else {
            v1.color = colors[1];
            v1.shadowColor = colors[1];
            v2.color = colors[0];
            v2.shadowColor = colors[0];

        }

        return t;
    }

    function addInput(placeholder, top, clr = 'green') {
        // Height Input
        var input = new BABYLON.GUI.InputText("input");
        input.width = "200px";
        input.maxWidth = 0.2;
        input.height = "35px";
        input.text = placeholder;

        input.background = "white";
        input.shadowColor = clr;
        input.color = clr;
        //input.shadowOffsetX = 5
        input.shadowOffsetX = 5;
        input.shadowOffsetY = 5;

        input.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
        input.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP
        input.top = top
        input.onBeforeKeyAddObservable.add((input) => {
            let key = input.currentKey;
            if (key < "0" || key > "9") {
                input.addKey = false;
            }
        });
        advancedTexture.addControl(input);
        return input;
    }
    function inputVal(input) {
        return parseFloat(input.text);
    }
    return scene;
};

window.initFunction = async function () {
    var asyncEngineCreation = async function () {
        try {
            return createDefaultEngine();
        } catch (e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();
};
initFunction().then(() => {
    sceneToRender = scene
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
