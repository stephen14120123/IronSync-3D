import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ---- Scene Setup ----
const container = document.getElementById('three-canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121212);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2.5, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ---- Controls ----
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 3;
controls.maxDistance = 12;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.0;
controls.update();

// ---- Lights ----
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0x8888ff, 0.4);
fillLight.position.set(-5, 0, 5);
scene.add(fillLight);

// ---- Ground grid ----
const grid = new THREE.GridHelper(8, 12, 0x333333, 0x222222);
grid.position.y = -0.5;
scene.add(grid);

// ---- Model Node Name Mapping ----
// Canonical names (returned by backend) → actual GLTF mesh name aliases.
// Adjust when using a different .glb model.
const CANONICAL_TO_MODEL = {
    LeftLeg:   ['LeftLeg', 'left_leg', 'Leg_Left', 'Left_Leg', 'UpperLeg_Left', 'LowerLeg_Left', 'Left Leg'],
    RightLeg:  ['RightLeg', 'right_leg', 'Leg_Right', 'Right_Leg', 'UpperLeg_Right', 'LowerLeg_Right', 'Right Leg'],
    LowerBack: ['LowerBack', 'lower_back', 'Hips', 'Spine', 'Waist', 'Hip_Reference'],
    Chest:     ['Chest', 'chest', 'Chest_Reference', 'UpperBody', 'Torso_Reference'],
    LeftArm:   ['LeftArm', 'left_arm', 'Arm_Left', 'Left_Arm', 'UpperArm_Left', 'LowerArm_Left', 'Left Arm'],
    RightArm:  ['RightArm', 'right_arm', 'Arm_Right', 'Right_Arm', 'UpperArm_Right', 'LowerArm_Right', 'Right Arm'],
    Head:      ['Head', 'head', 'Head_Reference'],
    Torso:     ['Torso', 'torso', 'Body', 'Spine1', 'Spine2', 'Body_Reference'],
};

const bodyParts = {};

// ---- Material Helpers ----
function cloneMaterialToHighlight(mat) {
    const clone = mat.clone();
    clone.color.setHSL(0, 0.8, 0.4);
    clone.emissive = new THREE.Color(0xFF2A2A);
    clone.emissiveIntensity = 0.6;
    return clone;
}

function applyHighlight(mesh) {
    if (mesh.__highlighted) return;
    mesh.__originalMat = mesh.material;
    if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map(cloneMaterialToHighlight);
    } else {
        mesh.material = cloneMaterialToHighlight(mesh.material);
    }
    mesh.__highlighted = true;
}

function resetHighlights() {
    for (const name in bodyParts) {
        const mesh = bodyParts[name];
        if (mesh.__highlighted && mesh.__originalMat) {
            mesh.material = mesh.__originalMat;
            delete mesh.__originalMat;
            mesh.__highlighted = false;
        }
    }
}

// ---- GLTF Model Loading ----
function loadModel() {
    const loader = new GLTFLoader();
    updateHint('正在加载 3D 场景...');

    loader.load(
        '/static/models/RobotExpressive.glb',
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(2.5, 2.5, 2.5);
            model.position.set(0, -0.3, 0);
            scene.add(model);

            // Build bodyParts index: match model mesh names through CANONICAL_TO_MODEL
            const foundNodes = [];
            model.traverse((node) => {
                if (node.isMesh) {
                    foundNodes.push(node.name);
                    for (const [canonical, aliases] of Object.entries(CANONICAL_TO_MODEL)) {
                        if (aliases.includes(node.name)) {
                            bodyParts[canonical] = node;
                            break;
                        }
                    }
                }
            });
            console.log('[GLTF] Mesh nodes found:', foundNodes);
            console.log('[GLTF] Mapped body parts:', Object.keys(bodyParts));

            updateHint('3D 场景加载完成');
            loadTrainingData();
        },
        (xhr) => {
            if (xhr.total > 0) {
                const pct = Math.round((xhr.loaded / xhr.total) * 100);
                updateHint(`正在加载人体模型... ${pct}%`);
            }
        },
        (err) => {
            console.warn('GLB model load failed, using fallback geometry:', err);
            updateHint('3D 模型加载失败，使用备用渲染');
            buildFallbackRobot();
            loadTrainingData();
        }
    );
}

