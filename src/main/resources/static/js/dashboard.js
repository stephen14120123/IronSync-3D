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

// ---- Enhanced Lighting for Anatomical Detail ----
// HemisphereLight: soft ambient from sky/ground — reveals overall form
const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3a3a3a, 0.8);
scene.add(hemiLight);

// Warm key light from upper-right — main muscle contour definition
const keyLight = new THREE.DirectionalLight(0xffeedd, 1.5);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048;
keyLight.shadow.mapSize.height = 2048;
scene.add(keyLight);

// Cool fill light from left-back — reduces harsh shadows
const fillLight = new THREE.DirectionalLight(0x8888ff, 0.5);
fillLight.position.set(-4, 2, -3);
scene.add(fillLight);

// Rim light from behind — creates edge definition and depth separation
const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(0, 4, -6);
scene.add(rimLight);

// ---- Ground grid ----
const grid = new THREE.GridHelper(8, 12, 0x333333, 0x222222);
grid.position.y = -0.5;
scene.add(grid);

// ---- Highlight Helpers ----
const highlightedMeshes = [];

function highlightMesh(mesh, color, emissive) {
    if (mesh.__highlighted) return;
    mesh.__originalMat = mesh.material;
    const matClone = mesh.material.clone();
    matClone.color.setHSL(color.h, color.s, color.l);
    matClone.emissive = emissive.clone();
    matClone.emissiveIntensity = 0.6;
    mesh.material = matClone;
    mesh.__highlighted = true;
    highlightedMeshes.push(mesh);
}

function resetHighlights() {
    highlightedMeshes.forEach(mesh => {
        if (mesh.__originalMat) {
            mesh.material = mesh.__originalMat;
            delete mesh.__originalMat;
            delete mesh.__highlighted;
        }
    });
    highlightedMeshes.length = 0;
}

/**
 * Highlight specified muscle groups on the loaded 3D model.
 * Uses fuzzy matching (child.name.includes(name)) to support various
 * modeling conventions — compatible with any GLTF model whose meshes
 * follow anatomical naming patterns.
 *
 * @param {string[]} meshNameArray - Array of mesh name fragments to match
 * @param {object} [color] - Optional HSL color spec {h, s, l}. Defaults to warm red.
 * @returns {number} Number of meshes highlighted
 */
function highlightMuscleGroups(meshNameArray, color) {
    if (!meshNameArray || !meshNameArray.length) return 0;

    const hsl = color || { h: 0, s: 0.8, l: 0.4 };
    const emissive = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);

    const sceneNodes = [];
    scene.traverse((child) => { if (child.isMesh) sceneNodes.push(child); });

    let count = 0;
    for (const name of meshNameArray) {
        let found = false;
        for (const node of sceneNodes) {
            if (node.name.includes(name)) {
                highlightMesh(node, hsl, emissive);
                count++;
                found = true;
            }
        }
        // Fallback: procedural robot uses bodyParts keyed by canonical names
        if (!found) {
            const fallbackKey = ANATOMICAL_TO_FALLBACK[name];
            if (fallbackKey && bodyParts[fallbackKey]) {
                highlightMesh(bodyParts[fallbackKey], hsl, emissive);
                count++;
            }
        }
    }
    return count;
}

// ---- Fallback mapping: anatomical → procedural robot body parts ----
const ANATOMICAL_TO_FALLBACK = {
    'Quad_L': 'LeftLeg', 'Quad_R': 'RightLeg',
    'Glute_L': 'LeftLeg', 'Glute_R': 'RightLeg',
    'Hamstring_L': 'LeftLeg', 'Hamstring_R': 'RightLeg',
    'LowerBack': 'LowerBack',
    'Pectoral_M_L': 'Chest', 'Pectoral_M_R': 'Chest',
    'Tricep_L': 'LeftArm', 'Tricep_R': 'RightArm',
    'Bicep_L': 'LeftArm', 'Bicep_R': 'RightArm',
    'Deltoid_A_L': 'LeftArm', 'Deltoid_A_R': 'RightArm',
    'Lat_Dorsi_L': 'Torso', 'Lat_Dorsi_R': 'Torso',
    'Trapezius': 'Torso',
    'Abdominal': 'Torso',
};

