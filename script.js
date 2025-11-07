import deck from './quiz.json' with {type: 'json'};
import Personagens from './personagens.json' with {type: 'json'};
import * as tab3d from './tabuleiro.js'

/* ======= Constants & state ======= */
const TEMAS = [
    {tema: 'politica',      cor: 0x1F4E79, imagem: ''}, // azul petróleo
    {tema: 'podcasts',      cor: 0x4CAF50, imagem: ''}, // verde musgo
    {tema: 'politiquetes',  cor: 0xFF7043, imagem: ''}, // laranja queimado
    {tema: 'celebretes',    cor: 0x9575CD, imagem: ''}, // roxo suave
    {tema: 'davy jones',    cor: 0xFFF176, imagem: ''}, // amarelo pastel
    {tema: 'alanzoka',      cor: 0xE53935, imagem: ''}  // vermelho cereja
];


let perfis = ['','','',''];
const animacao = {}
let carta_atual = {tema: '', texto: '', real: false};
let jogadores = [
    {ativo: false, personagem: '', turnos: 1, acertos: 0, dados: 0, posicao: 0, indice: 0, cor: '#FF0000', imagem: ''},
    {ativo: false, personagem: '', turnos: 1, acertos: 0, dados: 0, posicao: 0, indice: 1, cor: '#0000FF', imagem: ''},
    {ativo: false, personagem: '', turnos: 1, acertos: 0, dados: 0, posicao: 0, indice: 2, cor: '#FF82A9', imagem: ''},
    {ativo: false, personagem: '', turnos: 1, acertos: 0, dados: 0, posicao: 0, indice: 3, cor: '#FFFF00', imagem: ''}
];
let jogadores_ativos = [];
let jogador_atual = 0;
const tamanhoTabuleiro = 15;
const tabuleiro = gerarTabuleiro(tamanhoTabuleiro);



/* ======= DOM references (cached) ======= */
const $baralho = document.querySelector('#baralho');
let $barras = [];
const $copo = document.querySelector('#copo');
const $dado = document.querySelector('#dado');
const $iniciar_jogo = document.querySelector('#iniciar_jogo');
const $feiki = document.querySelector('#feiki');
const $carta = document.querySelector('#carta');
const $cartaTexto = document.querySelector('#carta p');
const $confirmaPersonagens = document.querySelector('#confirma_personagens');
const $real = document.querySelector('#real');
const $statusPlayers = document.querySelector('#status_players');
const $canvas = document.getElementById('tabuleiro');


// telas
let $tela_atual = null;
const $entrada = document.getElementById('tela_entrada');
const $selecao = document.getElementById('tela_selecao');
const $tabuleiro = document.getElementById('tela_tabuleiro');
const $jogo = document.getElementById('tela_jogo');
const $podio = document.getElementById('tela_podio');

/* ======= Utility functions ======= */

function trocaTela(telaDestino){
    if (telaDestino != $tabuleiro){
        window.removeEventListener('resize', () =>{
        tab3d.renderer.setSize($canvas.clientWidth, $canvas.clientHeight)
    })}
    else{
        window.addEventListener('resize', () =>{
        tab3d.renderer.setSize($canvas.clientWidth, $canvas.clientHeight)})
    }
    $copo.classList.remove('levantando');
    if ($tela_atual) {
        $tela_atual.style.display = 'none';
    }
    $tela_atual = telaDestino;
    if ($tela_atual) {
        $tela_atual.style.display = '';
    }
}

async function comecarJogo(){
    await tab3d.init({
        casas: tabuleiro,
        temas: TEMAS,
        players: jogadores
    });
    criarPerfis();
    jogador_atual = jogadores_ativos[0];
    
    perfis[jogador_atual].classList.add('turno');
    trocaTela($tabuleiro);
    
}

function criarPerfil(jogador){
    const imagem = Personagens.find((p) => p.character == jogador.personagem).imagem;
    $statusPlayers.innerHTML +=
                    `<div class="player" player="${jogador.indice}">
                        <img src="${imagem}" style="border-color: ${jogador.cor};"/>
                        <div class="coluna">
                            <p>${jogador.personagem}</p>
                            <div class="barra">
                                <div class="progresso"><p>0%</p></div>
                            </div>
                        </div>
                    </div>`;
}
function criarPerfis(){
    jogadores.forEach((j, index) => {if (j.ativo) {
        jogadores_ativos.push(index);
        criarPerfil(j);
    }});
    $statusPlayers.childNodes.forEach((e) => {
        let player = e.getAttribute('player')
        perfis[player] = e;
    })
    $barras = document.querySelectorAll('.progresso')
}

