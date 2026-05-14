import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

// ---- Ground subtle grid ----
const grid = new THREE.GridHelper(8, 12, 0x333333, 0x222222);
grid.position.y = -0.5;
scene.add(grid);

// ---- Proxy Humanoid Robot ----
const bodyParts = {};
const group = new THREE.Group();

const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x5588bb,
    roughness: 0.5,
    metalness: 0.3
});
const jointMat = new THREE.MeshStandardMaterial({
    color: 0x4466aa,
    roughness: 0.6,
    metalness: 0.2
});

// Torso
const torsoGeo = new THREE.CylinderGeometry(0.6, 0.7, 1.2, 12);
const torso = new THREE.Mesh(torsoGeo, bodyMat.clone());
torso.position.y = 1.2;
torso.castShadow = true;
group.add(torso);
bodyParts['躯干'] = torso;

// Head
const headGeo = new THREE.SphereGeometry(0.35, 16, 16);
const head = new THREE.Mesh(headGeo, bodyMat.clone());
head.position.y = 2.1;
head.castShadow = true;
group.add(head);
bodyParts['头部'] = head;

// Left Arm
const armGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.9, 8);
const leftArm = new THREE.Mesh(armGeo, jointMat.clone());
leftArm.position.set(-0.75, 1.5, 0);
leftArm.rotation.z = 0.15;
leftArm.castShadow = true;
group.add(leftArm);
bodyParts['左臂'] = leftArm;

// Right Arm
const rightArm = new THREE.Mesh(armGeo, jointMat.clone());
rightArm.position.set(0.75, 1.5, 0);
rightArm.rotation.z = -0.15;
rightArm.castShadow = true;
group.add(rightArm);
bodyParts['右臂'] = rightArm;

// Left Leg
const legGeo = new THREE.CylinderGeometry(0.18, 0.22, 1.0, 8);
const leftLeg = new THREE.Mesh(legGeo, jointMat.clone());
leftLeg.position.set(-0.3, 0.5, 0);
leftLeg.castShadow = true;
group.add(leftLeg);
bodyParts['左腿'] = leftLeg;

// Right Leg
const rightLeg = new THREE.Mesh(legGeo, jointMat.clone());
rightLeg.position.set(0.3, 0.5, 0);
rightLeg.castShadow = true;
group.add(rightLeg);
bodyParts['右腿'] = rightLeg;

// Lower Back (glutes area)
const gluteGeo = new THREE.BoxGeometry(0.5, 0.2, 0.3);
const glutes = new THREE.Mesh(gluteGeo, bodyMat.clone());
glutes.position.set(0, 0.65, -0.3);
group.add(glutes);
bodyParts['下背部'] = glutes;

// Chest
const chestGeo = new THREE.BoxGeometry(0.6, 0.4, 0.2);
const chest = new THREE.Mesh(chestGeo, bodyMat.clone());
chest.position.set(0, 1.6, 0.35);
group.add(chest);
bodyParts['胸部'] = chest;

scene.add(group);

// ---- Action -> BodyPart mapping ----
const ACTION_MESH_MAP = {
    '杠铃深蹲':    ['左腿', '右腿', '下背部'],
    '罗马尼亚硬拉': ['下背部', '左腿', '右腿'],
    '卧推':        ['胸部', '左臂', '右臂'],
    '推举':        ['左臂', '右臂', '躯干'],
    '引体向上':    ['左臂', '右臂', '躯干']
};

// ---- Data Linkage ----
async function loadTrainingData() {
    try {
        const records = await api.get('/training-records/today');
        if (!records || records.length === 0) {
            showHint('今日尚未记录训练，开始你的训练吧！');
            return;
        }

        const highlighted = new Set();
        for (const r of records) {
            const parts = ACTION_MESH_MAP[r.actionName];
            if (parts) {
                parts.forEach(p => highlighted.add(p));
            }
        }

        if (highlighted.size === 0) {
            showHint('今日训练动作未匹配到高亮部位');
            return;
        }

        highlighted.forEach(name => {
            const mesh = bodyParts[name];
            if (mesh && !mesh.__highlighted) {
                mesh.__originalMat = mesh.material;
                const newMat = mesh.material.clone();
                newMat.color.setHSL(0, 0.8, 0.4);
                newMat.emissive = new THREE.Color(0xFF2A2A);
                newMat.emissiveIntensity = 0.6;
                mesh.material = newMat;
                mesh.__highlighted = true;
            }
        });

        // Update stats
        const totalSets = records.reduce((s, r) => s + (r.sets || 0), 0);
        const avgRpe = (records.reduce((s, r) => s + (r.rpe || 0), 0) / records.length).toFixed(1);
        document.getElementById('stat-exercises').textContent = records.length;
        document.getElementById('stat-sets').textContent = totalSets;
        document.getElementById('stat-rpe').textContent = avgRpe;

        showHint('训练部位已高亮 — ' + [...highlighted].join(' · '));
    } catch (e) {
        // api.js already alerted
        showHint('无法加载今日训练数据');
    }
}

function showHint(msg) {
    const el = document.getElementById('hint-overlay');
    if (el) el.textContent = msg;
}

// ---- Animation Loop ----
function animate() {
    requestAnimationFrame(animate);

    // Pulse emissive on highlighted meshes
    const pulse = 0.4 + 0.3 * Math.sin(Date.now() * 0.003);
    for (const name in bodyParts) {
        const mesh = bodyParts[name];
        if (mesh.__highlighted) {
            mesh.material.emissiveIntensity = pulse;
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

// ---- Fallback if Three.js failed ----
if (typeof THREE === 'undefined') {
    document.getElementById('hint-overlay').textContent = '3D 场景加载失败，请检查网络连接';
} else {
    animate();
    loadTrainingData();
}

// ---- Resize ----
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

