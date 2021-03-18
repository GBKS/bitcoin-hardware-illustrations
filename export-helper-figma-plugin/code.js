// Create new page
const page = figma.createPage();
page.name = "Icons for export";
figma.root.appendChild(page);
// Get all nodes that are components
const nodes = figma.currentPage.findAll(node => node.type == 'COMPONENT_SET');
const newNodes = [];
let svgX = 0;
let svgY = 0;
let pngX = 0;
let pngY = 500;
// Create instance of each component and variant
for (const node of nodes) {
    // Only use components with variants.
    if (node.type === 'COMPONENT_SET') {
        // Loop all component variants.
        for (const nodeVariant of node.children) {
            if (nodeVariant.type === 'COMPONENT') {
                if (nodeVariant.type === 'COMPONENT') {
                    // All sizes exported as PNG
                    pngX = exportComponentAsPNG(node, nodeVariant, pngX, pngY);
                    // Largest size (300h) is exported as SVG
                    svgX = exportComponentAsSVG(node, nodeVariant, svgX, svgY);
                    // Reset the row every 10 icons
                    if (pngX >= 1000) {
                        pngX = 0;
                        pngY += 350;
                    }
                    // Reset the row every 10 icons
                    // if(svgX >= 1000) {
                    // 	svgX = 0
                    // 	svgY += 350
                    // }
                }
            }
        }
    }
}
/*

Clean up names from 'Ledger Nano/150h' to:

/300/ledger-nano.png
/150/ledger-nano.png
/75/ledger-nano.png
/svg/ledger-nano.svg

 */
function exportComponentAsSVG(node, nodeVariant, x, y) {
    let exportIcon = false;
    const variantNameBits = nodeVariant.name.split(', ');
    for (const bit of variantNameBits) {
        const subBits = bit.split('=');
        switch (subBits[0]) {
            case 'Size':
                // Only export biggest size as SVG.
                exportIcon = subBits[1] == '300h';
                break;
        }
    }
    if (exportIcon) {
        const newName = 'svg/' + node.name;
        return createInstance(nodeVariant, newName, x, y, 'SVG');
    }
    else {
        return x;
    }
}
function exportComponentAsPNG(node, nodeVariant, x, y) {
    const variantNameBits = nodeVariant.name.split(', ');
    let subFolder = '';
    for (const bit of variantNameBits) {
        const subBits = bit.split('=');
        switch (subBits[0]) {
            case 'Size':
                // Use size name as subfolder
                subFolder = subBits[1].substr(0, subBits[1].length - 1);
                break;
        }
    }
    // Finalize name.
    // "Ledger Nano" with variant "Size=150h" becomes
    // "150/leger-nano"
    const newName = subFolder + '/' + node.name;
    return createInstance(nodeVariant, newName, x, y, 'PNG');
}
function createInstance(nodeVariant, newName, x, y, fileType) {
    const nodeInstance = nodeVariant.createInstance();
    let cleanName = newName.toLowerCase();
    cleanName = cleanName.replaceAll(' ', '-');
    // Position nicely.
    nodeInstance.x = x;
    nodeInstance.y = y;
    nodeInstance.name = cleanName;
    if (fileType == 'SVG') {
        nodeInstance.exportSettings = [
            {
                contentsOnly: true,
                format: 'SVG',
                suffix: '',
                svgIdAttribute: false,
                svgOutlineText: true,
                svgSimplifyStroke: true
            }
        ];
    }
    else {
        nodeInstance.exportSettings = [
            {
                contentsOnly: true,
                format: 'PNG'
            }
        ];
    }
    // Add instance to our new page.
    page.appendChild(nodeInstance);
    // Keep track of instances for selection.
    newNodes.push(nodeInstance);
    return x + nodeInstance.width + 20;
}
// Select our new instances for easy export.
page.selection = newNodes;
// Go to our new page.
figma.currentPage = page;
// Make sure to close the plugin when you're done. Otherwise the plugin will
// keep running, which shows the cancel button at the bottom of the screen.
figma.closePlugin();