function setTurno(num_player){
    perfis[jogador_atual].classList.remove('turno')
    jogador_atual = num_player;
    perfis[num_player].classList.add('turno')
}
function getNextPlayer(){
    return jogadores_ativos[(jogadores_ativos.indexOf(jogador_atual) + 1) % jogadores_ativos.length]
}

function rodarDado(){
    let resultado = Math.floor(Math.random() * 6) + 1;
    // colocar animação bonitinha aqui

    return resultado;
}

async function confirmaPersonagens(){
    const cursores = document.querySelectorAll('.seletor');
    cursores.forEach((seletor, index) => {
        const personagem = seletor.getAttribute('character');
        jogadores[index].personagem = personagem;
        if (personagem) {
            jogadores[index].ativo = true;
            jogadores[index].imagem = Personagens.find(p => p.character == personagem).imagem
        }
        else {
            jogadores[index].ativo = false;
        }
    });
    console.log('Jogadores confirmados:', jogadores);
    if (jogadores.filter(j => j.ativo).length < 1) {
        alert('Selecione pelo menos um personagem para jogar!');
        return;
    }
    await comecarJogo();
}

function gerarTabuleiro(tamanho) {
    return Array.from({length: tamanho+1}, () => Math.ceil(Math.random() * (TEMAS.length -1)));
    // sem tema raluca porque é chato
}

function deck_pull() {
    // draw a random card from the deck and remove it
    const index = Math.floor(Math.random() * deck.length);
    const carta = deck[index];
    // defensive: if deck is empty, return a default
    if (!carta) return {tema: '', texto: '', real: false};
    deck.splice(index, 1);
    return carta;
}

function carta_tema(tema) {
    const cartas = deck.filter(c => c.tema === tema);
    if (!cartas.length) return null;
    const sel = cartas[Math.floor(Math.random() * cartas.length)];
    deck.splice(deck.indexOf(sel), 1);

    return sel;
}

function mostra_carta(carta) {
    if ($cartaTexto) $cartaTexto.innerHTML = carta?.texto ?? '';
}

let dado = 0
let movimento = 0;

function clicarCopo() {
    const player = jogadores[jogador_atual];
    $copo.removeEventListener('click', clicarCopo);
    $copo.classList.add('tremendo');
    $copo.classList.remove('levantando');
    dado = rodarDado()
    player.dados += dado;
    movimento = Math.min(tabuleiro.length-1 - player.posicao, dado)
    player.posicao += movimento;

    $dado.setAttribute('src', `imagens/dado${dado}.png`);
    setTimeout(() => {
        $copo.classList.remove('tremendo');
        $copo.classList.add('levantando');
    }, 2000);

    setTimeout(() => {
        $baralho.classList.add('upando');
        atualizarBarra(player.indice);

        tab3d.prettyWalk(jogador_atual, player.posicao-movimento, player.posicao);
    }, 4000);

    setTimeout(() => {
        $baralho.addEventListener('click', quiz);
    }, 6000);
}


function quiz(){
    $copo.addEventListener('click', clicarCopo);
    $baralho.removeEventListener('click', quiz);
    $baralho.classList.remove('upando');
    const player = jogadores[jogador_atual];

    trocaTela($jogo);
    carta_atual = carta_tema(player.posicao);
    carta_atual == null ? carta_atual = deck_pull() : 0;
    mostra_carta(carta_atual);
}

function atualizarBarra(jogador) {
    const barra = $barras[jogadores_ativos.indexOf(jogador)]
    const p = jogadores[jogador]
    const pctg = Math.round((p.posicao /  (tamanhoTabuleiro)) * 100) + '%';
    barra.style.width =  pctg;
    barra.innerHTML = `<p>${pctg}</p>`

}

function verifica(chute) {
    const player = jogadores[jogador_atual];
    player.turnos+=1;
    if (carta_atual.real === chute) {
        // acerto
        anuncia(true)
        rato_firula();
        player.acertos++;
    }
    else {
        //erro
        anuncia(false)
        player.posicao -= movimento;
    }
    atualizarBarra(player.indice);
    if (player.posicao == tabuleiro.length-1) {finalizarJogo(); return;}
    tab3d.moveTo(player.indice, player.posicao)
    proximoTurno();
}

