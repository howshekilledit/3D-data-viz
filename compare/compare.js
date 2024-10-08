// Babylon.js Scene Setup
const canvas = document.getElementById("renderCanvas"); // Assuming you have a canvas in your HTML
const engine = new BABYLON.Engine(canvas, true); // Create Babylon.js engine

// Create scene
const createScene = () => {
    const scene = new BABYLON.Scene(engine);

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(45), BABYLON.Tools.ToRadians(45), 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Light
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    return scene;
};

// Function to generate the comparison blocks
function generateComparison(scene, num1, num2) {
    const font_size = [12, 12]; // Example font sizes for labeling blocks
    const colors = ["#ff0000", "#0000ff"]; // Example colors for the blocks

    // Create two stacks for comparison
    const stack1 = new stack([num1], font_size, colors, new BABYLON.Vector3(-2, 0, 0)); // Stack 1 on the left
    const stack2 = new stack([num2], font_size, colors, new BABYLON.Vector3(2, 0, 0));  // Stack 2 on the right

    // Place blocks in the scene
    stack1.placeBlocks(false, [2], true);
    stack2.placeBlocks(false, [2], true);

    // Attach stacks to the scene
    stack1.root.parent = scene;
    stack2.root.parent = scene;
}

// Array of number pairs to compare
const comparisons = [
    [1, 2], [3, 4], [5, 6], [7, 8],
    [9, 10], [11, 12], [13, 14], [15, 16]
];

// Render each comparison and capture the screenshot
const scene = createScene();
let currentComparison = 0;

const renderComparison = () => {
    if (currentComparison >= comparisons.length) {
        console.log("All comparisons rendered.");
        return;
    }

    const [num1, num2] = comparisons[currentComparison];
    scene.clear();  // Clear previous objects
    generateComparison(scene, num1, num2);

    // Render and capture the scene as an image
    engine.runRenderLoop(() => {
        scene.render();
        engine.stopRenderLoop();

        // Capture the scene as a JPEG image
        BABYLON.Tools.CreateScreenshot(engine, camera, { width: 1024, height: 1024 }, (data) => {
            // Save the screenshot to a file (this part may need to be server-side for security reasons)
            saveImage(`comparison_${currentComparison + 1}.jpeg`, data);
        });

        currentComparison++;
        renderComparison();  // Move to the next comparison
    });
};

// Helper function to save the image
function saveImage(filename, dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

// Start rendering comparisons
renderComparison();

