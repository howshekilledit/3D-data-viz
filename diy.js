
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
    var normaled; //boolean to toggle normalized
    //redo viz based on user inputs
    scene.registerBeforeRender(function () {
        var val1 = inputVal(v1);
        var val2 = inputVal(v2);
        if ((vs.indexOf(val1) == -1) | (vs.indexOf(val2) == -1)) {
            normaled = false;
            vs = [val1, val2];
            if ((v1.text.length > 0) & (v1.text.length > 0)) {
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

    var v1_settings = {
        left: -150, top: 80, bg: colors[1], clr: "white",
        height: "35px", width: "250px", fontFamily: "Arial", fontSize: "16px"
    };
    var v1 = addInput(10, true, v1_settings);
    var v2_settings = v1_settings;
    v2_settings.left = 150;
    v2_settings.bg = colors[0];
    var v2 = addInput(100, true, v2_settings);
    var l1_settings = v1_settings;
    l1_settings.top = 40;
    l1_settings.bg = "white";
    l1_settings.clr = colors[1];
    l1_settings.left = -150;
    var l1 = addInput('Label 1', false, l1_settings);
    var l2_settings = l1_settings;
    l2_settings.bg = "white";
    l2_settings.clr = colors[0];
    l2_settings.left = 150;
    var l2 = addInput('Label 2', false, l2_settings);
    // var l2 = addInput('Click # below to change it', 150, 40, colors[0]);
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
        // document.getElementById('rt').addEventListener('click', function () {
        //     t.root.rotation.y += 0.1
        // });
        // document.getElementById('lft').addEventListener('click', function () {
        //     t.root.rotation.y -= 0.1
        // });





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
            t.root.rotation.y -= Math.PI / 4;
            //     campos.x *= (campos.z / campos.x);
        }
        if (inputVal(v1) > inputVal(v2)) {
            l1.color = colors[0];
            l2.color = colors[1];
            v1.background = colors[0];
            v2.background = colors[1];
        } else {
            l1.color = colors[1];
            l2.color = colors[0];
            v1.background = colors[1];
            v2.background = colors[0];

        }

        return t;
    }

    // function normal() {
    //     if (normaled == false) {
    //         normaled = true;
    //         n1 = (Math.min(inputVal(v1), inputVal(v2)) / Math.max(inputVal(v1), inputVal(v2))) * 1000;
    //         n2 = 1000;
    //         v1.text = n1 / 10;
    //         v2.text = n2 / 10;
    //         vs = [n1, n2];
    //         for (var chunk of t.chunks) {
    //             for (var box of chunk.boxes) {
    //                 box.dispose();
    //             }
    //         }
    //         t = placeStack([n1, n2], colors)
    //     }
    // }

    function addInput(placeholder, numonly = true, settings = {
        left: 0, top: 40, bg: "black", clr: "white",
        height: "35px", width: "250px", fontFamily: "Arial", fontSize: "16px"
    }) {
        // Height Input
        var input = new BABYLON.GUI.InputText("input");
        input.width = settings.width;
        input.maxWidth = 0.2;
        input.height = settings.height;
        input.text = placeholder;

        input.fontWeight = 'bold';
        input.background = settings.bg;
        input.color = settings.clr;


        input.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        input.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        input.left = settings.left;
        input.top = settings.top;
        input.onBeforeKeyAddObservable.add((input) => {
            let key = input.currentKey;
            if (num_only) {
                if (key < "0" || key > "9") {
                    input.addKey = false;
                }
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