function finalizarJogo(){
    // pegar os tops
    const $vencedor = document.querySelector('#top_player')
    $vencedor.querySelector('p').innerText = jogadores[jogador_atual].personagem;
    $vencedor.querySelector('img').setAttribute('src', jogadores[jogador_atual].imagem);

    const $dado = document.querySelector('#top_dado')
    const rolador = jogadores
                    .filter(j => j.ativo == true)
                    .reduce((max, obj) => {return(obj.dados/obj.turnos > max.dados/max.turnos) ? obj : max})
    $dado.querySelector('p').innerText = rolador.personagem;
    $dado.querySelector('img').setAttribute('src', rolador.imagem);

    const $chute = document.querySelector('#top_chute')
    const chutador = jogadores.filter(j => j.ativo == true).reduce((max, obj) => {return (obj.acertos/obj.turnos > max.acertos/max.turnos) ? obj : max})
    console.log(chutador)
    $chute.querySelector('p').innerText = chutador.personagem;
    $chute.querySelector('img').setAttribute('src', chutador.imagem);



    //tocar audio do vencedor
    trocaTela($podio);
}

import textos from './textos.json' with {type: 'json'}

function anuncia(acertou){
    const elemento = document.createElement('p')
    let i = Math.floor(Math.random()*5)
    if (acertou){
        elemento.innerText = textos.acerto[i];
    }
    else{
        elemento.innerText = textos.erro[i];
    }
    elemento.classList.add('anuncio')
    document.body.appendChild(elemento);
    setTimeout(() => {document.body.removeChild(elemento)}, 1900)
}

function proximoTurno(){
    setTurno(getNextPlayer())
    trocaTela($tabuleiro);
}



function rato_firula() {
    const rato = document.getElementById('rato');
    if (!rato) return;
    rato.classList.remove('spinner');
    setTimeout(() => rato.classList.add('spinner'), 100);
}

/* ======= Cursor / drag logic ======= */
/**
 * Add selectors to each `.cursor` container and make them draggable.
 * Each selector gets a `player` attribute indicating its player index.
 */
function cursores() {
    document.querySelectorAll('.cursor').forEach((elemento, index) => {
        const seletor = document.createElement('div');
        seletor.classList.add('seletor');
        seletor.classList.add('player' + (index + 1));
        seletor.setAttribute('player', index + 1);
        elemento.appendChild(seletor);
        dragElement(seletor);
    });

    function dragElement(elmnt) {
        // track last client coordinates so we can use elementFromPoint on release
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        // start drag from the element itself
        elmnt.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
            elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
        }

        function closeDragElement() {
            // Use the last recorded cursor client coordinates (pos3, pos4)
            // Temporarily disable pointerEvents on the dragged element so
            // elementFromPoint returns the element underneath.
            const lastClientX = pos3;
            const lastClientY = pos4;
            const prevPointerEvents = elmnt.style.pointerEvents;
            try {
                elmnt.style.pointerEvents = 'none';
                const target = document.elementFromPoint(lastClientX, lastClientY);
                if (target) {
                    // If dropped over a character, log it (or handle selection)
                    const personagem = target.getAttribute('character') || target.closest('[character]')?.getAttribute('character');
                    elmnt.setAttribute('character', personagem || '');
                    let info_personagem = Personagens.find(p => p.character === personagem) || null;
                    if (info_personagem) {
                        const imgUrl = info_personagem.imagem;
                        elmnt.parentElement.style.backgroundImage = `url("${imgUrl}")`;
                        elmnt.parentElement.style.backgroundSize = 'cover';
                        elmnt.parentElement.style.backgroundRepeat = 'no-repeat';
                        elmnt.parentElement.style.backgroundPosition = 'center';
                    }
                    else{
                        elmnt.parentElement.style.backgroundImage = '';
                    }
                }
            } finally {
                elmnt.style.pointerEvents = prevPointerEvents || '';
            }
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

/* ======= Startup / wiring ======= */
function init() {
    // wire buttons

    trocaTela($entrada);
    if ($feiki) $feiki.addEventListener('click', () => verifica(false));
    if ($real) $real.addEventListener('click', () => verifica(true));
    if ($confirmaPersonagens) $confirmaPersonagens.addEventListener('click', () => confirmaPersonagens());
    if ($iniciar_jogo) $iniciar_jogo.addEventListener('click', () => trocaTela($selecao));
    if ($copo) $copo.addEventListener('click', clicarCopo);

    window.addEventListener('keydown', (e) => {
        if (e.key == 'q')
            console.log(jogadores);
    })
    // initial card

    // setup cursors
    cursores();
}

// start the app
init();