// ---- Fallback: Procedural Geometry Robot ----
function buildFallbackRobot() {
    const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x5588bb, roughness: 0.5, metalness: 0.3
    });
    const jointMat = new THREE.MeshStandardMaterial({
        color: 0x4466aa, roughness: 0.6, metalness: 0.2
    });

    const group = new THREE.Group();

    function addPart(key, mesh) {
        mesh.castShadow = true;
        group.add(mesh);
        bodyParts[key] = mesh;
    }

    // Torso
    addPart('Torso', new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.2, 12), bodyMat.clone()));
    bodyParts['Torso'].position.y = 1.2;

    // Head
    addPart('Head', new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), bodyMat.clone()));
    bodyParts['Head'].position.y = 2.1;

    // Left Arm
    const armGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.9, 8);
    addPart('LeftArm', new THREE.Mesh(armGeo, jointMat.clone()));
    bodyParts['LeftArm'].position.set(-0.75, 1.5, 0);
    bodyParts['LeftArm'].rotation.z = 0.15;

    // Right Arm
    addPart('RightArm', new THREE.Mesh(armGeo, jointMat.clone()));
    bodyParts['RightArm'].position.set(0.75, 1.5, 0);
    bodyParts['RightArm'].rotation.z = -0.15;

    // Left Leg
    const legGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.0, 8);
    addPart('LeftLeg', new THREE.Mesh(legGeo, jointMat.clone()));
    bodyParts['LeftLeg'].position.set(-0.3, 0.5, 0);

    // Right Leg
    addPart('RightLeg', new THREE.Mesh(legGeo, jointMat.clone()));
    bodyParts['RightLeg'].position.set(0.3, 0.5, 0);

    // Lower Back
    addPart('LowerBack', new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.3), bodyMat.clone()));
    bodyParts['LowerBack'].position.set(0, 0.65, -0.3);

    // Chest
    addPart('Chest', new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.2), bodyMat.clone()));
    bodyParts['Chest'].position.set(0, 1.6, 0.35);

    scene.add(group);
}

// ---- Data Linkage via Backend ----
async function loadTrainingData() {
    try {
        const records = await api.get('/training-records/today');
        if (!records || records.length === 0) {
            updateHint('今日尚未记录训练，开始你的训练吧！');
            updateStats([]);
            return;
        }

        // Reset previous highlights before applying new ones
        resetHighlights();

        // Call backend for mesh mapping (decoupled from frontend)
        const actions = records.map(r => r.actionName);
        const meshNames = await api.get('/mesh/highlight?actions=' + actions.join(','));

        if (!meshNames || meshNames.length === 0) {
            updateHint('今日训练动作未匹配到高亮部位');
            updateStats(records);
            return;
        }

        let highlightedCount = 0;
        meshNames.forEach(name => {
            const mesh = bodyParts[name];
            if (mesh) {
                applyHighlight(mesh);
                highlightedCount++;
            }
        });

        if (highlightedCount === 0) {
            updateHint('模型部位与训练数据未匹配到对应节点');
        } else {
            updateHint('训练部位已高亮 — ' + meshNames.join(' · '));
        }

        updateStats(records);
    } catch (e) {
        updateHint('无法加载今日训练数据');
    }
}

function updateStats(records) {
    if (!records || records.length === 0) {
        document.getElementById('stat-exercises').textContent = '--';
        document.getElementById('stat-sets').textContent = '--';
        document.getElementById('stat-rpe').textContent = '--';
        return;
    }
    const totalSets = records.reduce((s, r) => s + (r.sets || 0), 0);
    const avgRpe = (records.reduce((s, r) => s + (r.rpe || 0), 0) / records.length).toFixed(1);
    document.getElementById('stat-exercises').textContent = records.length;
    document.getElementById('stat-sets').textContent = totalSets;
    document.getElementById('stat-rpe').textContent = avgRpe;
}

function updateHint(msg) {
    const el = document.getElementById('hint-overlay');
    if (el) el.textContent = msg;
}

// ---- Animation Loop ----
function animate() {
    requestAnimationFrame(animate);

    const pulse = 0.4 + 0.3 * Math.sin(Date.now() * 0.003);
    for (const name in bodyParts) {
        const mesh = bodyParts[name];
        if (mesh.__highlighted) {
            if (Array.isArray(mesh.material)) {
                mesh.material.forEach(m => { m.emissiveIntensity = pulse; });
            } else {
                mesh.material.emissiveIntensity = pulse;
            }
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

// ---- Entry Point ----
// Start model loading (falls back to procedural geometry on error)
loadModel();
animate();

// ---- Resize ----
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

