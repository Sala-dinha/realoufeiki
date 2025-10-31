import * as THREE from 'three';

import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

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
const objLoader = new OBJLoader().setPath('./modelos/');
const mtlLoader = new MTLLoader().setPath('./modelos/');
const modelos = []
mtlLoader.load('Untitled.mtl', (materials) => {
    materials.preload()
    objLoader.setMaterials(materials); // Apply the loaded materials
    objLoader.load('Untitled.obj', (object) => {
        // The object is now loaded with its materials applied
        object.scale.set(0.2, 0.2, 0.2)
        modelos.push(object);
        init();
    },
    // Optional: onProgress callback
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    // Optional: onError callback
    (error) => {
        console.log('An error happened', error);
    });
})



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
                    // console.error('Error executing ' + execute)
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
                        // console.error('Error executing ' + execute)
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

function posicaoTabuleiro(n, l, tamanhoCasa = 1, gapCasa = 0.5){
    // y = quantas linhas foram percorridas
    let y = Math.floor(n / l);

    // x = progresso na linha (invertido se y for ímpar)
    let x = (y % 2) ?  l - (n % l) - 1 : (n % l);
    return [x*(tamanhoCasa + gapCasa), y*(tamanhoCasa + gapCasa)];
}

// TODO: colorir de acordo com os temas
function criarTabuleiro(numeroCasas, tamanhoLinha = 5){
    const tabuleiro = new THREE.Group();
    const gapCasa = 0.5;
    const tamanhoCasa = 1;
    const largura = ((tamanhoLinha - 1) * (tamanhoCasa + gapCasa));
    const profundidade = (Math.floor(numeroCasas/tamanhoLinha - 1) * (tamanhoCasa + gapCasa));

    for(let i = 0; i < numeroCasas; i++){
        const pos = posicaoTabuleiro(i, tamanhoLinha);
        const geometry = new THREE.BoxGeometry(tamanhoCasa, 0.1, tamanhoCasa);
        const material = new THREE.MeshStandardMaterial({
            color: ((i/numeroCasas * 0xff) << 16) * 1 + (i/numeroCasas * 0xff << 8)* 0 +  + (i/numeroCasas * 0xff) * 0
        });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(pos[0], 0, pos[1]);
        tabuleiro.add(square);
    }
    tabuleiro.position.set(-(largura / 2), 0, -(profundidade / 2));
    return tabuleiro;
}

let tabuleiro;
let peoes = [];
const player_cores = [
    0xff0000,
    0x00ff00,
    0x0000ff,
    0xffff00,
]

function gerarPeoes(players){
    players.forEach((player, index) => {
        if (player.ativo == false) return;

        let peao = modelos[0].clone();
        console.log(peao)
        peao.children[1].material = new THREE.MeshBasicMaterial({color: player_cores[index]})
        peao.position.y+= 0.6;
        setBoardPos(peao, 0);
        peoes.push(peao)
        scene.add(peao)
    })
}
function init(players){
    tabuleiro = criarTabuleiro(15);
    gerarPeoes([1, 2, 3, 4])
    movePlayerBoard(peoes[0], 0, 15, 300);
    movePlayerBoard(peoes[2], 0, 3, 300);
    movePlayerBoard(peoes[1], 0, 4, 300);
    movePlayerBoard(peoes[3], 0, 2, 300);

    scene.add(tabuleiro);
    animate();
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize($canvas.clientWidth, $canvas.clientHeight);
});

function instantiate_cube(){
    const cube_geometry = new THREE.BoxGeometry();
    const cube_material = new THREE.MeshStandardMaterial();
    return new THREE.Mesh(cube_geometry, cube_material);
}

function getBoardPos(pos_tabuleiro){
    let coord = posicaoTabuleiro(pos_tabuleiro, 5, 1, 0.5);
    let offset = [tabuleiro.position.x, tabuleiro.position.z]
    return [coord[0] + offset[0], coord[1] + offset[1]]
}
function setBoardPos(player, pos_tabuleiro){
    const pos = getBoardPos(pos_tabuleiro)
    player.position.x = pos[0]
    player.position.z = pos[1]
}
function incrementPlayerPos(player, currentPos, tempo, ondeath){
    const aim = getBoardPos(currentPos+1)
    const current = getBoardPos(currentPos);
    const dist_x = aim[0] - current[0]
    const dist_z = aim[1] - current[1]
    const vel_x = dist_x/(tempo*1000)
    const vel_z = dist_z/(tempo*1000)
    // TODO: rotacionar direito
    tracker.registerTick((delta) => {

        player.rotation.y = (vel_x > 0) ? 0: (vel_x < 0) ? Math.PI : (vel_z > 0) ? -Math.PI/2 : 0;
        player.position.x += delta*vel_x
        player.position.z += delta*vel_z
    }, tempo*1000, () => {
        setBoardPos(player, currentPos+1);
        ondeath();
    })
}

function movePlayerBoard(player, currentPos, targetPos, time = 200){
    const amount = targetPos - currentPos;

    const problem = setInterval(() => {(incrementPlayerPos(player, currentPos++, time/1000))}, time)
    tracker.registerTimeout(() => {clearInterval(problem)}, time*amount)
    
}


// camera movement controls
// window.addEventListener('keydown', (event) => {
//     const step = 0.2;
//     switch (event.key) {
//         case 'ArrowUp':
//             camera.position.z -= step;
//             break;
//         case 'ArrowDown':
//             camera.position.z += step;
//             break;
//         case 'ArrowLeft':
//             camera.position.x -= step;
//             break;
//         case 'ArrowRight':
//             camera.position.x += step;
//             break;
//         case 'w':
//             camera.position.y += step;
//             break;
//         case 's':
//             camera.position.y -= step;
//             break;
//         case 'i':
//             cube.position.z -= step;
//             break;
//         case 'k':
//             cube.position.z += step;
//             break;
//         case 'j':
//             cube.position.x -= step;
//             break;
//         case 'l':
//             cube.position.x += step;
//             break;
//         case 'u':
//             cube.position.y += step;
//             break;
//         case 'o':
//             cube.position.y -= step;
//             break;
//     }
//     camera.lookAt(cube.position);
// });
