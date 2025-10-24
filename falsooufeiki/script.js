import deck from './quiz.json' with {type: 'json'}


const TEMAS = ['raluca', 'politica', 'podcasts', 'politiquetes', 'celebretes', 'davy jones', 'alanzoka']
let carta_atual = {tema: "", texto:"", real: false};
let jogadores = [{personagem: "", score: 0}]
let jogador_atual = 0;

document.querySelector('#feiki').addEventListener('click', (e) => {
    verifica(false)
});
document.querySelector('#real').addEventListener('click', (e) => {
    verifica(true)
});


function gerarTabuleiro(tamanho){
    return Array.from({length: tamanho}, () => Math.floor(Math.random() * TEMAS.length));
}

function deck_pull(){
    let carta = deck[Math.floor(Math.random() * deck.length)];
    console.log(deck)
    console.log(carta)
    deck.splice(deck.indexOf(carta), 1);
    return carta;
}

function carta_tema(tema){
    let cartas = deck.filter((carta) => {carta.tema == tema});
    let selecionada = cartas[Math.floor(Math.random()*cartas.length)];
    cartas.splice(selecionada, 1);
}

function mostra_carta(carta){
    document.querySelector('#carta p').innerHTML = carta.texto;
}

function verifica(chute){
    if (carta_atual.real == chute){
        rato_firula();
        jogadores[jogador_atual].score++;   
    }
    else {
        
    }
    carta_atual = deck_pull();
    mostra_carta(carta_atual);
}

function rato_firula(){
    const rato = document.getElementById('rato');
    rato.classList.remove('spinner');
    setTimeout(() => {
        rato.classList.add('spinner');
    }, 100);
}
