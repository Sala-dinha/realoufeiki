/* ======= Imports ======= */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ======= Scene setup & constants ======= */
THREE.Cache.enabled = true;
const $canvas = document.getElementById('tabuleiro');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({canvas: $canvas});
const controls = new OrbitControls(camera, renderer.domElement)
const clock = new THREE.Clock();


/* ======= Event listeners ======= */
window.addEventListener('resize', () =>{
    renderer.setSize($canvas.clientWidth, $canvas.clientHeight)
})

/* ======= Scene configuration ======= */
function setup(){
    camera.position.set(0, 2, 5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
}

/* ======= Model loading ======= */
const path_modelo = './modelos/cubao.glb';
const loader = new GLTFLoader();

/* ======= Animation functions ======= */
function animate() {
    const delta = clock.getDelta()
    mixers.forEach((m) => {
        if (m)
        m.update(delta)
    })
    controls.update()
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

/* ======= Board creation & utilities ======= */
function posicaoTabuleiro(n, l, tamanhoCasa = 1, gapcasa = 0){
    // y = quantas linhas foram percorridas
    let y = Math.floor(n / l);

    // x = progresso na linha (invertido se y for ímpar)
    let x = (y % 2) ?  l - (n % l) - 1 : (n % l);
    return [x, y];
}
const casas = []
function criarTabuleiro(pcasas, temas, tamanhoLinha = 5){
    const numeroCasas = pcasas.length;
    const tabuleiro = new THREE.Group();
    const gapCasa = 0.5;
    const tamanhoCasa = 1;

    for(let i = 0; i < numeroCasas; i++){
        const pos = posicaoTabuleiro(i, tamanhoLinha);
        const geometry = new THREE.BoxGeometry(tamanhoCasa, 0.1, tamanhoCasa);
        const material = new THREE.MeshStandardMaterial({
            color: temas[pcasas[i]].cor
        });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(pos[0]*(tamanhoCasa + gapCasa), 0, pos[1]*(tamanhoCasa + gapCasa));
        casas.push(square)
        tabuleiro.add(square);
    }
    tabuleiro.position.set(-(((tamanhoLinha * (tamanhoCasa + gapCasa)) - 3*gapCasa) / 2), 0, -(((numeroCasas/tamanhoLinha * (tamanhoCasa + gapCasa)) - 3*gapCasa) / 2));
    return tabuleiro;
}
/* ======= State variables ======= */
let tabuleiro;
let mixers = []
let animacoes = [];
let peoes = [];

/* ======= Initialization ======= */
export function init(params){
    setup();
    tabuleiro = criarTabuleiro(params.casas, params.temas)
    scene.add(tabuleiro);
    adicionarPeoes(params.players)
    animate();
    setTimeout(() => renderer.setSize($canvas.clientWidth, $canvas.clientHeight), 50)
}

/* ======= Debug & testing ======= */
let i = 0;
window.addEventListener('keydown', (e) => {
    if (e.key != 'i') return;
    moveTo(0, i++)
});
let j = 0;
window.addEventListener('keydown', (e) => {
    if (e.key != 'j') return;
    moveTo(1, j++)
});
let k = 0;
window.addEventListener('keydown', (e) => {
    if (e.key != 'k') return;
    moveTo(2, k++)
});
let l = 0;
window.addEventListener('keydown', (e) => {
    if (e.key != 'l') return;
    moveTo(3, l++)
});

function adicionarPeoes(players){
    console.log(players)
    
    players.forEach((p)=>{
        if (p.ativo){
            loader.load(path_modelo, (gltf) => {

            const peao = gltf.scene;
            const textura = new THREE.TextureLoader().load(p.imagem);
            const mixer = new THREE.AnimationMixer(peao);
            peao.scale.set(0.25, 0.25, 0.25)
            peao.position.y += 0.6;
            textura.colorSpace = THREE.SRGBColorSpace
            textura.flipY = false;
            
            if (!animacoes.includes(gltf.animations))
            animacoes.push(gltf.animations);

            peao.traverse((child) => {
                if (child.name == 'Cabeca'){
                    child.material.map = textura;
                    child.material.needsUpdate = true;
                }
                if (child.name == 'Membros'){
                    child.material = new THREE.MeshStandardMaterial({color: p.cor})
                    child.material.needsUpdate = true;
                }
            })
            mixers[p.indice] = mixer;
            peoes[p.indice] = peao;
            scene.add(peao)
            })
        }
        else{
            mixers[p.indice] = null;
            peoes[p.indice] = null;
        }
    })
}


// function moveTo(playerindex, goal_x, goal_z){
//     const peao = peoes[playerindex];
//     createjs.Tween.get(peao.position)
//     .to({ x: goal_x, z: goal_z}, 800, createjs.Ease.getPowInOut(2));
// }

function moveTo(playerindex, numcasa){
    const peao = peoes[playerindex];
    const mixer = mixers[playerindex]
    const goal = casas[numcasa].getWorldPosition(new THREE.Vector3())

    // posição
    createjs.Tween.get(peao.position)
    .call(() => {mixer.clipAction(THREE.AnimationClip.findByName(animacoes[0], 'Andar')).play()})
    .to({ x: goal.x, z: goal.z}, 800, createjs.Ease.getPowInOut(2))
    .call(() => {mixer.clipAction(THREE.AnimationClip.findByName(animacoes[0], 'Andar')).stop()})

    // rodar
    const previous = casas[(numcasa-1 >= 0) ? numcasa-1 : 0].getWorldPosition(new THREE.Vector3())
    const a = new THREE.Vector2(-previous.x, previous.z);
    const b = new THREE.Vector2(-goal.x, goal.z);

    const angulo = (a.sub(b).angle());
    peao.rotation.y = angulo;
    console.log(angulo)


}
