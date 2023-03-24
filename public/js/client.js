import Experience from '../Experience/Experience.js'

// Create a new instance of Experience, passing in a canvas element
const experience = new Experience(document.querySelector('canvas#playCanvas'))

// Make the experience instance available globally
window.experience = experience;

// Set the assets and game variables from the window object
let assets = [
    {asset_name: 'kalyane', unique_name: 'kalyane', position_x: 0, position_z: 0, quaternion_y: 0, quaternion_w: 0 },
    {asset_name: 'london_ground', unique_name: 'london_ground', position_x: 0, position_z: 0, quaternion_y: 0, quaternion_w: 0 },
    {asset_name: 'london_wall', unique_name: 'london_wall', position_x: 0, position_z: 0, quaternion_y: 0, quaternion_w: 0 },
    {asset_name: 'ferris_wheel', unique_name: 'ferris_wheel', position_x: -93, position_z: 44, quaternion_y: 0, quaternion_w: 0 },
    {asset_name: 'london_bus', unique_name: 'london_bus', position_x: -59, position_z: -0.5, quaternion_y: -0.707, quaternion_w: 0.707 },
    {asset_name: 'phone_booth', unique_name: 'phone_booth', position_x: -5.5, position_z: 13.5, quaternion_y: 0, quaternion_w: 0 },
    {asset_name: 'common_tree_1', unique_name: 'common_tree_1', position_x: -10, position_z: 15, quaternion_y: 0, quaternion_w: 0 },
    {asset_name: 'common_tree_3', unique_name: 'common_tree_3', position_x: -10, position_z: 25, quaternion_y: 0, quaternion_w: 0 }
];

// Call the setExperienceAttributes function to initialize the experience
setExperienceAttributes()

function setExperienceAttributes(){
    // Set the attributes of the experience instance
    experience.setAttributes(assets, {'x':100,'z':100}, true, true)
    
    // when all available models are correctly loaded to the experience
    experience.world.on('ready', async () => {
        // adds assets to experience and set the controls
        experience.reset()

        experience.trigger('ready')
    });
}