// ---- GLTF Model Loading ----
// ═══════════════════════════════════════════════════════════════════
//  TO REPLACE WITH HIGH-QUALITY HUMAN ANATOMY MODEL:
//   1. Download a human muscle anatomy GLB (e.g. from Sketchfab)
//   2. Place it in  src/main/resources/static/models/
//   3. Update MODEL_PATH below to point to the new file
//   4. Ensure mesh naming aligns with ironsync.mesh.mappings
//      in application-dev.yml (see model requirements above)
// ═══════════════════════════════════════════════════════════════════
const MODEL_PATH = '/static/models/RobotExpressive.glb';
const bodyParts = {};

function loadModel() {
    const loader = new GLTFLoader();
    updateHint('正在加载 3D 场景...');

    loader.load(
        MODEL_PATH,
        (gltf) => {
            const model = gltf.scene;
            model.scale.set(2.5, 2.5, 2.5);
            model.position.set(0, -0.3, 0);
            scene.add(model);

            // Log all mesh names for debugging anatomical matching
            const foundNodes = [];
            model.traverse((node) => {
                if (node.isMesh) foundNodes.push(node.name);
            });
            console.log('[GLTF] Mesh nodes found:', foundNodes);

            updateHint('3D 场景加载完成');
            loadTrainingData();
            loadSummary();
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
            loadSummary();
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
            return;
        }

        resetHighlights();

        const actions = records.map(r => r.actionName);
        const meshNames = await api.get('/mesh/highlight?actions=' + actions.join(','));

        if (!meshNames || meshNames.length === 0) {
            updateHint('今日训练动作未匹配到高亮部位');
            return;
        }

        const count = highlightMuscleGroups(meshNames);

        if (count === 0) {
            updateHint('模型部位与训练数据未匹配到对应节点');
        } else {
            updateHint('训练部位已高亮 — ' + meshNames.join(' · '));
        }
    } catch (e) {
        updateHint('无法加载今日训练数据');
    }
}

// ---- Dashboard Summary (calories + stats) ----
const RING_CIRCUMFERENCE = 314.16;

async function loadSummary() {
    try {
        const summary = await api.get('/dashboard/summary');
        if (!summary) return;

        document.getElementById('stat-exercises').textContent = summary.exerciseCount ?? '--';
        document.getElementById('stat-sets').textContent = summary.totalSets ?? '--';
        document.getElementById('stat-rpe').textContent = summary.avgRpe != null ? summary.avgRpe : '--';

        const calVal = summary.totalCalories ?? 0;
        const targetVal = summary.targetCalories ?? 600;
        const pct = targetVal > 0 ? Math.min(calVal / targetVal, 1) : 0;

        document.getElementById('cal-current').textContent = calVal;
        document.getElementById('cal-target').textContent = targetVal + ' kcal';

        const ring = document.getElementById('cal-ring');
        const offset = RING_CIRCUMFERENCE * (1 - pct);
        ring.style.transition = 'stroke-dashoffset 0.8s ease-out';
        ring.style.strokeDashoffset = offset;
    } catch (e) {
        // Keep default placeholder values
    }
}

function updateHint(msg) {
    const el = document.getElementById('hint-overlay');
    if (el) el.textContent = msg;
}

// ---- Animation Loop ----
function animate() {
    requestAnimationFrame(animate);

    const pulse = 0.4 + 0.3 * Math.sin(Date.now() * 0.003);
    for (const mesh of highlightedMeshes) {
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => { m.emissiveIntensity = pulse; });
        } else {
            mesh.material.emissiveIntensity = pulse;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

// ---- Entry Point ----
loadModel();
loadSummary();
animate();

// ---- Resize ----
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
