import * as THREE from 'three';

// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00000000);

const $canvas = document.getElementById('tabuleiro');
const camera = new THREE.PerspectiveCamera(75, $canvas.clientWidth/$canvas.clientHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ canvas: $canvas });
renderer.setSize($canvas.clientWidth, $canvas.clientHeight);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// add grid helper
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Animation loop
let oldTime = performance.now();
let now = performance.now();

function animate() {
    now = performance.now();
    const deltaTime = now - oldTime;
    oldTime = now;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    tracker.update(deltaTime);
}


// instantiate a loader
// const objLoader = new OBJLoader().setPath('./modelos/');
// const mtlLoader = new MTLLoader().setPath('./modelos/');
// const ob = []
// mtlLoader.load('Untitled.mtl', (materials) => {
//     materials.preload()
//     objLoader.setMaterials(materials); // Apply the loaded materials
//     objLoader.load('Untitled.obj', (object) => {
//         // The object is now loaded with its materials applied
//         ob.push(object);
//         scene.add(object);
//     },
//     // Optional: onProgress callback
//     (xhr) => {
//         console.log((xhr.loaded / xhr.total * 100) + '% loaded');
//     },
//     // Optional: onError callback
//     (error) => {
//         console.log('An error happened', error);
//     });
// })



// Timeout e Interval em deltat
let tracker = {
    update(delta){
        this.timeout_list.forEach((item) => {
            item.execute(delta);
        })
        this.tick_list.forEach((item) => {
            item.execute(delta)
        })
    },
    registerTick(execute, during, ondeath = () => {}){
        const item = {
            kill_switch : this.registerTimeout(() => {tracker.tick_list.splice(tracker.tick_list.indexOf(item), 1); ondeath()}, during),
            execute : (delta) => {
                try {
                    execute(delta)
                }catch{
                    console.error('Error executing ' + execute)
                    this.timeout_list.splice(item.kill_switch);
                    tracker.tick_list.splice(tracker.tick_list.indexOf(item), 1)
                }}
        }
        this.tick_list.push(item);
    },
    registerTimeout(execute, after){
        const item = {
            registered_at: now,
            executes_at: now + after,
            execute: (delta) => {
                const excesso_tempo = now - item.executes_at;
                if (excesso_tempo >= 0){
                    try{
                    execute(delta - excesso_tempo);
                    }catch{
                        console.error('Error executing ' + execute)
                    }
                    this.timeout_list.splice(this.timeout_list.indexOf(item), 1);
                }
            },
        }
        this.timeout_list.push(item);
        return this.timeout_list.indexOf(item);
    },
    tick_list: [],
    timeout_list: []
};

function posicaoTabuleiro(n, l, tamanhoCasa = 1, gapcasa = 0){
    // y = quantas linhas foram percorridas
    let y = Math.floor(n / l);

    // x = progresso na linha (invertido se y for ímpar)
    let x = (y % 2) ?  l - (n % l) - 1 : (n % l);
    return [x, y];
}

function criarTabuleiro(numeroCasas, tamanhoLinha = 5){
    const tabuleiro = new THREE.Group();
    const gapCasa = 0.5;
    const tamanhoCasa = 1;

    for(let i = 0; i < numeroCasas; i++){
        const pos = posicaoTabuleiro(i, tamanhoLinha);
        const geometry = new THREE.BoxGeometry(tamanhoCasa, 0.1, tamanhoCasa);
        const material = new THREE.MeshStandardMaterial({
            color: ((i/numeroCasas * 0xff) << 16) * 1 + (i/numeroCasas * 0xff << 8)* 0 +  + (i/numeroCasas * 0xff) * 0
        });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(pos[0]*(tamanhoCasa + gapCasa), 0, pos[1]*(tamanhoCasa + gapCasa));
        tabuleiro.add(square);
    }
    tabuleiro.position.set(-(((tamanhoLinha * (tamanhoCasa + gapCasa)) - 3*gapCasa) / 2), 0, -(((numeroCasas/tamanhoLinha * (tamanhoCasa + gapCasa)) - 3*gapCasa) / 2));
    return tabuleiro;
}

function init(){
    scene.add(criarTabuleiro(25));
    animate();
}
init();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize($canvas.clientWidth, $canvas.clientHeight);
});


const cube_geometry = new THREE.BoxGeometry();
const cube_material = new THREE.MeshStandardMaterial();
const cube = new THREE.Mesh(cube_geometry, cube_material);
scene.add(cube);


// camera movement controls
window.addEventListener('keydown', (event) => {
    const step = 0.2;
    switch (event.key) {
        case 'ArrowUp':
            camera.position.z -= step;
            break;
        case 'ArrowDown':
            camera.position.z += step;
            break;
        case 'ArrowLeft':
            camera.position.x -= step;
            break;
        case 'ArrowRight':
            camera.position.x += step;
            break;
        case 'w':
            camera.position.y += step;
            break;
        case 's':
            camera.position.y -= step;
            break;
        case 'i':
            cube.position.z -= step;
            break;
        case 'k':
            cube.position.z += step;
            break;
        case 'j':
            cube.position.x -= step;
            break;
        case 'l':
            cube.position.x += step;
            break;
        case 'u':
            cube.position.y += step;
            break;
        case 'o':
            cube.position.y -= step;
            break;
    }
    camera.lookAt(cube.position);
});
window.addEventListener('click', (e) =>{
    // console.log('cu:' + cube.position.toArray())
    // console.log('ca:' + camera.position.toArray())
})
